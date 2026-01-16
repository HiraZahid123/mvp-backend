<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Skill;
use App\Models\ProviderProfile;
use App\Services\MatchmakingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MatchmakingTest extends TestCase
{
    use RefreshDatabase;

    public function test_matchmaking_service_ranks_providers()
    {
        // 1. Create Skills
        $carpentry = Skill::create(['name' => 'carpentry', 'category' => 'Construction']);
        $painting = Skill::create(['name' => 'painting', 'category' => 'Construction']);

        // 2. Create Providers
        
        // Provider A: Expert Carpentry (Should be #1)
        $userA = User::factory()->create(['name' => 'Alice', 'role_type' => 'performer']);
        ProviderProfile::create(['user_id' => $userA->id, 'years_experience' => 10]);
        $userA->skills()->attach($carpentry->id, ['proficiency_level' => 'expert']);

        // Provider B: Beginner Carpentry (Should be #2)
        $userB = User::factory()->create(['name' => 'Bob', 'role_type' => 'performer']);
        ProviderProfile::create(['user_id' => $userB->id, 'years_experience' => 2]);
        $userB->skills()->attach($carpentry->id, ['proficiency_level' => 'beginner']);

        // Provider C: Painter (No Carpentry) (Should be #3 or excluded depending on logic)
        $userC = User::factory()->create(['name' => 'Charlie', 'role_type' => 'performer']);
        ProviderProfile::create(['user_id' => $userC->id]);
        $userC->skills()->attach($painting->id, ['proficiency_level' => 'expert']);

        // 3. Define Mission Requirements
        $requirements = [
            'required_skills' => [
                ['name' => 'Carpentry', 'importance' => 'must_have']
            ],
            'category' => 'Construction'
        ];

        // 4. Run Matching
        $service = app(MatchmakingService::class);
        $matches = $service->findMatches($requirements, 10);

        // 5. Assertions
        $this->assertGreaterThanOrEqual(2, $matches->count(), 'Should find at least Alice and Bob');
        
        // Alice should be first
        $this->assertEquals($userA->id, $matches->first()->id, 'Alice (Expert) should be ranked first');
        
        // Check scores
        $firstScore = $matches->first()->match_score;
        $secondScore = $matches->get(1)->match_score;
        
        $this->assertGreaterThan($secondScore, $firstScore, 'Expert proficiency + exp should yield higher score');
    }
}
