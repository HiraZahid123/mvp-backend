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
use Illuminate\Support\Facades\RateLimiter;

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
            $prefillTitle = mb_substr($prefillTitle, 0, 255, 'UTF-8');

            // Rate-limit AI title generation to prevent API quota exhaustion.
            $rateLimitKey = 'ai_title_gen:' . (Auth::id() ?? $request->ip());
            if (!RateLimiter::tooManyAttempts($rateLimitKey, 20)) {
                RateLimiter::hit($rateLimitKey, 60);

                // Reject flagged content before spending an API token on it.
                if ($this->moderationService->isCleanFast($prefillTitle)) {
                    // Strip quotes to prevent prompt injection via the query-string title.
                    $safePrefill = str_replace(['"', '\\'], ['', ''], $prefillTitle);
                    $prompt = "You are a professional content editor for Oflem, a premium Swiss platform.
                    Task: Polished version of this mission title (max 5 words, same language).
                    Mission: \"{$safePrefill}\"
                    
                    CRITICAL SAFETY: If the content is illegal, unsafe, adult, or involves drugs/weapons, return ONLY: {\"error\": \"inappropriate\"}.
                    Otherwise, return ONLY a JSON object: {\"improved_title\": \"...\"}";
                    
                    $aiResult = $this->taskService->generateContent($prompt);
                    
                    if (isset($aiResult['error'])) {
                        $aiTitle = null;
                    } else {
                        $aiTitle = $aiResult['improved_title'] ?? $prefillTitle;
                    }
                }
            }
        }

        return Inertia::render('Missions/Create', [
            'prefillTitle' => $prefillTitle,
            'aiTitle' => $aiTitle,
            'category' => $request->query('category'),
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

        $aiResult = $this->moderationService->isCleanAI($content);
        if (!$aiResult['is_clean']) {
            return back()->withErrors(['title' => $aiResult['reason'] ?? 'Ce contenu n\'est pas autorisé sur Oflem.']);
        }

        $validated['category'] = $request->input('category') ?? ($aiResult['category'] ?? 'Other');

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
        $radius = $request->query('radius', $user->discovery_radius_km ?? 50);
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

        $aiResult = $this->moderationService->isCleanAI($validated['title'] . ' ' . ($validated['description'] ?? ''));
        if (!$aiResult['is_clean']) {
            return back()->withErrors(['title' => $aiResult['reason'] ?? 'Ce contenu n\'est pas autorisé sur Oflem.']);
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
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
        ]);

        // Per-user rate limit: max 10 AI rewrites per minute to control API cost.
        $rateLimitKey = 'ai_rewrite:' . Auth::id();
        if (RateLimiter::tooManyAttempts($rateLimitKey, 10)) {
            return response()->json(['error' => 'Too many requests. Please wait before trying again.'], 429);
        }
        RateLimiter::hit($rateLimitKey, 60);

        // Moderation gate: reject abusive content before spending an AI token on it.
        $combined = $request->title . ' ' . ($request->description ?? '');
        if (!$this->moderationService->isCleanFast($combined)) {
            return response()->json(['error' => 'Content violates moderation rules.'], 422);
        }

        $title       = mb_substr($request->title, 0, 255, 'UTF-8');
        $description = mb_substr($request->description ?? '', 0, 1000, 'UTF-8');

        // Strip quotes to prevent prompt injection through user-controlled fields.
        $safeTitle       = str_replace(['"', '\\'], ['', ''], $title);
        $safeDescription = str_replace(['"', '\\'], ['', ''], $description);

        $prompt = "Rewrite this mission for Oflem. Title: \"{$safeTitle}\", Description: \"{$safeDescription}\". Return JSON: {improved_title, improved_description}.";
        $aiResult = $this->taskService->generateContent($prompt);

        return response()->json([
            'improved_title'       => $aiResult['improved_title'] ?? $request->title,
            'improved_description' => $aiResult['improved_description'] ?? ($aiResult['summary'] ?? "I need help with: " . $request->title),
        ]);
    }

    public function checkModeration(Request $request)
    {
        $request->validate(['content' => 'required|string|max:5000']);

        // AI calls are expensive — limit to 15 per minute. Use IP as fallback for guests.
        $rateLimitKey = 'check_moderation:' . (Auth::id() ?? $request->ip());
        if (RateLimiter::tooManyAttempts($rateLimitKey, 15)) {
            return response()->json(['error' => 'Too many requests.'], 429);
        }
        RateLimiter::hit($rateLimitKey, 60);

        // Fast pre-screen: skip the AI token if content is obviously prohibited.
        if (!$this->moderationService->isCleanFast($request->content)) {
            $violations = $this->moderationService->getViolations($request->content);
            return response()->json([
                'is_clean'       => false,
                'improved_title' => null,
                'category'       => null,
                'reason'         => 'Contenu non autorisé détecté.',
                'risk_level'     => 'high',
                'violations'     => $violations,
            ]);
        }

        // Full AI check — primary gatekeeper for all submissions.
        $result = $this->moderationService->isCleanAI($request->content);

        return response()->json([
            'is_clean'       => $result['is_clean'],
            'improved_title' => $result['improved_title'] ?? null,
            'category'       => $result['category'] ?? null,
            'reason'         => $result['reason'] ?? null,
            'risk_level'     => $result['risk_level'] ?? 'low',
            'violations'     => [],
        ]);
    }
}
