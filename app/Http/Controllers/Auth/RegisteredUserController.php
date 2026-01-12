<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
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
            // email_verified_at is null - will be set after code verification
            // role_type will be selected later
        ]);

        event(new Registered($user));

        // Generate 6-digit code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Delete old codes for this email
        DB::table('email_verification_codes')
            ->where('email', $request->email)
            ->delete();

        // Store code with 10-minute expiration
        DB::table('email_verification_codes')->insert([
            'email' => $request->email,
            'code' => $code,
            'expires_at' => now()->addMinutes(10),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Send email
        try {
            Mail::send('emails.verification-code', ['code' => $code], function ($message) use ($request) {
                $message->to($request->email)
                        ->subject('OFLEM - Code de vérification');
            });
        } catch (\Exception $e) {
            // Log error but continue - user can resend
            logger()->error('Failed to send verification email: ' . $e->getMessage());
        }

        // Store email in session for verification page
        Session::put('verification_email', $request->email);

        return redirect()->route('auth.verify-email-code');
    }
}
