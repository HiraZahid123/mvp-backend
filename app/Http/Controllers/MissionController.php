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

    public function __construct(
        ModerationService $moderationService, 
        \App\Services\TaskProcessingService $taskService,
        \App\Services\MatchmakingService $matchmakingService
    )
    {
        $this->moderationService = $moderationService;
        $this->taskService = $taskService;
        $this->matchmakingService = $matchmakingService;
    }

    public function create(Request $request)
    {
        $prefillTitle = $request->query('title', '');
        
        return Inertia::render('Missions/Create', [
            'prefillTitle' => $prefillTitle,
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
            'date_time' => 'nullable|date',
            'budget' => 'nullable|numeric',
            'category' => 'nullable|string|max:255',
            'additional_details' => 'nullable|string',
        ]);

        $content = $validated['title'] . ' ' . ($validated['description'] ?? '');

        // Tier 1: Fast Regex Check
        if (!$this->moderationService->isCleanFast($content)) {
            return back()->withErrors(['title' => 'Content violates keyword moderation rules.']);
        }

        // Tier 2: Deep AI Check (Contextual/Semantic)
        if (!$this->moderationService->isCleanAI($content)) {
            return back()->withErrors(['title' => 'Content violates our professional standards (Contextual Check).']);
        }

        // Add AI analysis
        $aiAnalysis = $this->taskService->analyzeTask($validated['title'] . ' ' . ($validated['description'] ?? ''));
        $validated['category'] = $aiAnalysis['category'] ?? $validated['category'];
        
        // Extract Requirements (Skills)
        $requirements = $this->taskService->extractMissionRequirements($validated['title'], $validated['description'] ?? '');
        $requirementsJson = json_encode($requirements);
        
        $validated['additional_details'] = ($validated['additional_details'] ?? '') . 
            "\n\nAI Summary: " . ($aiAnalysis['summary'] ?? '') . 
            "\n\n[REQUIREMENTS]{$requirementsJson}[/REQUIREMENTS]";

        if (!Auth::check()) {
            // Save to session and signal need for auth
            session(['pending_mission' => $validated]);
            return back()->with('requires_auth', true);
        }

        $mission = Mission::create(array_merge($validated, [
            'user_id' => Auth::id(),
            'status' => 'open',
        ]));

        return redirect()->route('missions.matchmaking', $mission->id)->with('success', 'Mission created successfully!');
    }

    public function checkModeration(Request $request)
    {
        $request->validate(['content' => 'required|string']);
        $content = $request->content;

        // Start with Fast check for speed
        $isClean = $this->moderationService->isCleanFast($content);
        $violations = $isClean ? [] : $this->moderationService->getViolations($content);
        
        // If it passes fast check and content is long enough, do AI check
        if ($isClean && strlen($content) > 10) {
            $isClean = $this->moderationService->isCleanAI($content);
            if (!$isClean) {
                $violations = ['contextual_violation'];
            }
        }

        Log::info('Moderation Check Result:', [
            'content' => $content,
            'is_clean' => $isClean,
            'violations' => $violations
        ]);

        return response()->json([
            'is_clean' => $isClean,
            'violations' => $violations
        ]);
    }

    public function handlePendingMission()
    {
        if (Auth::check() && session()->has('pending_mission')) {
            $data = session()->pull('pending_mission');
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
        $helpers = $this->matchmakingService->findMatches($requirements, 10)->map(function($user) {
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

    public function contactHelper(Mission $mission, \App\Models\User $helper)
    {
        return redirect()->route('dashboard', [
            'chat_with' => $helper->id,
            'helper_name' => $helper->name,
            'mission_id' => $mission->id,
            'mission_title' => $mission->title,
        ])->with('success', 'Starting conversation with ' . $helper->name);
    }
}
