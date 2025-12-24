<?php

namespace App\Services;

use App\Models\OTPVerification;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Twilio\Rest\Client;
use Carbon\Carbon;

class OTPService
{
    protected Client $twilio;

    public function __construct()
    {
        $this->twilio = new Client(
            config('services.twilio.sid'),
            config('services.twilio.token')
        );
    }

    /**
     * Send OTP to email or phone
     */
    public function sendOTP(string $identifier, string $type, ?User $user = null): OTPVerification
    {
        // Check for existing active OTP
        $existingOTP = OTPVerification::findActiveByIdentifier($identifier, $type);
        if ($existingOTP) {
            // Check rate limiting (5 requests per hour)
            $recentOTPs = OTPVerification::where('identifier', $identifier)
                ->where('type', $type)
                ->where('created_at', '>', now()->subHour())
                ->count();

            if ($recentOTPs >= 5) {
                throw new \Exception('Too many OTP requests. Please wait before requesting another code.');
            }
        }

        // Generate new OTP
        $otp = OTPVerification::generateOTP();
        $token = OTPVerification::generateToken();

        $otpVerification = OTPVerification::create([
            'user_id' => $user?->id,
            'identifier' => $identifier,
            'type' => $type,
            'otp_code' => Hash::make($otp),
            'token' => $token,
            'expires_at' => now()->addMinutes(5),
        ]);

        // Send OTP
        if ($type === 'email') {
            $this->sendEmailOTP($identifier, $otp);
        } elseif ($type === 'phone') {
            $this->sendSMSOTP($identifier, $otp);
        }

        return $otpVerification;
    }

    /**
     * Verify OTP code
     */
    public function verifyOTP(string $token, string $code): bool
    {
        $otpVerification = OTPVerification::findByToken($token);

        if (!$otpVerification || $otpVerification->isExpired() || $otpVerification->isVerified()) {
            return false;
        }

        if (!$otpVerification->canAttempt()) {
            return false;
        }

        if (!Hash::check($code, $otpVerification->otp_code)) {
            $otpVerification->incrementAttempts();
            return false;
        }

        $otpVerification->verify();
        return true;
    }

    /**
     * Send OTP via email
     */
    protected function sendEmailOTP(string $email, string $otp): void
    {
        try {
            // For development, just log the OTP
            if (app()->environment('local')) {
                Log::info("Email OTP for {$email}: {$otp}");
                return;
            }

            // TODO: Send actual email
            Mail::raw("Your OTP code is: {$otp}", function ($message) use ($email) {
                $message->to($email)
                        ->subject('Your OTP Code');
            });
        } catch (\Exception $e) {
            Log::error('Failed to send email OTP: ' . $e->getMessage());
            throw new \Exception('Failed to send OTP email. Please try again.');
        }
    }

    /**
     * Send OTP via SMS
     */
    protected function sendSMSOTP(string $phone, string $otp): void
    {
        try {
            // For development, just log the OTP
            if (app()->environment('local')) {
                Log::info("SMS OTP for {$phone}: {$otp}");
                return;
            }

            $this->twilio->messages->create(
                $phone,
                [
                    'from' => config('services.twilio.from'),
                    'body' => "Your OTP code is: {$otp}"
                ]
            );
        } catch (\Exception $e) {
            Log::error('Failed to send SMS OTP: ' . $e->getMessage());
            throw new \Exception('Failed to send OTP SMS. Please try again.');
        }
    }

    /**
     * Clean up expired OTPs
     */
    public function cleanupExpiredOTPs(): int
    {
        return OTPVerification::where('expires_at', '<', now())
            ->whereNull('verified_at')
            ->delete();
    }
}
