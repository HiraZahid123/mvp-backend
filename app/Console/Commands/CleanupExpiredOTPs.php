<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CleanupExpiredOTPs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'otp:cleanup-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up expired OTP verifications from the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $count = \App\Models\OTPVerification::where('expires_at', '<', now())
            ->whereNull('verified_at')
            ->delete();

        $this->info("Cleaned up {$count} expired OTP verifications.");
    }
}
