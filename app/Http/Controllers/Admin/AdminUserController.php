<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    /**
     * Display all users
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $roleFilter = $request->get('role', 'all');

        $users = User::query()
            ->when($search, function($query) use ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('username', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($roleFilter !== 'all', function($query) use ($roleFilter) {
                $query->where('role_type', $roleFilter);
            })
            ->orderByDesc('created_at')
            ->paginate(20);

        $stats = [
            'total' => User::count(),
            'clients' => User::whereIn('role_type', ['client', 'both'])->count(),
            'providers' => User::whereIn('role_type', ['provider', 'both'])->count(),
            'admins' => User::whereNotNull('admin_role')->count(),
        ];

        return Inertia::render('Admin/AdminUsers', [
            'users' => $users,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'role' => $roleFilter,
            ],
        ]);
    }

    /**
     * Display user details
     */
    public function show(User $user)
    {
        $user->load([
            'withdrawals' => function($query) {
                $query->latest()->limit(10);
            },
        ]);

        return Inertia::render('Admin/AdminUserDetails', [
            'user' => $user,
        ]);
    }

    /**
     * Suspend or unsuspend a user
     */
    public function suspend(Request $request, User $user)
    {
        $request->validate([
            'suspend' => 'required|boolean',
            'reason' => 'required_if:suspend,true|string|max:500',
        ]);

        if ($request->suspend) {
            $user->update([
                'chat_suspended_until' => now()->addYears(10), // Effectively permanent
            ]);
            return back()->with('success', 'User suspended successfully.');
        } else {
            $user->update([
                'chat_suspended_until' => null,
            ]);
            return back()->with('success', 'User unsuspended successfully.');
        }
    }
}
