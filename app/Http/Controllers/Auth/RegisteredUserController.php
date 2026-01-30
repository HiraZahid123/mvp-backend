<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Services\OTPService;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    protected OTPService $otpService;

    public function __construct(OTPService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Display the Welcome/Gateway screen with social login options
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Display the manual registration form
     */
    public function createManual(): Response
    {
        return Inertia::render('Auth/RegisterManual');
    }

    /**
     * Handle manual email registration
     * Creates user and sends email verification code
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Create user WITHOUT logging them in
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        try {
            // Generate and send OTP using centralized service
            $otpVerification = $this->otpService->sendOTP($request->email, 'email', $user);
            
            // Store token in session for verification page
            session(['verification_token' => $otpVerification->token]);
            session(['verification_email' => $request->email]);

        } catch (\Exception $e) {
            logger()->error('Failed to send verification OTP: ' . $e->getMessage());
            return back()->withErrors(['email' => 'Failed to send verification code. Please try again.']);
        }

        return redirect()->route('auth.verify-email-code');
    }
}
