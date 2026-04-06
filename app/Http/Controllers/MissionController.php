<?php

namespace App\Http\Controllers;

use App\Models\Mission;
use App\Services\ModerationService;
use App\Services\TaskProcessingService;
use App\Services\MatchmakingService;
use App\Services\GeocodingService;
use App\Jobs\ProcessMissionEnrichment;
use App\Services\MissionService;
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
    protected $missionService;

    public function __construct(
        ModerationService $moderationService,
        TaskProcessingService $taskService,
        MatchmakingService $matchmakingService,
        GeocodingService $geocodingService,
        MissionService $missionService
    ) {
        $this->moderationService = $moderationService;
        $this->taskService = $taskService;
        $this->matchmakingService = $matchmakingService;
        $this->geocodingService = $geocodingService;
        $this->missionService = $missionService;
    }

    public function create(Request $request)
    {
        $prefillTitle = $request->query('title') ?? $request->query('search', '');
        $aiTitle = $request->query('improved_title');

        if (!$aiTitle && !empty($prefillTitle)) {
            $prompt = "You are an AI for Oflem, a friendly Swiss help platform. The user has provided a raw mission title: \"{$prefillTitle}\". Create a simple, clear, and human version (max 3-5 words).";
            $aiResult = $this->taskService->generateContent($prompt);
            $aiTitle = is_array($aiResult) ? ($aiResult['improved_title'] ?? $aiResult['text'] ?? $prefillTitle) : ($aiResult ?: $prefillTitle);
        }

        return Inertia::render('Missions/Create', [
            'prefillTitle' => $prefillTitle,
            'aiTitle' => $aiTitle,
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

        if (!$this->moderationService->isCleanFast($content)) {
            return back()->withErrors(['title' => 'Content violates keyword moderation rules.']);
        }

        $validated['category'] = $validated['category'] ?? 'Other';

        if (!Auth::check()) {
            session(['pending_mission' => $validated]);
            return redirect()->route('missions.matchmaking-preview');
        }

        $mission = Mission::create(array_merge($validated, [
            'user_id' => Auth::id(),
            'status' => Mission::STATUS_OUVERTE,
        ]));

        ProcessMissionEnrichment::dispatch($mission);

        return redirect()->route('missions.matchmaking', $mission->id)
            ->with('success', 'Mission created successfully!');
    }

    public function active(Request $request)
    {
        $user = Auth::user();
        $lat = $user->location_lat;
        $lng = $user->location_lng;
        $radius = $request->query('radius', $user->discovery_radius_km ?? 10);
        $filters = $request->only(['search', 'budget_min', 'budget_max', 'start_date', 'end_date', 'categories', 'category']);

        if ($request->has('category') && !$request->has('categories')) {
            $filters['categories'] = [$request->category];
        }

        $sortBy = $request->query('sort_by', 'distance');
        $query = Mission::where('status', Mission::STATUS_OUVERTE)
            ->where('user_id', '!=', Auth::id())
            ->filter($filters);

        if ($lat && $lng) {
            $query->withinDistance($lat, $lng, $radius);
        }

        switch ($sortBy) {
            case 'newest': $query->latest(); break;
            case 'budget': $query->orderBy('budget', 'desc'); break;
            case 'deadline': $query->orderBy('date_time', 'asc'); break;
            case 'distance':
            default:
                if ($lat && $lng) $query->orderBy('distance', 'asc');
                else $query->latest();
                break;
        }

        $missions = $query->paginate(12)->withQueryString();
        $availableCategories = Mission::where('status', Mission::STATUS_OUVERTE)
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->toArray();

        return Inertia::render('Missions/ActiveMissions', [
            'missions' => $missions,
            'userLocation' => ['lat' => $lat, 'lng' => $lng],
            'availableCategories' => $availableCategories,
            'currentFilters' => array_merge($filters, ['radius' => $radius, 'sort_by' => $sortBy]),
        ]);
    }

    public function show(Mission $mission)
    {
        $mission->load(['user', 'offers.user', 'questions.user', 'chat', 'assignedUser.providerProfile']);
        $canSeeAddress = $mission->canSeeFullAddress(Auth::user());
        $clientSecret = null;

        if (Auth::id() === $mission->user_id && $mission->status === Mission::STATUS_EN_NEGOCIATION && $mission->payment_intent_id) {
            try {
                $pi = app(\App\Services\StripeService::class)->getPaymentIntent($mission->payment_intent_id);
                if ($pi->status === 'requires_payment_method') {
                    $clientSecret = $pi->client_secret;
                }
            } catch (\Exception $e) {
                Log::warning("Could not retrieve Stripe PI for mission {$mission->id}");
            }
        }

        return Inertia::render('Missions/Details', [
            'mission' => $mission,
            'canSeeAddress' => $canSeeAddress,
            'stripe_client_secret' => $clientSecret,
        ]);
    }

    public function edit(Mission $mission)
    {
        if (Auth::id() != $mission->user_id) abort(403);
        if ($mission->status !== Mission::STATUS_OUVERTE) {
            return redirect()->route('missions.show', $mission->id)->withErrors(['mission' => 'Cannot edit mission.']);
        }

        return Inertia::render('Missions/Edit', ['mission' => $mission]);
    }

    public function update(Request $request, Mission $mission)
    {
        if (Auth::id() != $mission->user_id) abort(403);
        if ($mission->status !== Mission::STATUS_OUVERTE) return back()->withErrors(['mission' => 'Cannot update.']);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'budget' => 'nullable|numeric|min:10',
            'date_time' => 'nullable|date|after_or_equal:now',
            'category' => 'nullable|string|max:100',
        ]);

        if (!$this->moderationService->isCleanFast($validated['title'] . ' ' . ($validated['description'] ?? ''))) {
            return back()->withErrors(['title' => 'Content violates rules.']);
        }

        $mission->update($validated);
        return redirect()->route('missions.show', $mission->id)->with('success', 'Updated!');
    }

    public function updateStatus(Request $request, Mission $mission)
    {
        if (Auth::id() != $mission->user_id) abort(403);
        $request->validate(['status' => 'required|string|in:OUVERTE,ANNULEE']);
        
        $newStatus = $request->status;
        $currentStatus = $mission->status;

        $allowedTransitions = [
            Mission::STATUS_OUVERTE => [Mission::STATUS_ANNULEE],
            Mission::STATUS_EN_NEGOCIATION => [Mission::STATUS_OUVERTE, Mission::STATUS_ANNULEE],
            Mission::STATUS_VERROUILLEE => [Mission::STATUS_OUVERTE, Mission::STATUS_ANNULEE],
        ];

        if (!isset($allowedTransitions[$currentStatus]) || !in_array($newStatus, $allowedTransitions[$currentStatus])) {
            return back()->withErrors(['status' => 'Transition not allowed.']);
        }

        if ($newStatus === Mission::STATUS_OUVERTE) {
            $mission->assigned_user_id = null;
            $mission->offers()->where('status', 'pending')->update(['status' => 'rejected']);
        }

        $oldStatus = $mission->status;
        $this->missionService->transitionStatus($mission, $newStatus);
        
        // Broadcast is already handled in transitionStatus

        return back()->with('success', 'Status updated!');
    }

    public function search()
    {
        return Inertia::render('Missions/Search');
    }

    public function aiRewrite(Request $request)
    {
        $request->validate(['title' => 'required|string', 'description' => 'nullable|string']);
        $prompt = "Rewrite this mission for Oflem. Title: \"{$request->title}\", Description: \"{$request->description}\". Return JSON: {improved_title, improved_description}.";
        $aiResult = $this->taskService->generateContent($prompt);

        return response()->json([
            'improved_title' => $aiResult['improved_title'] ?? $request->title,
            'improved_description' => $aiResult['improved_description'] ?? ($aiResult['summary'] ?? "I need help with: " . $request->title),
        ]);
    }

    public function checkModeration(Request $request)
    {
        $request->validate(['content' => 'required|string']);
        $isClean = $this->moderationService->isCleanFast($request->content);
        $violations = $isClean ? [] : $this->moderationService->getViolations($request->content);

        return response()->json([
            'is_clean' => $isClean,
            'violations' => $violations,
        ]);
    }
}
