<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class SystemController extends Controller
{
    /**
     * Run an artisan command and return the output.
     */
    private function runCommand($command, $successMessage)
    {
        try {
            Artisan::call($command);
            $output = Artisan::output();
            
            return back()->with('success', $successMessage . "\n\nOutput:\n" . $output);
        } catch (\Exception $e) {
            Log::error("System Command Error ($command): " . $e->getMessage());
            return back()->withErrors(['error' => "Error executing $command: " . $e->getMessage()]);
        }
    }

    /**
     * Clear all caches (optimize:clear)
     */
    public function optimizeClear()
    {
        return $this->runCommand('optimize:clear', 'System optimization cleared successfully!');
    }

    /**
     * Clear application cache
     */
    public function cacheClear()
    {
        return $this->runCommand('cache:clear', 'Application cache cleared successfully!');
    }

    /**
     * Clear config cache
     */
    public function configCache()
    {
        return $this->runCommand('config:cache', 'Configuration cached successfully!');
    }

    /**
     * Clear route cache
     */
    public function routeCache()
    {
        return $this->runCommand('route:cache', 'Routes cached successfully!');
    }

    /**
     * Clear view cache
     */
    public function viewClear()
    {
        return $this->runCommand('view:clear', 'Compiled views cleared successfully!');
    }

    /**
     * Create storage link
     */
    public function storageLink()
    {
        return $this->runCommand('storage:link', 'Storage link created successfully!');
    }

    /**
     * Run database migrations
     */
    public function migrate()
    {
        return $this->runCommand('migrate --force', 'Database migrations executed successfully!');
    }
}
