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
                // FLEMMARD - Post/Hire Dashboard
                return redirect()->route('dashboard')->with('mood', 'customer');
                
            case 'performer':
                // MOTIVÉ - Task Map / Jobs Dashboard
                // TODO: Update this route when task map is implemented
                return redirect()->route('dashboard')->with('mood', 'performer');
                
            case 'both':
                // LES DEUX - Last used dashboard or global overview
                // For now, redirect to dashboard with global view
                return redirect()->route('dashboard')->with('mood', 'both');
                
            default:
                return redirect()->route('dashboard');
        }
    }
}
