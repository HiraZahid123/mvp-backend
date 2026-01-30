<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\OTPService;
use App\Models\User;
use App\Models\OTPVerification;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationController extends Controller
{
    protected OTPService $otpService;

    public function __construct(OTPService $otpService)
    {
        $this->otpService = $otpService;
    }
    /**
     * Show the email verification page
     */
    public function create(): Response
    {
        $email = session('verification_email');
        
        if (!$email) {
            return redirect()->route('register');
        }

        return Inertia::render('Auth/VerifyEmailCode', [
            'email' => $email,
        ]);
    }

    /**
     * Send a 6-digit verification code to the user's email
     */
    public function sendCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        try {
            $otpVerification = $this->otpService->sendOTP($request->email, 'email', $user);
            session(['verification_token' => $otpVerification->token]);
            session(['verification_email' => $request->email]);
        } catch (\Exception $e) {
            return back()->withErrors(['email' => $e->getMessage()]);
        }

        return back()->with('status', 'Code de vérification envoyé !');
    }

    /**
     * Verify the 6-digit code
     */
    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|digits:6',
        ]);

        $token = session('verification_token');

        if (!$token) {
            // Fallback: search for active token for this email
            $otp = OTPVerification::where('identifier', $request->email)
                ->where('type', 'email')
                ->whereNull('verified_at')
                ->latest()
                ->first();
            $token = $otp?->token;
        }

        if (!$token || !$this->otpService->verifyOTP($token, $request->code)) {
            throw ValidationException::withMessages([
                'code' => 'Code de vérification invalide ou expiré.',
            ]);
        }

        // Mark email as verified
        $user = User::where('email', $request->email)->first();
        if ($user) {
            $user->update(['email_verified_at' => now()]);
            \Illuminate\Support\Facades\Auth::login($user);
        }

        // Clear session
        session()->forget(['verification_email', 'verification_token']);

        // Check for pending mission
        if (session()->has('pending_mission')) {
            return redirect()->route('missions.pending');
        }

        // Redirect to role selection
        return redirect()->route('auth.select-role');
    }

    /**
     * Resend verification code
     */
    public function resend(Request $request)
    {
        $email = session('verification_email') ?? $request->email;

        if (!$email) {
            return back()->withErrors(['email' => 'Email non trouvé.']);
        }

        return $this->sendCode(new Request(['email' => $email]));
    }
}
