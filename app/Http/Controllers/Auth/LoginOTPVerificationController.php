<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OTPService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class LoginOTPVerificationController extends Controller
{
    protected OTPService $otpService;

    public function __construct(OTPService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Show the login OTP verification form.
     */
    public function create(Request $request)
    {
        $userId = Session::get('login_user_id');
        $email = Session::get('login_email');

        if (!$userId || !$email) {
            return redirect()->route('login');
        }

        // Automatically send OTP to email when the page loads
        try {
            $user = User::find($userId);
            if ($user) {
                $otp = $this->otpService->sendOTP($user->email, 'email', $user);
                Session::put("login_otp_token", $otp->token);
                Session::put("login_otp_method", 'email');
            }
        } catch (\Exception $e) {
            // Log error but continue - user can retry
            \Log::error('Failed to send login OTP: ' . $e->getMessage());
        }

        return Inertia::render('Auth/VerifyLoginOTP', [
            'email' => $email,
        ]);
    }

    /**
     * Resend OTP to email for login verification
     */
    public function sendOTP(Request $request)
    {
        $userId = Session::get('login_user_id');

        if (!$userId) {
            return response()->json(['message' => 'Session expired'], 400);
        }

        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        try {
            $otp = $this->otpService->sendOTP($user->email, 'email', $user);

            // Store the OTP token in session
            Session::put("login_otp_token", $otp->token);
            Session::put("login_otp_method", 'email');

            return response()->json([
                'message' => 'OTP sent successfully to your email',
                'identifier' => $user->email,
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Verify the login OTP code.
     */
    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $userId = Session::get('login_user_id');
        $otpToken = Session::get('login_otp_token');

        if (!$userId || !$otpToken) {
            return back()->withErrors(['general' => 'Session expired. Please login again.']);
        }

        $user = User::find($userId);

        if (!$user) {
            return back()->withErrors(['general' => 'User not found. Please login again.']);
        }

        try {
            // Verify OTP
            $verified = $this->otpService->verifyOTP($otpToken, $request->code);

            if (!$verified) {
                return back()->withErrors(['code' => 'Invalid verification code.']);
            }

            // Clear session data and log the user in
            Session::forget(['login_user_id', 'login_email', 'login_phone', 'login_otp_token', 'login_otp_method']);

            Auth::login($user);
            $request->session()->regenerate();

            return redirect()->intended(route('dashboard', absolute: false));

        } catch (\Exception $e) {
            return back()->withErrors(['general' => 'Verification failed. Please try again.']);
        }
    }
}
