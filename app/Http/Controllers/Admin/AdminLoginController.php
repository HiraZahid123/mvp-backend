<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
class AdminLoginController extends Controller
{
    protected $otpService;

    public function __construct(\App\Services\OTPService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Show the admin login form.
     */
    public function create()
    {
        return Inertia::render('Admin/Login');
    }

    /**
     * Handle admin login.
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->where('is_admin', true)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return back()->withErrors([
                'email' => 'Invalid admin credentials.',
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('admin.dashboard');
    }

    /**
     * Show the 2FA verification form.
     */
    public function show2FA()
    {
        if (session('admin_2fa_verified')) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Admin/Verify2FA', [
            'email' => Auth::user()->email,
        ]);
    }

    /**
     * Verify 2FA OTP.
     */
    public function verify2FA(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $token = session('admin_2fa_token');
        if (!$token) {
            return redirect()->route('admin.login')->withErrors(['email' => 'Session expired. Please login again.']);
        }

        if ($this->otpService->verifyOTP($token, $request->code)) {
            session(['admin_2fa_verified' => true]);
            return redirect()->route('admin.dashboard');
        }

        return back()->withErrors(['code' => 'Invalid or expired code.']);
    }

    /**
     * Resend 2FA OTP.
     */
    public function resend2FA()
    {
        $user = Auth::user();
        $otpVerification = $this->otpService->sendOTP($user->email, 'email', $user);
        session(['admin_2fa_token' => $otpVerification->token]);

        return back()->with('message', 'A new verification code has been sent to your email.');
    }

    /**
     * Logout admin.
     */
    public function destroy(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
