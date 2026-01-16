<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Skill;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OnboardingTest extends TestCase
{
    use RefreshDatabase;

    public function test_ai_analysis_endpoint()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson(route('onboarding.analyze'), [
            'description' => 'I am an expert carpenter with 10 years of experience. I build custom tables and chairs.'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'skills',
                'years_experience',
                'main_category',
                'professional_bio'
            ]);
            
        // Clean up
        $user->delete();
    }

    public function test_profile_submission()
    {
        $user = User::factory()->create();

        $data = [
            'bio' => 'Test Bio',
            'years_experience' => 5,
            'main_category' => 'Construction',
            'skills' => [
                ['name' => 'Carpentry', 'proficiency' => 'expert'],
                ['name' => 'Drilling', 'proficiency' => 'beginner']
            ],
            'raw_analysis' => []
        ];

        $response = $this->actingAs($user)->post(route('onboarding.store'), $data);

        $response->assertRedirect('dashboard');

        // Check Profile
        $this->assertDatabaseHas('provider_profiles', [
            'user_id' => $user->id,
            'years_experience' => 5,
            'main_category' => 'Construction'
        ]);

        // Check Skills
        $this->assertDatabaseHas('skills', ['name' => 'carpentry']);
        $this->assertDatabaseHas('skills', ['name' => 'drilling']);

        // Check Pivot
        $carpentry = Skill::where('name', 'carpentry')->first();
        $this->assertDatabaseHas('provider_skills', [
            'user_id' => $user->id,
            'skill_id' => $carpentry->id,
            'proficiency_level' => 'expert'
        ]);

        // Clean up
        $user->providerProfile()->delete();
        $user->skills()->detach();
        $user->delete();
    }
}
