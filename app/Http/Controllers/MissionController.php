<?php

namespace App\Http\Controllers;

use App\Models\Mission;
use App\Services\ModerationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MissionController extends Controller
{
    protected $moderationService;
    protected $taskService;
    protected $matchmakingService;
    protected $geocodingService;

    public function __construct(
        ModerationService $moderationService, 
        \App\Services\TaskProcessingService $taskService,
        \App\Services\MatchmakingService $matchmakingService,
        \App\Services\GeocodingService $geocodingService
    )
    {
        $this->moderationService = $moderationService;
        $this->taskService = $taskService;
        $this->matchmakingService = $matchmakingService;
        $this->geocodingService = $geocodingService;
    }

    public function create(Request $request)
    {
        $prefillTitle = $request->query('title', '');
        $aiTitle = null;

        $aiTitle = $request->query('improved_title'); 
        
        if (!$aiTitle && !empty($prefillTitle)) {
            $prompt = "You are an AI for Oflem, a premium Swiss help platform.
            The user has provided a raw mission title: \"{$prefillTitle}\".
            
            Your goal is to create a more comprehensive, professional, and clear version of this title while keeping it short (max 5-8 words).
            
            Example:
            Input: \"clean my room\"
            Output: \"Professional Room Cleaning & Tidying Service\"

            Return ONLY the improved title as a raw string.";

            $aiResult = $this->taskService->generateContent($prompt);
            $aiTitle = is_array($aiResult) ? ($aiResult['improved_title'] ?? $aiResult['text'] ?? $prefillTitle) : ($aiResult ?: $prefillTitle);
        }
        
        return Inertia::render('Missions/Create', [
            'prefillTitle' => $prefillTitle,
            'aiTitle' => $aiTitle,
        ]);
    }

    public function search()
    {
        return Inertia::render('Missions/Search');
    }

    public function aiRewrite(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $draftDescription = $request->description ?? 'None';
        
        $prompt = "You are an AI for Oflem, a premium Swiss help platform.
        
        The user has provided a mission title and potentially a draft description.
        Your goal is to REPHRASE, EXPAND, and PROFESSIONALIZE their input into a high-quality mission description.
        
        Input Context:
        Title: \"{$request->title}\"
        Draft Description: \"{$draftDescription}\"

        Instructions:
        1. If a draft description exists, fix its grammar, make it polite, and add necessary professional details while keeping the core intent.
        2. If no description exists, generate a creative one based solely on the title.
        3. The tone should be helpful, clear, and Swiss-quality professional.
        4. For the title: Create a very short, punchy summary (Max 3-6 words).

        CRITICAL INSTRUCTION: Return ONLY a raw JSON object (no markdown, no backticks).
        The JSON must strictly follow this structure:
        {
            \"improved_title\": \"Short & Punchy Title (3-6 words)\",
            \"improved_description\": \"The polished, professional description.\"
        }";

        // We'll use a raw prompt call if TaskProcessingService supports it, 
        // otherwise we'll adapt analyzeTask to handle this context.
        // For now, let's assume analyzeTask can be reused or we use a slightly more generic approach.
        
        $aiResult = $this->taskService->generateContent($prompt);
        
        // If the AI results are returned in the standard format, we might need to adjust.
        // But since we asked for specific keys in the prompt, let's try to extract them.
        
        return response()->json([
            'improved_title' => $aiResult['improved_title'] ?? $request->title,
            'improved_description' => $aiResult['improved_description'] ?? ($aiResult['summary'] ?? "I need help with: " . $request->title),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'lat' => 'nullable|numeric|between:-90,90',
            'lng' => 'nullable|numeric|between:-180,180',
            'exact_address' => 'nullable|string|max:500',
            'date_time' => 'nullable|date',
            'budget' => 'nullable|numeric',
            'price_type' => 'required|in:fixed,open',
            'additional_details' => 'nullable|string',
        ]);

        $content = $validated['title'] . ' ' . ($validated['description'] ?? '');

        // Tier 1: Fast Regex Check
        if (!$this->moderationService->isCleanFast($content)) {
            return back()->withErrors(['title' => 'Content violates keyword moderation rules.']);
        }

        // Tier 2: Deep AI Check (Contextual/Semantic)
        if (!$this->moderationService->isCleanAI($content)['is_clean']) {
            return back()->withErrors(['title' => 'Content violates our professional standards (Contextual Check).']);
        }

        $validated = $this->enrichMissionData($validated);

        if (empty($validated['lat']) || empty($validated['lng'])) {
            if (!empty($validated['location'])) {
                $geocoded = $this->geocodingService->geocode($validated['location']);
                if ($geocoded) {
                    $validated['lat'] = $geocoded['lat'];
                    $validated['lng'] = $geocoded['lng'];
                    $validated['location'] = $geocoded['address'] ?? $validated['location'];
                }
            }
        }

        if (!Auth::check()) {
            // Save to session and signal need for auth
            session(['pending_mission' => $validated]);
            return redirect()->route('missions.matchmaking-preview');
        }

        $mission = Mission::create(array_merge($validated, [
            'user_id' => Auth::id(),
            'status' => 'open',
        ]));

        return redirect()->route('missions.matchmaking', $mission->id)->with('success', 'Mission created successfully!');
    }

    /**
     * Reusable logic to enrich mission data with AI analysis and requirements.
     */
    protected function enrichMissionData(array $data): array
    {
        // Add AI analysis
        $aiAnalysis = $this->taskService->analyzeTask($data['title'] . ' ' . ($data['description'] ?? ''));
        $data['category'] = $aiAnalysis['category'] ?? 'Other';
        
        // Extract Requirements (Skills)
        $requirements = $this->taskService->extractMissionRequirements($data['title'], $data['description'] ?? '');
        $requirementsJson = json_encode($requirements);
        
        $data['additional_details'] = ($data['additional_details'] ?? '') . 
            "\n\nAI Summary: " . ($aiAnalysis['summary'] ?? '') . 
            "\n\n[REQUIREMENTS]{$requirementsJson}[/REQUIREMENTS]";

        return $data;
    }

    public function checkModeration(Request $request)
    {
        $request->validate(['content' => 'required|string']);
        $content = $request->content;

        // Start with Fast check for speed
        $isClean = $this->moderationService->isCleanFast($content);
        $violations = $isClean ? [] : $this->moderationService->getViolations($content);
        
        // If it passes fast check and content is long enough, do AI check
        $aiResult = null;
        if ($isClean && strlen($content) > 3) { // Lowered threshold to catch short titles like "clean"
            $aiData = $this->moderationService->isCleanAI($content);
            $isClean = $aiData['is_clean'];
            if (!$isClean) {
                $violations = ['contextual_violation'];
            } else {
                $aiResult = $aiData['improved_title'];
            }
        }

        Log::info('Moderation Check Result:', [
            'content' => $content,
            'is_clean' => $isClean,
            'violations' => $violations,
            'improved_title' => $aiResult
        ]);

        return response()->json([
            'is_clean' => $isClean,
            'violations' => $violations,
            'improved_title' => $aiResult
        ]);
    }

    public function handlePendingMission()
    {
        if (Auth::check() && session()->has('pending_mission')) {
            $data = session()->pull('pending_mission');
            
            // Ensure data is enriched if it wasn't already (e.g., if logic changed)
            if (empty($data['category']) || !str_contains($data['additional_details'] ?? '', '[REQUIREMENTS]')) {
                $data = $this->enrichMissionData($data);
            }

            $mission = Mission::create(array_merge($data, [
                'user_id' => Auth::id(),
                'status' => 'open',
            ]));
            return redirect()->route('missions.matchmaking', $mission->id);
        }
        
        return redirect()->route('dashboard');
    }

    public function showMatchmaking(Mission $mission)
    {
        // 1. Extract requirements
        $requirements = [];
        if (preg_match('/\[REQUIREMENTS\](.*?)\[\/REQUIREMENTS\]/s', $mission->additional_details, $matches)) {
            $requirements = json_decode($matches[1], true);
        } else {
            // Fallback: Run AI analysis now if missing
            $requirements = $this->taskService->extractMissionRequirements($mission->title, $mission->description ?? '');
        }

        // 2. Find Matches
        $helpers = $this->matchmakingService->findMatches($requirements, 10, [
            'lat' => $mission->lat,
            'lng' => $mission->lng,
            'radius' => 50 // Standard wide search for suggestions
        ])->map(function($user) {
             return [
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->avatar,
                'rating' => $user->rating ?? 5.0,
                'price' => $user->hourly_rate ?? 0, 
                'reviews_count' => $user->reviews_count ?? 0,
                'verified' => $user->email_verified_at ? true : false,
                'match_score' => $user->match_score ?? 0,
                'matched_skills' => $user->matched_skills ?? []
            ];
        });

        return Inertia::render('Missions/Matchmaking', [
            'mission' => $mission,
            'helpers' => $helpers,
        ]);
    }

    public function guestMatchmakingPreview()
    {
        if (!session()->has('pending_mission')) {
            return redirect()->route('missions.create');
        }

        $missionData = session('pending_mission');

        // 1. Extract requirements from session data
        $requirements = [];
        if (preg_match('/\[REQUIREMENTS\](.*?)\[\/REQUIREMENTS\]/s', $missionData['additional_details'] ?? '', $matches)) {
            $requirements = json_decode($matches[1], true);
        } else {
            $requirements = $this->taskService->extractMissionRequirements($missionData['title'], $missionData['description'] ?? '');
        }

        // 2. Find Matches
        $helpers = $this->matchmakingService->findMatches($requirements, 5, [
            'lat' => $missionData['lat'] ?? null,
            'lng' => $missionData['lng'] ?? null,
            'radius' => 50
        ])->map(function($user) {
             return [
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->avatar,
                'rating' => $user->rating ?? 5.0,
                'price' => $user->hourly_rate ?? 0, 
                'reviews_count' => $user->reviews_count ?? 0,
                'verified' => $user->email_verified_at ? true : false,
                'match_score' => $user->match_score ?? 0,
                'matched_skills' => $user->matched_skills ?? []
            ];
        });

        return Inertia::render('Missions/Matchmaking', [
            'mission' => $missionData,
            'helpers' => $helpers,
            'isGuest' => true,
        ]);
    }

    public function active(Request $request)
    {
        $user = Auth::user();
        $lat = $user->location_lat;
        $lng = $user->location_lng;
        $radius = $user->discovery_radius_km ?? 50; // Default 50km

        $query = Mission::where('status', 'open');

        if ($lat && $lng) {
            // Optimization: Add a bounding box WHERE clause to use indexes before Haversine
            $latRange = $radius / 111;
            $lngRange = $radius / (111 * cos(radians($lat)));

            $query->whereBetween('lat', [$lat - $latRange, $lat + $latRange])
                  ->whereBetween('lng', [$lng - $lngRange, $lng + $lngRange]);

            // Haversine formula to find missions within precise radius
            $query->selectRaw("*, ( 6371 * acos( cos( radians(?) ) * cos( radians( lat ) ) * cos( radians( lng ) - radians(?) ) + sin( radians(?) ) * sin( radians( lat ) ) ) ) AS distance", [$lat, $lng, $lat])
                  ->having("distance", "<=", $radius)
                  ->orderBy("distance");
        } else {
            $query->latest();
        }

        $missions = $query->paginate(10);

        return Inertia::render('Missions/ActiveMissions', [
            'missions' => $missions,
            'userLocation' => ['lat' => $lat, 'lng' => $lng],
            'radius' => $radius
        ]);
    }

    public function show(Mission $mission)
    {
        $mission->load(['user', 'offers.user', 'questions.user']);
        
        // Hide exact address if not assigned or not owner
        $canSeeAddress = Auth::id() === $mission->user_id || Auth::id() === $mission->assigned_user_id;
        
        return Inertia::render('Missions/Details', [
            'mission' => $mission,
            'canSeeAddress' => $canSeeAddress,
        ]);
    }

    public function submitOffer(Request $request, Mission $mission)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'message' => 'nullable|string',
        ]);

        if ($mission->price_type !== 'open') {
            return back()->withErrors(['mission' => 'This mission has a fixed price.']);
        }

        $offer = $mission->offers()->create([
            'user_id' => Auth::id(),
            'amount' => $request->amount,
            'message' => $request->message,
        ]);

        // Notify Mission Owner
        $mission->user->notify(new \App\Notifications\NewOfferNotification($offer));

        return back()->with('success', 'Offer submitted successfully!');
    }

    public function askQuestion(Request $request, Mission $mission)
    {
        $request->validate([
            'question' => 'required|string',
        ]);

        $question = $mission->questions()->create([
            'user_id' => Auth::id(),
            'question' => $request->question,
        ]);

        // Notify Mission Owner
        $mission->user->notify(new \App\Notifications\NewQuestionNotification($question));

        return back()->with('success', 'Question posted successfully!');
    }

    public function acceptFixedPrice(Mission $mission)
    {
        if ($mission->price_type !== 'fixed') {
            return back()->withErrors(['mission' => 'This mission requires an offer.']);
        }

        if ($mission->status !== 'open') {
            return back()->withErrors(['mission' => 'This mission is no longer available.']);
        }

        $mission->update([
            'status' => 'assigned',
            'assigned_user_id' => Auth::id(),
        ]);

        // Notify Mission Owner (Optional, but let's notify the performer as well or just status change)
        // Actually, performer is the one who accepted, so notify the host?
        // Let's notify the host that someone accepted their fixed price.
        // Wait, performers accept fixed price. So notify host.
        // But the Notification class I made is "MissionAssigned" which is usually for the performer.
        // Let's create a generic notification or use the assigned one for the performer.
        Auth::user()->notify(new \App\Notifications\MissionAssignedNotification($mission));

        return redirect()->route('missions.show', $mission->id)->with('success', 'Mission accepted! You can now see the exact address.');
    }

    public function selectOffer(Request $request, Mission $mission, \App\Models\MissionOffer $offer)
    {
        if (Auth::id() !== $mission->user_id) {
            abort(403);
        }

        $mission->update([
            'status' => 'assigned',
            'assigned_user_id' => $offer->user_id,
            'budget' => $offer->amount, // Finalize budget based on offer
        ]);

        $offer->update(['status' => 'accepted']);
        $mission->offers()->where('id', '!=', $offer->id)->update(['status' => 'rejected']);

        // Notify Performer
        $offer->user->notify(new \App\Notifications\MissionAssignedNotification($mission));

        return back()->with('success', 'Performer selected and mission assigned!');
    }

    public function answerQuestion(Request $request, Mission $mission, \App\Models\MissionQuestion $question)
    {
        if (Auth::id() !== $mission->user_id) {
            abort(403);
        }

        $request->validate([
            'answer' => 'required|string',
        ]);

        $question->update([
            'answer' => $request->answer,
        ]);

        return back()->with('success', 'Answer posted successfully!');
    }

    public function finish(Mission $mission)
    {
        if (Auth::id() !== $mission->user_id) {
            abort(403);
        }

        if ($mission->status !== 'assigned') {
            return back()->withErrors(['mission' => 'Only assigned missions can be marked as finished.']);
        }

        $mission->update(['status' => 'finished']);

        return back()->with('success', 'Mission marked as finished! You can now leave a review.');
    }

    public function submitReview(Request $request, Mission $mission)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        // Only host or performer can review (depending on mission status)
        $userId = Auth::id();
        $isHost = $userId === $mission->user_id;
        $isPerformer = $userId === $mission->assigned_user_id;

        if (!$isHost && !$isPerformer) {
            abort(403);
        }

        if ($mission->status !== 'finished') {
            return back()->withErrors(['mission' => 'Reviews can only be submitted for finished missions.']);
        }

        // Determine who is being reviewed
        $targetUserId = $isHost ? $mission->assigned_user_id : $mission->user_id;

        if (!$targetUserId) {
            return back()->withErrors(['mission' => 'Target user not found.']);
        }

        \App\Models\Review::updateOrCreate(
            [
                'mission_id' => $mission->id,
                'reviewer_id' => $userId,
            ],
            [
                'user_id' => $targetUserId,
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]
        );

        return back()->with('success', 'Review submitted successfully!');
    }
}
