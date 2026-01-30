<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RoleSelectionController extends Controller
{
    /**
     * Show the role selection form
     */
    public function create(Request $request)
    {
        $user = Auth::user();

        return Inertia::render('Auth/SelectRole', [
            'user' => $user,
            'intended' => $request->session()->get('url.intended'),
        ]);
    }

    /**
     * Store the selected role and redirect to identity setup
     */
    public function store(Request $request)
    {
        $request->validate([
            'role' => 'required|in:customer,performer,both',
        ]);

        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        // Save to both role_type AND last_selected_role
        $user->update([
            'role_type' => $request->role,
            'last_selected_role' => $request->role,
        ]);

        if ($request->session()->has('pending_mission')) {
            return redirect()->route('missions.pending');
        }

        return redirect()->route('dashboard');
    }
}
