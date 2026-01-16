<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\TaskProcessingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;
use Mockery;

class MissionFlowTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test homepage moderation API (Fast Regex).
     */
    public function test_moderation_api_blocks_profanity()
    {
        $response = $this->postJson(route('moderation.check'), [
            'content' => 'This contains drugs and sex',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'is_clean' => false,
             ]);
    }

    public function test_moderation_api_allows_clean_content()
    {
        $response = $this->postJson(route('moderation.check'), [
            'content' => 'I need help cleaning my apartment',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'is_clean' => true,
            ]);
    }

    /**
     * Test AI Rewrite API endpoint.
     */
    public function test_ai_rewrite_endpoint()
    {
        // Mock the TaskProcessingService
        $mockService = Mockery::mock(TaskProcessingService::class);
        $mockService->shouldReceive('generateContent')
            ->once()
            ->andReturn([
                'improved_title' => 'Professional Cleaning Required',
                'improved_description' => 'Detailed description of cleaning task.',
                'summary' => 'Cleaning task',
            ]);

        $this->app->instance(TaskProcessingService::class, $mockService);

        $response = $this->postJson(route('missions.ai-rewrite'), [
            'title' => 'Clean my room',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'improved_title' => 'Professional Cleaning Required',
                'improved_description' => 'Detailed description of cleaning task.',
            ]);
    }

    /**
     * Test Mission Creation (Authenticated).
     */
    public function test_authenticated_user_can_create_mission()
    {
        $user = User::factory()->create();
        
        // Mock ModerationService to pass
        // Mock TaskProcessingService
        $mockService = Mockery::mock(TaskProcessingService::class);
        $mockService->shouldReceive('analyzeTask')
            ->andReturn([
                'category' => 'Cleaning',
                'summary' => 'AI Summary',
            ]);
        $this->app->instance(TaskProcessingService::class, $mockService);

        $response = $this->actingAs($user)->post(route('missions.store'), [
            'title' => 'Valid Mission Title',
            'description' => 'Valid description.',
        ]);

        $response->assertRedirect(); // Should redirect to matchmaking
        $this->assertDatabaseHas('missions', [
            'title' => 'Valid Mission Title',
            'user_id' => $user->id,
        ]);
    }

    /**
     * Test Mission Creation (Guest).
     */
    public function test_guest_mission_creation_requires_auth()
    {
        // Mock TaskProcessingService
        $mockService = Mockery::mock(TaskProcessingService::class);
        $mockService->shouldReceive('analyzeTask')
            ->andReturn([
                'category' => 'Cleaning',
                'summary' => 'AI Summary',
            ]);
        $this->app->instance(TaskProcessingService::class, $mockService);

        $response = $this->postJson(route('missions.store'), [
            'title' => 'Guest Mission',
            'description' => 'Guest description.',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'requires_auth' => true,
            ]);
        
        $this->assertTrue(session()->has('pending_mission'));
    }
}
