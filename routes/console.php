<?php

use App\Console\Commands\CleanupExpiredOTPs;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule cleanup command
Schedule::command(CleanupExpiredOTPs::class)->daily();

// Schedule mission auto-completion (72-hour validation window)
Schedule::command(\App\Console\Commands\AutoCompleteMissions::class)->hourly();
