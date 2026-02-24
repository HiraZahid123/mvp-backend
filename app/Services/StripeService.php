<?php

namespace App\Services;

use App\Models\Mission;
use App\Models\Payment;
use Stripe\StripeClient;

class StripeService
{
    protected $stripe;
    
    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }
    
    public function createHold(Mission $mission): \Stripe\PaymentIntent
    {
        $amount = $mission->budget * 100; // Convert to cents
        $commissionPercent = config('services.stripe.commission_percent', 15);
        $commission = $amount * ($commissionPercent / 100);
        
        try {
            $paymentIntent = $this->stripe->paymentIntents->create([
                'amount' => $amount,
                'currency' => config('services.stripe.currency', 'chf'),
                'capture_method' => 'manual', // Hold funds, don't capture yet
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
                'metadata' => [
                    'mission_id' => $mission->id,
                    'client_id' => $mission->user_id,
                    'provider_id' => $mission->assigned_user_id,
                    'platform_commission' => $commission / 100,
                ],
            ]);
        } catch (\Stripe\Exception\ApiErrorException $e) {
            \Illuminate\Support\Facades\Log::error('Stripe Hold Creation Failed: ' . $e->getMessage());
            throw new \Exception('Payment processing failed. Please try again.');
        }
        
        // Track payment locally
        Payment::create([
            'mission_id' => $mission->id,
            'payment_intent_id' => $paymentIntent->id,
            'status' => 'pending',
            'amount' => $mission->budget,
            'platform_commission' => $commission / 100,
            'provider_amount' => ($amount - $commission) / 100,
            'stripe_metadata' => $paymentIntent->toArray(),
        ]);

        // Sync to Mission model for fast access and fallback
        $mission->update([
            'payment_intent_id' => $paymentIntent->id,
            'platform_commission' => $commission / 100,
        ]);
        
        return $paymentIntent;
    }
    public function getPaymentIntent(string $id): \Stripe\PaymentIntent
    {
        return $this->stripe->paymentIntents->retrieve($id);
    }

    public function isAuthorized(string $id): bool
    {
        try {
            $pi = $this->getPaymentIntent($id);
            return $pi->status === 'requires_capture';
        } catch (\Exception $e) {
            return false;
        }
    }
    
    public function releaseFunds(Mission $mission): void
    {
        $payment = Payment::where('mission_id', $mission->id)->first();
        $piId = $payment ? $payment->payment_intent_id : $mission->payment_intent_id;

        if (!$piId) {
            \Illuminate\Support\Facades\Log::error("Funds release failed: No Payment Intent ID found for mission {$mission->id}");
            throw new \Exception('Funds capture failed: No payment intent found.');
        }
        
        try {
            $this->stripe->paymentIntents->capture($piId);
            
            if ($payment) {
                $payment->update([
                    'status' => 'captured',
                    'captured_at' => now(),
                ]);
            } else {
                // Update mission directly if payment record is missing
                $mission->update(['status' => Mission::STATUS_TERMINEE]);
            }
        } catch (\Stripe\Exception\ApiErrorException $e) {
            \Illuminate\Support\Facades\Log::error('Stripe Capture Failed: ' . $e->getMessage());
            throw new \Exception('Funds capture failed: ' . $e->getMessage());
        }
    }
    
    public function refund(Mission $mission, string $reason = null): void
    {
        $payment = Payment::where('mission_id', $mission->id)->firstOrFail();
        
        try {
            $this->stripe->refunds->create([
                'payment_intent' => $payment->payment_intent_id,
                'reason' => 'requested_by_client',
            ]);
            
            $payment->update([
                'status' => 'refunded',
                'refunded_at' => now(),
                'refund_reason' => $reason,
            ]);
        } catch (\Stripe\Exception\ApiErrorException $e) {
            \Illuminate\Support\Facades\Log::error('Stripe Refund Failed: ' . $e->getMessage());
            throw new \Exception('Refund processing failed.');
        }
    }
}
