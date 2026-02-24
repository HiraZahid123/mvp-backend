<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleSwitchController extends Controller
{
    /**
     * Switch the user's active role.
     */
    public function switch(Request $request)
    {
        $request->validate([
            'role' => 'required|in:client,provider',
        ]);

        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        // If switching to a role they don't have yet, upgrade to 'both'
        $newRoleType = $user->role_type;
        if ($user->role_type !== 'both' && $user->role_type !== $request->role) {
            $newRoleType = 'both';
        }

        $user->update([
            'role_type' => $newRoleType,
            'last_selected_role' => $request->role,
        ]);

        // Determine destination based on the new role
        if ($request->role === 'client') {
            return redirect()->route('missions.create')->with('success', 'Switched to Client role.');
        }

        return redirect()->route('dashboard')->with('success', 'Switched to Provider role.');
    }
}
