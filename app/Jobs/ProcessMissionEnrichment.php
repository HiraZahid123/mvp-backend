<?php

namespace App\Jobs;

use App\Models\Mission;
use App\Services\TaskProcessingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessMissionEnrichment implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [1, 5, 15]; // Exponential backoff in seconds
    public $timeout = 60; // Maximum execution time per attempt

    protected $mission;

    /**
     * Create a new job instance.
     */
    public function __construct(Mission $mission)
    {
        $this->mission = $mission;
    }

    /**
     * Execute the job.
     */
    public function handle(TaskProcessingService $taskService, \App\Services\GeocodingService $geocodingService): void
    {
        try {
            Log::info("Processing mission enrichment for Mission #{$this->mission->id} (Attempt {$this->attempts()}/{$this->tries})");

            // Step 1: Geocode if needed (moved from controller)
            if ((empty($this->mission->lat) || empty($this->mission->lng)) && !empty($this->mission->location)) {
                $geocoded = $geocodingService->geocode($this->mission->location);
                if ($geocoded) {
                    $this->mission->update([
                        'lat' => $geocoded['lat'],
                        'lng' => $geocoded['lng'],
                        'location' => $geocoded['address'] ?? $this->mission->location,
                    ]);
                    Log::info("Mission #{$this->mission->id} geocoded successfully");
                }
            }

            // Step 2: Perform AI analysis
            $aiAnalysis = $taskService->analyzeTask(
                $this->mission->title . ' ' . ($this->mission->description ?? '')
            );

            // Step 3: Extract requirements
            $requirements = $taskService->extractMissionRequirements(
                $this->mission->title,
                $this->mission->description ?? ''
            );

            // Step 4: Prepare enriched data
            $category = $aiAnalysis['category'] ?? 'Other';
            $aiSummary = $aiAnalysis['summary'] ?? '';
            $requirementsJson = json_encode($requirements);

            // Build additional details
            $additionalDetails = ($this->mission->additional_details ?? '') . 
                "\n\nAI Summary: " . $aiSummary . 
                "\n\n[REQUIREMENTS]{$requirementsJson}[/REQUIREMENTS]";

            // Step 5: Update mission with enriched data
            $this->mission->update([
                'category' => $category,
                'additional_details' => $additionalDetails,
            ]);

            // Step 6: Send nearby notifications (moved from controller)
            if ($this->mission->lat && $this->mission->lng) {
                $nearbyUsers = \App\Models\User::nearby($this->mission->lat, $this->mission->lng)
                    ->where('id', '!=', $this->mission->user_id)
                    ->get();

                foreach ($nearbyUsers as $nearbyUser) {
                    $nearbyUser->notify(new \App\Notifications\NearbyMissionNotification($this->mission));
                }
                
                Log::info("Sent notifications to " . $nearbyUsers->count() . " nearby users");
            }

            Log::info("Mission #{$this->mission->id} enrichment completed successfully", [
                'category' => $category,
                'requirements_count' => count($requirements['required_skills'] ?? []),
                'geocoded' => !empty($geocoded),
            ]);

        } catch (\Exception $e) {
            Log::warning("Mission enrichment failed for Mission #{$this->mission->id}: " . $e->getMessage(), [
                'attempt' => $this->attempts(),
                'max_tries' => $this->tries,
                'exception' => get_class($e)
            ]);

            // If this is the final attempt, apply fallback values
            if ($this->attempts() >= $this->tries) {
                $this->applyFallbackValues();
            } else {
                // Re-throw to trigger retry
                throw $e;
            }
        }
    }

    /**
     * Apply fallback values when all retries are exhausted.
     */
    protected function applyFallbackValues(): void
    {
        Log::info("Applying fallback values for Mission #{$this->mission->id} after all retries exhausted");

        $fallbackRequirements = json_encode([
            'required_skills' => [],
            'category' => 'Other'
        ]);

        $additionalDetails = ($this->mission->additional_details ?? '') . 
            "\n\n[REQUIREMENTS]{$fallbackRequirements}[/REQUIREMENTS]";

        $this->mission->update([
            'category' => $this->mission->category ?? 'Other',
            'additional_details' => $additionalDetails,
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("Mission enrichment permanently failed for Mission #{$this->mission->id}", [
            'exception' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);

        // Ensure fallback values are applied
        $this->applyFallbackValues();
    }
}
