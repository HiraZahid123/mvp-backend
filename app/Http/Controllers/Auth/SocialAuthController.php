<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse;

class SocialAuthController extends Controller
{
    /**
     * Supported OAuth providers
     */
    private const PROVIDERS = ['google', 'apple', 'facebook'];

    /**
     * Redirect to OAuth provider for authentication
     */
    public function redirect(string $provider, Request $request): RedirectResponse
    {
        if (!in_array($provider, self::PROVIDERS)) {
            abort(404, 'Provider not supported');
        }

        // Store intended role in session for registration flow
        if ($request->has('role_type')) {
            session(['social_auth_role_type' => $request->get('role_type')]);
        }

        // Store whether this is login or registration
        session(['social_auth_type' => $request->get('type', 'login')]);

        return Socialite::driver($provider)->redirect();
    }

    /**
     * Handle OAuth provider callback
     */
    public function callback(string $provider, Request $request)
    {
        if (!in_array($provider, self::PROVIDERS)) {
            abort(404, 'Provider not supported');
        }

        try {
            $socialUser = Socialite::driver($provider)->user();

            // Check if user already exists with this provider
            $user = User::findByProvider($provider, $socialUser->getId());

            $authType = session('social_auth_type', 'login');
            $roleType = session('social_auth_role_type', 'customer');

            if ($user) {
                // Existing user - log them in
                return $this->handleExistingUser($user, $socialUser, $authType);
            } else {
                // New user - handle based on auth type
                if ($authType === 'login') {
                    // For login, we might want to create account or show error
                    // Let's create the account for simplicity
                    $user = $this->createSocialUser($provider, $socialUser, $roleType);
                    return $this->handleNewUser($user, $socialUser, $authType);
                } else {
                    // Registration flow
                    $user = $this->createSocialUser($provider, $socialUser, $roleType);
                    return $this->handleNewUser($user, $socialUser, $authType);
                }
            }

        } catch (\Exception $e) {
            // Handle OAuth errors
            return redirect('/login')->withErrors([
                'social_auth' => 'Authentication failed. Please try again.'
            ]);
        }
    }

    /**
     * Create new user from social provider data
     */
    private function createSocialUser(string $provider, $socialUser, string $roleType): User
    {
        // Check if email already exists (different provider)
        $existingUser = User::where('email', $socialUser->getEmail())->first();

        if ($existingUser) {
            // Link social account to existing user
            $existingUser->update([
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'provider_token' => $socialUser->token,
                'provider_refresh_token' => $socialUser->refreshToken,
                'provider_token_expires_at' => $socialUser->expiresIn
                    ? now()->addSeconds($socialUser->expiresIn)
                    : null,
            ]);
            return $existingUser;
        }

        // Create new user
        return User::createFromProvider($provider, [
            'id' => $socialUser->getId(),
            'name' => $socialUser->getName(),
            'email' => $socialUser->getEmail(),
            'nickname' => $socialUser->getNickname(),
            'token' => $socialUser->token,
            'refreshToken' => $socialUser->refreshToken,
            'expiresIn' => $socialUser->expiresIn,
        ], $roleType);
    }

    /**
     * Handle existing user authentication
     */
    private function handleExistingUser(User $user, $socialUser, string $authType)
    {
        // Update token information
        $user->updateProviderToken(
            $socialUser->token,
            $socialUser->refreshToken,
            $socialUser->expiresIn
        );

        // Log the user in
        Auth::login($user, true);

        // Clear session data
        session()->forget(['social_auth_type', 'social_auth_role_type']);

        if ($authType === 'login') {
            // Check if profile setup is needed
            if (!$user->isProfileComplete()) {
                if (!$user->hasSelectedRole()) {
                    return redirect()->route('auth.select-role');
                }
                return redirect()->route('auth.complete-identity');
            }
            return redirect('/dashboard');
        } else {
            // Registration flow - go to Select Role
            return redirect()->route('auth.select-role');
        }
    }

    /**
     * Handle new user authentication
     */
    private function handleNewUser(User $user, $socialUser, string $authType)
    {
        // Log the user in
        Auth::login($user, true);

        // Clear session data
        session()->forget(['social_auth_type', 'social_auth_role_type']);

        // New social users always need role selection
        return redirect()->route('auth.select-role');
    }

    /**
     * API endpoint for mobile social authentication
     */
    public function apiCallback(Request $request)
    {
        $request->validate([
            'provider' => 'required|in:google,apple,facebook',
            'access_token' => 'required|string',
            'type' => 'sometimes|in:login,register',
            'role_type' => 'sometimes|in:customer,performer,both',
        ]);

        try {
            // Get user info from access token
            $socialUser = Socialite::driver($request->provider)
                                  ->userFromToken($request->access_token);

            $user = User::findByProvider($request->provider, $socialUser->getId());

            if (!$user) {
                $roleType = $request->get('role_type', 'customer');
                $user = $this->createSocialUser($request->provider, $socialUser, $roleType);
            }

            // Update token information
            $user->updateProviderToken($request->access_token);

            // Create Sanctum token
            $token = $user->createToken('social-auth')->plainTextToken;

            // Check if profile setup is needed
            $requiresProfileSetup = is_null($user->location_lat) || is_null($user->location_lng);

            return response()->json([
                'user' => $user,
                'token' => $token,
                'requires_profile_setup' => $requiresProfileSetup,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Social authentication failed',
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
