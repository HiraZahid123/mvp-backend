<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OTPService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class OTPVerificationController extends Controller
{
    protected OTPService $otpService;

    public function __construct(OTPService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Show the OTP verification form.
     */
    public function create(Request $request)
    {
        $userId = Session::get('user_id');

        if (!$userId) {
            return redirect()->route('auth.select-role');
        }

        $user = User::find($userId);

        if (!$user) {
            return redirect()->route('auth.select-role');
        }

        return Inertia::render('Auth/VerifyOTP', [
            'email' => $user->email,
            'phone' => $user->phone,
        ]);
    }

    /**
     * Send OTP to chosen method
     */
    public function sendOTP(Request $request)
    {
        $request->validate([
            'method' => 'required|in:email,phone',
        ]);

        $userId = Session::get('user_id');

        if (!$userId) {
            return response()->json(['message' => 'Session expired'], 400);
        }

        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        try {
            $identifier = $request->method === 'email' ? $user->email : $user->phone;
            $otp = $this->otpService->sendOTP($identifier, $request->method, $user);

            // Store the OTP token in session
            Session::put("otp_token", $otp->token);
            Session::put("otp_method", $request->method);

            return response()->json([
                'message' => 'OTP sent successfully',
                'method' => $request->method,
                'identifier' => $identifier,
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Verify the OTP code.
     */
    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $userId = Session::get('user_id');
        $otpToken = Session::get('otp_token');
        $otpMethod = Session::get('otp_method');

        if (!$userId || !$otpToken || !$otpMethod) {
            return back()->withErrors(['general' => 'Session expired. Please start over.']);
        }

        $user = User::find($userId);

        if (!$user) {
            return back()->withErrors(['general' => 'User not found. Please start over.']);
        }

        try {
            // Verify OTP
            $verified = $this->otpService->verifyOTP($otpToken, $request->code);

            if (!$verified) {
                return back()->withErrors(['code' => 'Invalid verification code.']);
            }

            // Mark user as verified based on method used
            if ($otpMethod === 'email') {
                $user->update(['email_verified_at' => now()]);
            } elseif ($otpMethod === 'phone') {
                $user->update(['phone_verified_at' => now()]);
            }

            // Clear session data
            Session::forget(['user_id', 'otp_token', 'otp_method', 'selected_role']);

            // Log the user in
            Auth::login($user);

            return redirect()->route('auth.complete-profile');

        } catch (\Exception $e) {
            return back()->withErrors(['general' => 'Verification failed. Please try again.']);
        }
    }
}
