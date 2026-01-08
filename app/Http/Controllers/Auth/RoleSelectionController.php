<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RoleSelectionController extends Controller
{
    /**
     * Show the role selection form.
     */
    public function create(Request $request)
    {
        return Inertia::render('Auth/SelectRole', [
            'intended' => $request->session()->get('url.intended'),
        ]);
    }

    /**
     * Store the selected role and redirect to profile completion.
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

        $user->update([
            'role_type' => $request->role,
        ]);

        // Redirect to profile completion
        return redirect()->route('auth.complete-profile');
    }
}
