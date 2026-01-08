<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProfileCompletionController extends Controller
{
    /**
     * Show the profile completion form.
     */
    public function create()
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('auth.select-role');
        }

        return Inertia::render('Auth/CompleteProfile', [
            'user' => $user,
        ]);
    }

    /**
     * Complete the user profile.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'location_address' => 'required|string|max:500',
            'location_lat' => 'required|numeric|between:-90,90',
            'location_lng' => 'required|numeric|between:-180,180',
            'discovery_radius_km' => 'required|integer|min:1|max:50',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = Auth::user();

        if (!$user) {
            return redirect()->route('auth.select-role');
        }

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update([
            'name' => $request->name,
            'location_address' => $request->location_address,
            'location_lat' => $request->location_lat,
            'location_lng' => $request->location_lng,
            'discovery_radius_km' => $request->discovery_radius_km,
            'avatar' => $avatarPath,
        ]);

        return redirect()->route('dashboard');
    }
}
