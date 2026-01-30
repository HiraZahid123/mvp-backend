<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\ProviderProfile;
use App\Models\Skill;
use App\Services\TaskProcessingService;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OnboardingController extends Controller
{
    protected $taskService;

    public function __construct(TaskProcessingService $taskService)
    {
        $this->taskService = $taskService;
    }

    public function index()
    {
        $user = Auth::user()->load(['providerProfile', 'skills']);
        $profile = $user->providerProfile;

        return Inertia::render('Onboarding/Index', [
            'existingProfile' => $profile
        ]);
    }

    public function analyze(Request $request)
    {
        $request->validate(['description' => 'required|string|min:20']);

        $analysis = $this->taskService->extractProfile($request->description);

        return response()->json($analysis);
    }

    public function store(Request $request)
    {
        $request->validate([
            'bio' => 'required|string',
            'years_experience' => 'integer|min:0',
            'main_category' => 'nullable|string',
            'skills' => 'array',
            'skills.*.name' => 'required|string',
            'skills.*.proficiency' => 'required|in:beginner,intermediate,expert',
            'raw_analysis' => 'nullable|array'
        ]);

        DB::transaction(function () use ($request) {
            $user = Auth::user();

            // 1. Create/Update Profile
            ProviderProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'bio' => $request->bio,
                    'years_experience' => $request->years_experience,
                    'main_category' => $request->main_category,
                    'raw_ai_analysis' => $request->raw_analysis
                ]
            );

            // 2. Sync Skills
            $skillIds = [];
            foreach ($request->skills as $skillData) {
                // Find or create skill
                $skill = Skill::firstOrCreate(
                    ['name' => strtolower($skillData['name'])], // Normalize skill names
                    ['category' => $request->main_category] // Default category if new
                );

                $skillIds[$skill->id] = ['proficiency_level' => $skillData['proficiency']];
            }

            // Sync without detaching? Or detach old ones? 
            // Usually valid to overwrite for a full profile update.
            $user->skills()->sync($skillIds);
        });

        // Determine redirection based on context
        // If user was recently created (within last 30 minutes), they are in first-time registration flow
        $user = Auth::user();
        $isFirstTimeOnboarding = $user->created_at->diffInMinutes(now()) < 30;
        
        if ($isFirstTimeOnboarding) {
            return redirect()->route('auth.registration-success');
        }

        return redirect()->route('dashboard')->with('success', 'Expertise updated successfully!');
    }
}
