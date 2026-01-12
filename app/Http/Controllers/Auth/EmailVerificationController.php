<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationController extends Controller
{
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

        // Generate 6-digit code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Delete old codes for this email
        DB::table('email_verification_codes')
            ->where('email', $request->email)
            ->delete();

        // Store new code with 10-minute expiration
        DB::table('email_verification_codes')->insert([
            'email' => $request->email,
            'code' => $code,
            'expires_at' => now()->addMinutes(10),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Send email
        Mail::send('emails.verification-code', ['code' => $code], function ($message) use ($request) {
            $message->to($request->email)
                    ->subject('OFLEM - Code de vérification');
        });

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

        // Find the code
        $verification = DB::table('email_verification_codes')
            ->where('email', $request->email)
            ->where('code', $request->code)
            ->first();

        if (!$verification) {
            throw ValidationException::withMessages([
                'code' => 'Code de vérification invalide.',
            ]);
        }

        // Check if expired
        if (now()->isAfter($verification->expires_at)) {
            DB::table('email_verification_codes')
                ->where('email', $request->email)
                ->delete();
                
            throw ValidationException::withMessages([
                'code' => 'Le code de vérification a expiré.',
            ]);
        }

        // Mark email as verified
        DB::table('users')
            ->where('email', $request->email)
            ->update(['email_verified_at' => now()]);

        // Delete the code
        DB::table('email_verification_codes')
            ->where('email', $request->email)
            ->delete();

        // Clear session
        session()->forget('verification_email');

        // Log the user in
        $user = \App\Models\User::where('email', $request->email)->first();
        \Illuminate\Support\Facades\Auth::login($user);

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
