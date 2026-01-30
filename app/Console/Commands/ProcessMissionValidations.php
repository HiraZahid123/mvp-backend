<?php

namespace App\Console\Commands;

use App\Models\Mission;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessMissionValidations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'missions:process-validations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Auto-complete missions after 72 hours in validation status';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $missions = Mission::where('status', Mission::STATUS_EN_VALIDATION)
            ->where('validation_started_at', '<=', now()->subHours(72))
            ->get();
        
        $count = $missions->count();
        
        foreach ($missions as $mission) {
            try {
                // Auto-complete after 72h
                $mission->transitionTo(Mission::STATUS_TERMINEE);
                
                // Release payment
                app(\App\Services\StripeService::class)->releaseFunds($mission);
                
                $this->info("Mission {$mission->id} auto-completed after 72h validation period");
                Log::info("Mission {$mission->id} auto-completed after 72h validation period");
            } catch (\Exception $e) {
                $this->error("Failed to auto-complete mission {$mission->id}: " . $e->getMessage());
                Log::error("Failed to auto-complete mission {$mission->id}: " . $e->getMessage());
            }
        }
        
        $this->info("Processed {$count} missions for auto-completion.");
    }
}
