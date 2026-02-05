<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Mission;
use App\Models\Withdrawal;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // User statistics
        $totalUsers = User::count();
        $customers = User::whereIn('role_type', ['customer', 'both'])->count();
        $performers = User::whereIn('role_type', ['performer', 'both'])->count();
        $newUsersThisMonth = User::whereMonth('created_at', now()->month)->count();

        // Mission statistics
        $totalMissions = Mission::count();
        $openMissions = Mission::where('status', Mission::STATUS_OUVERTE)->count();
        $inProgressMissions = Mission::where('status', Mission::STATUS_EN_COURS)->count();
        $completedMissions = Mission::where('status', Mission::STATUS_TERMINEE)->count();

        // Withdrawal statistics
        $pendingWithdrawals = Withdrawal::where('status', Withdrawal::STATUS_PENDING)->count();
        $pendingWithdrawalAmount = Withdrawal::where('status', Withdrawal::STATUS_PENDING)->sum('amount');
        $totalWithdrawn = Withdrawal::where('status', Withdrawal::STATUS_COMPLETED)->sum('amount');

        // Recent activity
        $recentWithdrawals = Withdrawal::with('user:id,name,email')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        $recentUsers = User::orderByDesc('created_at')
            ->limit(5)
            ->get();

        return Inertia::render('Admin/AdminDashboard', [
            'stats' => [
                'users' => [
                    'total' => $totalUsers,
                    'customers' => $customers,
                    'performers' => $performers,
                    'newThisMonth' => $newUsersThisMonth,
                ],
                'missions' => [
                    'total' => $totalMissions,
                    'open' => $openMissions,
                    'inProgress' => $inProgressMissions,
                    'completed' => $completedMissions,
                ],
                'withdrawals' => [
                    'pending' => $pendingWithdrawals,
                    'pendingAmount' => $pendingWithdrawalAmount,
                    'totalWithdrawn' => $totalWithdrawn,
                ],
            ],
            'recentWithdrawals' => $recentWithdrawals,
            'recentUsers' => $recentUsers,
        ]);
    }
}
