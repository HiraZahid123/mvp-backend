<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        if ($request->hasFile('avatar')) {
             $request->validate([
                'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            // Delete old profile photo if it exists
            if ($request->user()->profile_photo) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($request->user()->profile_photo);
            }

            $path = $request->file('avatar')->store('profile-photos', 'public');
            $request->user()->profile_photo = $path;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    /**
     * Display notification preferences page.
     */
    public function notificationPreferences(Request $request): Response
    {
        $preferences = $request->user()->notificationPreference;
        
        // Create default preferences if they don't exist
        if (!$preferences) {
            $preferences = \App\Models\NotificationPreference::create([
                'user_id' => $request->user()->id,
            ]);
        }

        return Inertia::render('Profile/NotificationPreferences', [
            'preferences' => $preferences,
        ]);
    }

    /**
     * Update notification preferences.
     */
    public function updateNotificationPreferences(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'quiet_hours_enabled' => 'boolean',
            'quiet_hours_start' => 'nullable|date_format:H:i',
            'quiet_hours_end' => 'nullable|date_format:H:i',
            'new_mission_nearby' => 'boolean',
            'new_offer_received' => 'boolean',
            'offer_accepted' => 'boolean',
            'offer_rejected' => 'boolean',
            'mission_updated' => 'boolean',
            'mission_cancelled' => 'boolean',
            'new_question' => 'boolean',
            'question_answered' => 'boolean',
            'chat_message' => 'boolean',
            'email_enabled' => 'boolean',
            'push_enabled' => 'boolean',
            'in_app_enabled' => 'boolean',
            'digest_enabled' => 'boolean',
            'digest_frequency' => 'in:hourly,daily',
        ]);

        $preferences = $request->user()->notificationPreference;
        
        if (!$preferences) {
            $preferences = \App\Models\NotificationPreference::create([
                'user_id' => $request->user()->id,
            ]);
        }

        $preferences->update($validated);

        return Redirect::route('profile.notifications')->with('success', 'Notification preferences updated successfully!');
    }

    /**
     * Display public profile with reviews.
     */
    public function show(Request $request, $id): Response
    {
        $user = \App\Models\User::with(['providerProfile', 'skills'])->findOrFail($id);
        
        // Load reviews with reviewer information and mission details
        $reviews = $user->reviewsReceived()
            ->with(['reviewer', 'mission'])
            ->latest()
            ->get();
        
        // Get rating distribution
        $ratingDistribution = $user->getRatingDistribution();
        
        return Inertia::render('Profile/PublicProfile', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'role_type' => $user->role_type,
                'location_address' => $user->location_address,
                'email_verified_at' => $user->email_verified_at,
                'average_rating' => $user->average_rating,
                'total_reviews' => $user->total_reviews,
                'provider_profile' => $user->providerProfile,
                'skills' => $user->skills,
            ],
            'reviews' => $reviews,
            'ratingDistribution' => $ratingDistribution,
        ]);
    }
}
