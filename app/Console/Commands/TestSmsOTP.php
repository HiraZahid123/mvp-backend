<?php

namespace App\Console\Commands;

use App\Models\OTPVerification;
use App\Services\OTPService;
use Illuminate\Console\Command;

class TestSmsOTP extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sms:test {phone?} {--service=twilio}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test SMS OTP functionality with different services';

    protected OTPService $otpService;

    public function __construct(OTPService $otpService)
    {
        parent::__construct();
        $this->otpService = $otpService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $phone = $this->argument('phone') ?: $this->ask('Enter phone number (e.g., +1234567890)');
        $service = $this->option('service');

        $this->info("Testing SMS OTP with service: {$service}");
        $this->info("Phone number: {$phone}");

        // Test phone number formatting
        $formattedPhone = $this->formatPhoneNumber($phone);
        $this->info("Formatted phone: {$formattedPhone}");

        // Generate test OTP
        $otp = OTPVerification::generateOTP();
        $this->info("Generated OTP: {$otp}");

        // Test sending
        try {
            $this->info("Sending test SMS...");

            // Check if Twilio credentials are configured
            $sid = config('services.twilio.sid');
            $token = config('services.twilio.token');

            if (!$sid || !$token) {
                $this->warn("⚠️  Twilio credentials not configured.");
                $this->warn("📝 Add to your .env file:");
                $this->line("TWILIO_SID=your_account_sid");
                $this->line("TWILIO_TOKEN=your_auth_token");
                $this->line("TWILIO_FROM=+1234567890");
                $this->info("📱 OTP Code: {$otp}");
                $this->info("📋 Check Laravel logs for more details.");
                return 0;
            }

            // Force test mode for this command
            config(['services.twilio.test_mode' => true]);

            // Call the OTP service method directly
            $reflection = new \ReflectionClass($this->otpService);
            $method = $reflection->getMethod('sendSMSOTP');
            $method->setAccessible(true);

            $method->invoke($this->otpService, $formattedPhone, $otp);

            $this->info("✅ SMS sent successfully!");
            $this->info("📱 OTP Code: {$otp}");

        } catch (\Exception $e) {
            $this->error("❌ SMS sending failed: " . $e->getMessage());
            $this->info("📱 OTP Code for manual testing: {$otp}");
            return 1;
        }

        return 0;
    }

    protected function formatPhoneNumber(string $phone): string
    {
        // Remove any non-numeric characters except +
        $cleaned = preg_replace('/[^\d+]/', '', $phone);

        // If it starts with +, assume it's already international
        if (str_starts_with($cleaned, '+')) {
            return $cleaned;
        }

        // For US numbers, add +1 prefix
        if (strlen($cleaned) === 10) {
            return '+1' . $cleaned;
        }

        return $cleaned;
    }
}
