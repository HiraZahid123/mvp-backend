<?php

namespace App\Console\Commands;

use App\Models\Mission;
use App\Services\StripeService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class AutoCompleteMissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'missions:auto-complete';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically complete missions that have been in validation for more than 72 hours';

    protected $stripeService;

    public function __construct(StripeService $stripeService)
    {
        parent::__construct();
        $this->stripeService = $stripeService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for missions to auto-complete...');

        // Find missions in validation state for more than 72 hours
        $missions = Mission::where('status', Mission::STATUS_EN_VALIDATION)
            ->where('validation_started_at', '<=', now()->subHours(72))
            ->get();

        if ($missions->isEmpty()) {
            $this->info('No missions found for auto-completion.');
            return 0;
        }

        $this->info("Found {$missions->count()} mission(s) to auto-complete.");

        $completed = 0;
        $failed = 0;

        foreach ($missions as $mission) {
            try {
                $mission->transitionTo(Mission::STATUS_TERMINEE);
                
                // Release funds to provider
                $this->stripeService->releaseFunds($mission);

                // Notify both parties
                $mission->user->notify(new \App\Notifications\MissionAutoCompletedNotification($mission));
                $mission->assignedUser->notify(new \App\Notifications\MissionCompletedNotification($mission));

                $this->info("✓ Mission #{$mission->id} auto-completed successfully.");
                Log::info("Mission #{$mission->id} auto-completed after 72-hour validation period.");
                
                $completed++;
            } catch (\Exception $e) {
                $this->error("✗ Failed to auto-complete mission #{$mission->id}: {$e->getMessage()}");
                Log::error("Failed to auto-complete mission #{$mission->id}: {$e->getMessage()}");
                $failed++;
            }
        }

        $this->info("\nSummary: {$completed} completed, {$failed} failed.");
        
        return 0;
    }
}
