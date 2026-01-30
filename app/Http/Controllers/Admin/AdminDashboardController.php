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
            'total_missions' => \App\Models\Mission::count(),
            'active_missions' => \App\Models\Mission::whereIn('status', ['OUVERTE', 'EN_NEGOCIATION', 'VERROUILLEE', 'EN_COURS', 'EN_VALIDATION'])->count(),
            'disputed_missions' => \App\Models\Mission::where('status', 'EN_LITIGE')->count(),
            'total_payments' => \App\Models\Payment::where('status', 'captured')->sum('amount'),
        ];

        $recentUsers = User::latest()->take(10)->get();
        $recentActivity = \App\Models\AdminActivityLog::with('admin')->latest()->take(10)->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentUsers' => $recentUsers,
            'recentActivity' => $recentActivity,
        ]);
    }
}
