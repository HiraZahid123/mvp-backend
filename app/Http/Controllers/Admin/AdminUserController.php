<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AdminActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->has('role_type')) {
            $query->where('role_type', $request->role_type);
        }

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        $users = $query->paginate(20);
        
        return \Inertia\Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $request->search,
                'role_type' => $request->role_type,
            ],
        ]);
    }

    public function show(User $user)
    {
        $user->load(['otpVerifications', 'providerProfile', 'skills']);
        
        return \Inertia\Inertia::render('Admin/Users/Show', [
            'user' => $user,
        ]);
    }

    public function ban(User $user)
    {
        $user->update(['chat_suspended_until' => now()->parse('2038-01-01')]);
        
        AdminActivityLog::create([
            'admin_id' => Auth::id(),
            'action' => 'user_banned',
            'subject_type' => User::class,
            'subject_id' => $user->id,
            'metadata' => ['reason' => 'Banned by admin'],
        ]);

        return response()->json(['message' => 'User banned successfully']);
    }

    public function suspend(Request $request, User $user)
    {
        $request->validate([
            'until' => 'required|date|after:now',
            'reason' => 'required|string',
        ]);

        $user->update(['chat_suspended_until' => $request->until]);

        AdminActivityLog::create([
            'admin_id' => Auth::id(),
            'action' => 'user_suspended',
            'subject_type' => User::class,
            'subject_id' => $user->id,
            'metadata' => ['reason' => $request->reason, 'until' => $request->until],
        ]);

        return response()->json(['message' => 'User suspended until ' . $request->until]);
    }
}
