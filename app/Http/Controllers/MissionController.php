<?php

namespace App\Http\Controllers;

use App\Models\Mission;
use App\Models\User;
use App\Models\Chat;
use App\Models\Message;
use App\Services\ModerationService;
use App\Notifications\NearbyMissionNotification;
use App\Notifications\OfferRejectedNotification;
use App\Events\QuestionPosted;
use App\Events\AnswerPosted;
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
        $prefillTitle = $request->query('title') ?? $request->query('search', '');
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
            'date_time' => 'nullable|date|after_or_equal:now',
            'budget' => 'nullable|numeric|min:10',
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
            'status' => Mission::STATUS_OUVERTE,
        ]));

        // Trigger nearby notifications for performers
        if ($mission->lat && $mission->lng) {
            $nearbyUsers = User::nearby($mission->lat, $mission->lng)
                ->where('id', '!=', Auth::id()) // Don't notify the owner
                ->get();

            foreach ($nearbyUsers as $nearbyUser) {
                $nearbyUser->notify(new NearbyMissionNotification($mission));
            }
        }

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
                'status' => Mission::STATUS_OUVERTE,
            ]));
            return redirect()->route('missions.matchmaking', $mission->id);
        }
        
        return redirect()->route('dashboard');
    }

    public function showMatchmaking(Mission $mission)
    {
        if (Auth::id() != $mission->user_id && !Auth::user()->isAdmin()) {
            abort(403);
        }

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
                'profile_photo' => $user->profile_photo_url,
                'rating' => $user->average_rating,
                'price' => $user->providerProfile?->hourly_rate ?? 0,
                'reviews_count' => $user->total_reviews,
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
                'profile_photo' => $user->profile_photo_url,
                'rating' => $user->average_rating,
                'price' => $user->providerProfile?->hourly_rate ?? 0,
                'reviews_count' => $user->total_reviews,
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
        
        // Get filter inputs
        $radius = $request->query('radius', $user->discovery_radius_km ?? 10);
        $filters = $request->only(['search', 'budget_min', 'budget_max', 'start_date', 'end_date', 'categories']);
        $sortBy = $request->query('sort_by', 'distance');

        $query = Mission::where('status', Mission::STATUS_OUVERTE)
            ->filter($filters);

        // Geolocation filtering
        if ($lat && $lng) {
            // Precise radius filtering with Haversine
            $query->withinDistance($lat, $lng, $radius);
        }

        // Sorting
        switch ($sortBy) {
            case 'newest':
                $query->latest();
                break;
            case 'budget':
                $query->orderBy('budget', 'desc');
                break;
            case 'deadline':
                $query->orderBy('date_time', 'asc');
                break;
            case 'distance':
            default:
                if ($lat && $lng) {
                    $query->orderBy('distance', 'asc');
                } else {
                    $query->latest();
                }
                break;
        }

        $missions = $query->paginate(12)->withQueryString();

        return Inertia::render('Missions/ActiveMissions', [
            'missions' => $missions,
            'userLocation' => ['lat' => $lat, 'lng' => $lng],
            'currentFilters' => array_merge($filters, [
                'radius' => $radius,
                'sort_by' => $sortBy
            ]),
        ]);
    }

    public function show(Mission $mission)
    {
        $mission->load(['user', 'offers.user', 'questions.user']);
        
        // Hide exact address if not assigned or not owner
        $canSeeAddress = $mission->canSeeFullAddress(Auth::user());
        
        return Inertia::render('Missions/Details', [
            'mission' => $mission,
            'canSeeAddress' => $canSeeAddress,
        ]);
    }

    public function edit(Mission $mission)
    {
        // Verify user is mission owner
        if (Auth::id() != $mission->user_id) {
            abort(403, 'You can only edit your own missions.');
        }

        // Only allow editing if mission is still open
        if ($mission->status !== Mission::STATUS_OUVERTE) {
            return redirect()->route('missions.show', $mission->id)
                ->withErrors(['mission' => 'You can only edit missions that are still open.']);
        }

        return Inertia::render('Missions/Edit', [
            'mission' => $mission,
        ]);
    }

    public function update(Request $request, Mission $mission)
    {
        // Verify user is mission owner
        if (Auth::id() != $mission->user_id) {
            abort(403, 'You can only edit your own missions.');
        }

        // Only allow editing if mission is still open
        if ($mission->status !== Mission::STATUS_OUVERTE) {
            return back()->withErrors(['mission' => 'You can only edit missions that are still open.']);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'budget' => 'nullable|numeric|min:10',
            'date_time' => 'nullable|date|after_or_equal:now',
            'category' => 'nullable|string|max:100',
        ]);

        // Run moderation checks on updated content
        $content = $validated['title'] . ' ' . ($validated['description'] ?? '');
        
        if (!$this->moderationService->isCleanFast($content)) {
            return back()->withErrors(['title' => 'Content violates keyword moderation rules.']);
        }

        if (!$this->moderationService->isCleanAI($content)['is_clean']) {
            return back()->withErrors(['title' => 'Content violates our professional standards.']);
        }

        $mission->update($validated);

        return redirect()->route('missions.show', $mission->id)
            ->with('success', 'Mission updated successfully!');
    }

    public function updateStatus(Request $request, Mission $mission)
    {
        // Verify user is mission owner
        if (Auth::id() != $mission->user_id) {
            abort(403, 'You can only update the status of your own missions.');
        }

        $request->validate([
            'status' => 'required|string|in:OUVERTE,ANNULEE',
        ]);

        $newStatus = $request->status;
        $currentStatus = $mission->status;

        // Define allowed status transitions for mission owners
        $allowedTransitions = [
            Mission::STATUS_OUVERTE => [Mission::STATUS_ANNULEE],
            Mission::STATUS_EN_NEGOCIATION => [Mission::STATUS_OUVERTE, Mission::STATUS_ANNULEE],
            Mission::STATUS_VERROUILLEE => [Mission::STATUS_OUVERTE, Mission::STATUS_ANNULEE],
        ];

        // Check if transition is allowed
        if (!isset($allowedTransitions[$currentStatus]) || 
            !in_array($newStatus, $allowedTransitions[$currentStatus])) {
            return back()->withErrors([
                'status' => 'Cannot change status from ' . $currentStatus . ' to ' . $newStatus
            ]);
        }

        // Special handling for reopening missions
        if ($newStatus === Mission::STATUS_OUVERTE && $currentStatus !== Mission::STATUS_OUVERTE) {
            // Clear assignment when reopening
            $mission->assigned_user_id = null;
            
            // Reject all pending offers
            $mission->offers()->where('status', 'pending')->update(['status' => 'rejected']);
        }

        // Store old status before transition
        $oldStatus = $mission->status;
        
        $mission->transitionTo($newStatus);

        // Broadcast status update event with both mission and old status
        event(new \App\Events\MissionStatusUpdated($mission, $oldStatus));

        return back()->with('success', 'Mission status updated successfully!');
    }

    public function submitOffer(Request $request, Mission $mission)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'message' => 'nullable|string',
        ]);

        if ($mission->status !== Mission::STATUS_OUVERTE) {
        return back()->withErrors(['mission' => 'This mission is no longer accepting offers.']);
    }

    /* 
    if ($mission->price_type !== 'open') {
            return back()->withErrors(['mission' => 'This mission has a fixed price.']);
        }
    */
        
        // Prevent mission owner from submitting offers on their own mission
        if ($mission->user_id == Auth::id()) {
            return back()->withErrors(['mission' => 'You cannot submit an offer on your own mission.']);
        }
        
        // Prevent duplicate offers from the same user
        $existingOffer = $mission->offers()
            ->where('user_id', Auth::id())
            ->where('status', '!=', 'rejected')
            ->first();
            
        if ($existingOffer) {
            return back()->withErrors(['mission' => 'You have already submitted an offer for this mission.']);
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
        // Only Motivés (performers) can ask questions, not mission owners
        if (Auth::id() == $mission->user_id) {
            return back()->withErrors(['question' => 'Mission owners cannot ask questions on their own missions.']);
        }

        // Ensure user is a performer
        if (!Auth::user()->isPerformer()) {
            return back()->withErrors(['question' => 'Only performers can ask questions about missions.']);
        }

        $request->validate([
            'question' => 'required|string',
        ]);

        $question = $mission->questions()->create([
            'user_id' => Auth::id(),
            'question' => $request->question,
        ]);

        // Notify Mission Owner
        $mission->user->notify(new \App\Notifications\NewQuestionNotification($question));
        
        // Dispatch Real-time Event
        event(new \App\Events\QuestionPosted($question));

        return back()->with('success', 'Question posted successfully!');
    }

    public function acceptFixedPrice(Mission $mission)
    {
        if ($mission->price_type !== 'fixed') {
            return back()->withErrors(['mission' => 'This mission requires an offer.']);
        }

        // Prevent self-acceptance
        if ($mission->user_id == Auth::id()) {
            return back()->withErrors(['mission' => 'You cannot accept your own mission.']);
        }

        if (!$mission->canTransitionTo(Mission::STATUS_EN_NEGOCIATION)) {
            return back()->withErrors(['mission' => 'This mission is no longer available.']);
        }

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($mission, &$pi, &$message) {
                $mission->transitionTo(Mission::STATUS_EN_NEGOCIATION);
                $mission->assigned_user_id = Auth::id();
                $mission->save();

                // Create Stripe payment intent
                $pi = app(\App\Services\StripeService::class)->createHold($mission);

                // Create or get chat
                $chat = Chat::firstOrCreate([
                    'mission_id' => $mission->id,
                ], [
                    'participant_ids' => [$mission->user_id, Auth::id()],
                ]);

                // Send initial message from performer
                $message = $chat->messages()->create([
                    'user_id' => Auth::id(),
                    'content' => "Hello! I've accepted your mission instantly. Looking forward to working together!",
                ]);

                $chat->touch('last_message_at');
            });

            // Notify and Broadcast after transaction
            if (isset($message)) {
                broadcast(new \App\Events\MessageSent($message->load('user:id,name,avatar')));
                $mission->user->notify(new \App\Notifications\NewMessageNotification($message));
            }

            // Notify Mission Owner about assignment
            $mission->user->notify(new \App\Notifications\MissionAssignedNotification($mission));

            return redirect()->route('missions.show', $mission->id)
                ->with('success', 'Mission accepted! Please complete the payment hold.')
                ->with('stripe_client_secret', $pi->client_secret)
                ->with('chat_id', $chat->id);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Accept Mission Failed: ' . $e->getMessage());
            return back()->withErrors(['mission' => 'Failed to accept mission. Please try again.']);
        }
    }


    public function hire(Request $request, Mission $mission, User $performer)
    {
        if (Auth::id() != $mission->user_id && !Auth::user()->isAdmin()) {
            abort(403);
        }

        // Prevent self-hiring
        if ($mission->user_id === $performer->id) {
            return response()->json(['message' => 'You cannot hire yourself for your own mission.'], 422);
        }

        if ($mission->status !== Mission::STATUS_OUVERTE) {
            return response()->json(['message' => 'Mission is no longer open for hiring.'], 422);
        }

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($mission, $performer, &$pi) {
                $mission->transitionTo(Mission::STATUS_EN_NEGOCIATION);
                $mission->assigned_user_id = $performer->id;
                $mission->save();

                // Create Stripe payment intent (Escrow Hold)
                $pi = app(\App\Services\StripeService::class)->createHold($mission);
                
                // Check if there's an offer from this user before updating
                $existingOffer = $mission->offers()->where('user_id', $performer->id)->first();
                if ($existingOffer) {
                    $existingOffer->update(['status' => 'accepted']);
                }
                
                // Reject other offers
                $mission->offers()->where('user_id', '!=', $performer->id)->update(['status' => 'rejected']);
            });

            // Notify Performer
            $performer->notify(new \App\Notifications\MissionAssignedNotification($mission));

            // Create or get chat for the redirect
            $chat = \App\Models\Chat::firstOrCreate([
                'mission_id' => $mission->id,
            ], [
                'participant_ids' => [$mission->user_id, $performer->id],
            ]);

            return redirect()->route('missions.show', $mission->id)
                ->with('success', 'Performer hired successfully! Please complete the payment hold.')
                ->with('stripe_client_secret', $pi->client_secret)
                ->with('chat_id', $chat->id);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Direct Hire Failed: ' . $e->getMessage());
            return back()->withErrors(['mission' => 'Failed to hire performer. ' . $e->getMessage()]);
        }
    }

    public function selectOffer(Request $request, Mission $mission, \App\Models\MissionOffer $offer)
    {
        if (Auth::id() != $mission->user_id && !Auth::user()->isAdmin()) {
            abort(403);
        }

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($mission, $offer, &$pi) {
                $mission->transitionTo(Mission::STATUS_EN_NEGOCIATION);
                $mission->assigned_user_id = $offer->user_id;
                $mission->budget = $offer->amount; // Finalize budget based on offer
                $mission->save();

                // Create Stripe payment intent
                $pi = app(\App\Services\StripeService::class)->createHold($mission);
                
                // Update offer statuses inside transaction
                $offer->update(['status' => 'accepted']);
                $mission->offers()->where('id', '!=', $offer->id)->update(['status' => 'rejected']);
            });

            // Notify Performer
            $offer->user->notify(new \App\Notifications\MissionAssignedNotification($mission));

            // Notify Rejected Performers
            $mission->offers()
                ->where('id', '!=', $offer->id)
                ->whereNotNull('user_id')
                ->get()
                ->each(function($o) use ($mission) {
                    $o->user->notify(new \App\Notifications\OfferRejectedNotification($mission));
                });

            // Create or get chat for the success redirect
            $chat = \App\Models\Chat::firstOrCreate([
                'mission_id' => $mission->id,
            ], [
                'participant_ids' => [$mission->user_id, $offer->user_id],
            ]);

            return back()
                ->with('success', 'Performer selected! Please complete the payment hold.')
                ->with('stripe_client_secret', $pi->client_secret)
                ->with('chat_id', $chat->id);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Select Offer Failed: ' . $e->getMessage());
            return back()->withErrors(['mission' => 'Failed to select offer. Please try again.']);
        }
    }

    public function confirmAssignment(Mission $mission)
    {
        if (Auth::id() != $mission->user_id && !Auth::user()->isAdmin()) {
            abort(403);
        }

        if (!$mission->canTransitionTo(Mission::STATUS_VERROUILLEE)) {
            return back()->withErrors(['mission' => 'Cannot confirm assignment in current state.']);
        }

        // Wrap operations in transaction to ensure atomicity
        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($mission) {
                $mission->transitionTo(Mission::STATUS_VERROUILLEE);
                $mission->revealAddress();
            });
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Confirm Assignment Failed: ' . $e->getMessage());
            return back()->withErrors(['mission' => 'Failed to confirm assignment. Please try again.']);
        }

        $chat = \App\Models\Chat::firstOrCreate([
            'mission_id' => $mission->id,
        ], [
            'participant_ids' => [$mission->user_id, $mission->assigned_user_id],
        ]);

        return back()
            ->with('success', 'Assignment confirmed! The performer can now start work and see your address.')
            ->with('chat_id', $chat->id);
    }

    public function startWork(Mission $mission)
    {
        // Add null check for assigned_user_id to prevent unauthorized access
        if (!$mission->assigned_user_id || Auth::id() != $mission->assigned_user_id) {
            abort(403);
        }

        if (!$mission->canTransitionTo(Mission::STATUS_EN_COURS)) {
            return back()->withErrors(['mission' => 'Cannot start work in current state.']);
        }

        $mission->transitionTo(Mission::STATUS_EN_COURS);

        return back()->with('success', 'Work started!');
    }

    public function submitForValidation(Request $request, Mission $mission)
    {
        // Add null check for assigned_user_id to prevent unauthorized access
        if (!$mission->assigned_user_id || Auth::id() != $mission->assigned_user_id) {
            abort(403);
        }

        if (!$mission->canTransitionTo(Mission::STATUS_EN_VALIDATION)) {
            return back()->withErrors(['mission' => 'Cannot submit for validation in current state.']);
        }

        // Validate proof of completion
        $validated = $request->validate([
            'completion_proof' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120', // 5MB max
            'completion_notes' => 'nullable|string|max:1000',
        ]);

        // Handle file upload
        if ($request->hasFile('completion_proof')) {
            $path = $request->file('completion_proof')->store('mission_proofs', 'public');
            $mission->completion_proof_path = $path;
        }

        if ($request->filled('completion_notes')) {
            $mission->completion_notes = $request->completion_notes;
        }

        $mission->transitionTo(Mission::STATUS_EN_VALIDATION);

        // Notify customer
        $mission->user->notify(new \App\Notifications\MissionReadyForValidationNotification($mission));

        return back()->with('success', 'Mission submitted for validation! The host has 72 hours to validate.');
    }

    public function answerQuestion(Request $request, Mission $mission, \App\Models\MissionQuestion $question)
    {
        if (Auth::id() != $mission->user_id) {
            abort(403);
        }

        $request->validate([
            'answer' => 'required|string',
        ]);

        $question->update([
            'answer' => $request->answer,
        ]);

        // Dispatch Real-time Event
        event(new \App\Events\AnswerPosted($question));

        return back()->with('success', 'Answer posted successfully!');
    }

    public function validateCompletion(Mission $mission)
    {
        if (Auth::id() != $mission->user_id) {
            abort(403, 'Only the mission owner can validate completion.');
        }

        if (!$mission->canTransitionTo(Mission::STATUS_TERMINEE)) {
            return back()->withErrors(['mission' => 'This mission cannot be validated in its current state.']);
        }

        $mission->transitionTo(Mission::STATUS_TERMINEE);
        
        // Release funds to performer (Stripe)
        app(\App\Services\StripeService::class)->releaseFunds($mission);

        // Update Performer Virtual Balance
        $payment = \App\Models\Payment::where('mission_id', $mission->id)->first();
        if ($payment && $mission->assignedUser) {
            $mission->assignedUser->increment('balance', $payment->performer_amount);
        }

        // Notify performer
        if ($mission->assignedUser) {
            $mission->assignedUser->notify(new \App\Notifications\MissionCompletedNotification($mission));
        }


        return back()->with('success', 'Mission validated! Payment has been released to the performer.');
    }

    public function initiateDispute(Request $request, Mission $mission)
    {
        if (Auth::id() != $mission->user_id) {
            abort(403, 'Only the mission owner can initiate a dispute.');
        }

        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        if (!$mission->canTransitionTo(Mission::STATUS_EN_LITIGE)) {
            return back()->withErrors(['mission' => 'Cannot initiate dispute in current state.']);
        }

        $mission->update(['dispute_reason' => $request->reason]);
        $mission->transitionTo(Mission::STATUS_EN_LITIGE);

        // Notify admin about dispute
        $admins = User::where('is_admin', true)->get();
        foreach ($admins as $admin) {
            $admin->notify(new \App\Notifications\DisputeInitiatedNotification($mission));
        }

        // Notify performer
        if ($mission->assignedUser) {
            $mission->assignedUser->notify(new \App\Notifications\MissionDisputedNotification($mission));
        }

        return back()->with('success', 'Dispute initiated. An admin will review your case.');
    }


    public function cancel(Mission $mission)
    {
        // Add explicit null checks for assigned_user_id
        $isOwner = Auth::id() == $mission->user_id;
        $isAssigned = $mission->assigned_user_id && Auth::id() == $mission->assigned_user_id;
        
        if (!$isOwner && !$isAssigned) {
            abort(403);
        }

        if (!$mission->canTransitionTo(Mission::STATUS_ANNULEE)) {
            return back()->withErrors(['mission' => 'Cannot cancel mission in current state.']);
        }

        // Check if payment was already made and needs refund
        $needsRefund = in_array($mission->status, [
            Mission::STATUS_VERROUILLEE,
            Mission::STATUS_EN_COURS,
            Mission::STATUS_EN_VALIDATION
        ]);

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($mission, $needsRefund) {
                if ($needsRefund && $mission->payment_intent_id) {
                    // Issue refund to customer
                    app(\App\Services\StripeService::class)->refund($mission, 'Mission cancelled');
                }

                $mission->transitionTo(Mission::STATUS_ANNULEE);
            });
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Mission Cancellation Failed: ' . $e->getMessage());
            return back()->withErrors(['mission' => 'Failed to cancel mission. Please contact support.']);
        }

        return back()->with('success', 'Mission cancelled.' . ($needsRefund ? ' Refund has been processed.' : ''));
    }

    public function contactHelper(Mission $mission, User $helper)
    {
        if (Auth::id() != $mission->user_id && !Auth::user()->isAdmin()) {
            abort(403);
        }

        // Validate helper is actually a performer
        if (!$helper->isPerformer()) {
            return back()->withErrors(['helper' => 'This user is not a registered helper.']);
        }

        // Create or find a chat between the owner and the helper for this mission
        $participantIds = [Auth::id(), $helper->id];
        sort($participantIds); // Ensure consistent ordering

        // Use firstOrCreate to avoid duplicate chat creation
        // The unique constraint is on mission_id, so we use that as the search criteria
        $chat = Chat::firstOrCreate(
            [
                'mission_id' => $mission->id,
            ],
            [
                'participant_ids' => $participantIds,
                'status' => 'active',
                'last_message_at' => now(),
            ]
        );

        // Add an initial system message only if chat was just created
        if ($chat->wasRecentlyCreated) {
            $chat->messages()->create([
                'user_id' => null, // System
                'content' => 'Conversation started regarding mission: ' . $mission->title,
                'is_system_message' => true,
            ]);
        }

        return redirect()->route('messages', ['chat_id' => $chat->id]);
    }

    public function submitReview(Request $request, Mission $mission)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        // Only host or performer can review (depending on mission status)
        $userId = Auth::id();
        $isHost = $userId == $mission->user_id;
        $isPerformer = $userId == $mission->assigned_user_id;

        if (!$isHost && !$isPerformer) {
            abort(403);
        }

        if ($mission->status !== Mission::STATUS_TERMINEE) {
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

    public function getNearbyMotives(Mission $mission)
    {
        // Only mission owner can view nearby Motivés
        if (Auth::id() !== $mission->user_id) {
            abort(403, 'Only the mission owner can view nearby helpers.');
        }

        // Extract mission requirements for matching
        $requirements = [];
        if ($mission->additional_details) {
            // Try to extract [REQUIREMENTS] from additional_details
            if (preg_match('/\[REQUIREMENTS\](.*?)\[\/REQUIREMENTS\]/s', $mission->additional_details, $matches)) {
                $requirements = json_decode($matches[1], true) ?? [];
            }
        }

        // Get nearby Motivés using matchmaking service
        $nearbyMotives = $this->matchmakingService->findMatches(
            $requirements,
            20, // Get up to 20 nearby helpers
            [
                'lat' => $mission->lat,
                'lng' => $mission->lng,
                'radius' => 50 // 50km radius
            ]
        );

        // Filter out mission owner and load additional data
        $nearbyMotives = $nearbyMotives->filter(function($user) use ($mission) {
            return $user->id !== $mission->user_id;
        })->map(function($user) use ($mission) {
            // Calculate distance
            if ($mission->lat && $mission->lng && $user->location_lat && $user->location_lng) {
                $user->distance_km = $this->calculateDistance(
                    $mission->lat,
                    $mission->lng,
                    $user->location_lat,
                    $user->location_lng
                );
            } else {
                $user->distance_km = null;
            }
            
            // Fix profile photo URL
            if ($user->profile_photo) {
                $user->profile_photo_url = '/storage/' . $user->profile_photo;
            } else {
                $user->profile_photo_url = null;
            }
            
            return $user;
        })->values();

        return response()->json([
            'nearby_motives' => $nearbyMotives
        ]);
    }

    public function sendMissionToMotive(Mission $mission, User $motive)
    {
        // Only mission owner can send mission
        if (Auth::id() !== $mission->user_id) {
            abort(403, 'Only the mission owner can send this mission.');
        }

        // Validate motive is a performer
        if (!$motive->isPerformer()) {
            return back()->withErrors(['motive' => 'This user is not a registered helper.']);
        }

        // Create notification for the Motivé
        $motive->notify(new \App\Notifications\MissionInvitationNotification($mission, Auth::user()));

        // Create or get chat
        $participantIds = [Auth::id(), $motive->id];
        sort($participantIds);

        $chat = Chat::firstOrCreate(
            ['mission_id' => $mission->id],
            [
                'participant_ids' => $participantIds,
                'status' => 'active',
                'last_message_at' => now(),
            ]
        );

        // Add system message if chat was just created
        if ($chat->wasRecentlyCreated) {
            $chat->messages()->create([
                'user_id' => null,
                'content' => Auth::user()->name . ' has invited you to this mission: ' . $mission->title,
                'is_system_message' => true,
            ]);
        }

        return back()->with('success', 'Mission sent to ' . $motive->name . ' successfully!');
    }

    // Helper function to calculate distance between two coordinates
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat/2) * sin($dLat/2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon/2) * sin($dLon/2);

        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        $distance = $earthRadius * $c;

        return round($distance, 1);
    }
}
