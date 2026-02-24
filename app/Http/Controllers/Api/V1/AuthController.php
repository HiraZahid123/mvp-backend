<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OTPService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\Rules;

class AuthController extends Controller
{
    protected OTPService $otpService;

    public function __construct(OTPService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Register a new user
     *
     * API Flow: register → send-otp → verify-otp → complete-profile
     * Unlike web flow, API doesn't auto-send OTPs - mobile app handles this for flexibility
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users',
            'phone' => 'required|string|max:20|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role_type' => 'required|in:client,provider,both',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role_type' => $request->role_type,
        ]);

        return response()->json([
            'message' => 'User registered successfully.',
            'user' => $user,
        ], 201);
    }

    /**
     * Login user
     *
     * API Flow: login (auto-sends email OTP) → verify-otp
     * Matches web behavior - automatically sends OTP to email after credential validation
     */
    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string', // email or phone
            'password' => 'required|string',
        ]);

        $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
        $user = User::where($loginField, $request->login)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Check if user has completed profile setup
        if (!$user->location_lat) {
            return response()->json([
                'message' => 'Profile setup required',
                'requires_profile_setup' => true,
                'user' => $user,
            ], 200);
        }

        // Generate auth token and login
        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Send OTP for verification
     */
    public function sendOTP(Request $request)
    {
        $request->validate([
            'method' => 'required|in:email,phone',
            'user_id' => 'required|exists:users,id',
            'type' => 'required|in:registration,login', // Specify the flow type
        ]);

        $user = User::find($request->user_id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // For login, force email method to match web behavior
        if ($request->type === 'login') {
            $request->merge(['method' => 'email']);
        }

        try {
            $identifier = $request->method === 'email' ? $user->email : $user->phone;
            $otp = $this->otpService->sendOTP($identifier, $request->method, $user);

            return response()->json([
                'message' => 'OTP sent successfully',
                'method' => $request->method,
                'identifier' => $identifier,
                'token' => $otp->token,
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Verify OTP
     */
    public function verifyOTP(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
            'token' => 'required|string',
            'type' => 'required|in:registration,login',
        ]);

        $verified = $this->otpService->verifyOTP($request->token, $request->code);

        if (!$verified) {
            return response()->json(['message' => 'Invalid verification code'], 400);
        }

        // Find user from token
        $otpVerification = \App\Models\OTPVerification::where('token', $request->token)->first();
        $user = $otpVerification?->user;

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Mark user as verified based on method used
        if ($otpVerification->type === 'email') {
            $user->update(['email_verified_at' => now()]);
        } elseif ($otpVerification->type === 'phone') {
            $user->update(['phone_verified_at' => now()]);
        }

        if ($request->type === 'login') {
            // For login, return auth token
            $token = $user->createToken('mobile-app')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'user' => $user,
                'token' => $token,
            ]);
        } else {
            // For registration, just confirm verification
            return response()->json([
                'message' => 'Account verified successfully',
                'user' => $user,
            ]);
        }
    }

    /**
     * Complete profile setup
     */
    public function completeProfile(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'location_address' => 'required|string|max:500',
            'location_lat' => 'required|numeric|between:-90,90',
            'location_lng' => 'required|numeric|between:-180,180',
            'discovery_radius_km' => 'required|integer|min:1|max:50',
        ]);

        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user->update([
            'name' => $request->name,
            'location_address' => $request->location_address,
            'location_lat' => $request->location_lat,
            'location_lng' => $request->location_lng,
            'discovery_radius_km' => $request->discovery_radius_km,
        ]);

        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'message' => 'Profile completed successfully',
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Forgot Password - Send OTP
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'login' => 'required|string', // email or phone
        ]);

        $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
        $user = User::where($loginField, $request->login)->first();

        if (!$user) {
            // We return 200 even if user not found for security reasons
            return response()->json(['message' => 'If the account exists, an OTP has been sent.']);
        }

        try {
            $method = $loginField;
            $identifier = $request->login;
            $otp = $this->otpService->sendOTP($identifier, $method, $user);

            return response()->json([
                'message' => 'OTP sent successfully',
                'token' => $otp->token,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Reset Password using OTP
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
            'token' => 'required|string',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $verified = $this->otpService->verifyOTP($request->token, $request->code);

        if (!$verified) {
            return response()->json(['message' => 'Invalid or expired verification code'], 400);
        }

        $otpVerification = \App\Models\OTPVerification::where('token', $request->token)->first();
        $user = $otpVerification?->user;

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Password reset successfully']);
    }

    /**
     * Change Password (Authenticated)
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = Auth::user();
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Password changed successfully']);
    }
}
