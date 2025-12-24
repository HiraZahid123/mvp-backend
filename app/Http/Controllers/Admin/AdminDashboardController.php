<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    /**
     * Show the admin dashboard.
     */
    public function __invoke()
    {
        $stats = [
            'total_users' => User::count(),
            'customers' => User::where('role_type', 'customer')->orWhere('role_type', 'both')->count(),
            'performers' => User::where('role_type', 'performer')->orWhere('role_type', 'both')->count(),
            'admins' => User::where('is_admin', true)->count(),
        ];

        $recentUsers = User::latest()->take(10)->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentUsers' => $recentUsers,
        ]);
    }
}
