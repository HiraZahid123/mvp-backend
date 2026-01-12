<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the Login Gateway screen with social login options
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Display the manual email login form
     */
    public function createManual(Request $request): Response
    {
        return Inertia::render('Auth/LoginManual', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request
     * Redirects to "Mood of the Day" screen after successful login
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();

        // Check if user has completed role selection
        if (!$user->role_type) {
            return redirect()->route('auth.select-role');
        }

        // Check if user has completed profile setup (identity & location)
        if (!$user->username || !$user->location_lat || !$user->location_lng) {
            // Determine which step to redirect to
            if (!$user->username) {
                return redirect()->route('auth.complete-identity');
            }
            return redirect()->route('auth.complete-location');
        }

        // All setup complete - redirect to "Mood of the Day" selector
        return redirect()->route('auth.mood-of-the-day');
    }

    /**
     * Destroy an authenticated session
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
