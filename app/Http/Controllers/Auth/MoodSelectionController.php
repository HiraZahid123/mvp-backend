<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MoodSelectionController extends Controller
{
    /**
     * Show the "Mood of the Day" role selector
     * This appears after EVERY login
     */
    public function create(): Response
    {
        $user = Auth::user();

        return Inertia::render('Auth/MoodOfTheDay', [
            'user' => $user,
            'currentRole' => $user->getLastSelectedRole(),
        ]);
    }

    /**
     * Store the selected mood/role and redirect to appropriate dashboard
     */
    public function store(Request $request)
    {
        $request->validate([
            'role' => 'required|in:customer,performer,both',
        ]);

        $user = Auth::user();
        
        // Update last selected role
        $user->update([
            'last_selected_role' => $request->role,
        ]);

        // Check for pending mission
        if ($request->session()->has('pending_mission')) {
            return redirect()->route('missions.pending');
        }

        // Redirect based on selected role
        return $this->redirectBasedOnRole($request->role, $user);
    }

    /**
     * Redirect user to appropriate dashboard based on selected role
     */
    private function redirectBasedOnRole(string $role, $user)
    {
        switch ($role) {
            case 'customer':
                // FLEMMARD - Redirect to Home Page
                return redirect('/');
                
            case 'performer':
                // MOTIVÉ - Redirect to AI Onboarding
                return redirect()->route('onboarding.index');
                
            case 'both':
                // LES DEUX - Last used dashboard or global overview
                // For now, redirect to dashboard with global view
                return redirect()->route('dashboard')->with('mood', 'both');
                
            default:
                return redirect()->route('dashboard');
        }
    }
}
