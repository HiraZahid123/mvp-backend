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
        $commissionPercent = config('services.stripe.commission_percent');
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

    /**
     * Create a Stripe Express account for a provider.
     */
    public function createExpressAccount(\App\Models\User $user): \Stripe\Account
    {
        try {
            return $this->stripe->accounts->create([
                'type'          => 'express',
                'country'       => config('services.stripe.account_country', 'CH'),
                'email'         => $user->email,
                'capabilities' => [
                    'card_payments' => ['requested' => true],
                    'transfers' => ['requested' => true],
                ],
                'business_type' => 'individual',
                'metadata' => [
                    'user_id' => $user->id,
                ],
            ]);
        } catch (\Stripe\Exception\ApiErrorException $e) {
            \Illuminate\Support\Facades\Log::error('Stripe Connect Account Creation Failed: ' . $e->getMessage());
            throw new \Exception('Failed to create payment account. ' . $e->getMessage());
        }
    }

    /**
     * Create an account link for Stripe onboarding.
     */
    public function createAccountLink(string $stripeAccountId): \Stripe\AccountLink
    {
        try {
            return $this->stripe->accountLinks->create([
                'account' => $stripeAccountId,
                'refresh_url' => route('stripe.connect.refresh'),
                'return_url' => route('stripe.connect.return'),
                'type' => 'account_onboarding',
            ]);
        } catch (\Stripe\Exception\ApiErrorException $e) {
            \Illuminate\Support\Facades\Log::error('Stripe Account Link Creation Failed: ' . $e->getMessage());
            throw new \Exception('Failed to generate onboarding link. ' . $e->getMessage());
        }
    }

    /**
     * Transfer funds from the platform to a connected account.
     */
    public function transferFunds(\App\Models\User $provider, float $amount, string $withdrawalId): \Stripe\Transfer
    {
        if (!$provider->stripe_connect_id) {
            throw new \Exception("Provider does not have a linked Stripe account.");
        }

        try {
            return $this->stripe->transfers->create([
                'amount' => $amount * 100, // Convert to cents
                'currency' => config('services.stripe.currency', 'chf'),
                'destination' => $provider->stripe_connect_id,
                'metadata' => [
                    'withdrawal_id' => $withdrawalId,
                    'user_id' => $provider->id,
                ],
            ]);
        } catch (\Stripe\Exception\ApiErrorException $e) {
            \Illuminate\Support\Facades\Log::error("Stripe Transfer Failed for Withdrawal {$withdrawalId}: " . $e->getMessage());
            throw new \Exception("Stripe Transfer Failed: " . $e->getMessage());
        }
    }

    /**
     * Get the status of a connected account.
     */
    public function getAccountStatus(string $stripeAccountId): array
    {
        try {
            $account = $this->stripe->accounts->retrieve($stripeAccountId);
            return [
                'is_verified' => empty($account->requirements->currently_due) && $account->charges_enabled && $account->payouts_enabled,
                'status' => $account->requirements->currently_due ? 'pending_requirements' : 'verified',
                'details' => $account->toArray(),
            ];
        } catch (\Stripe\Exception\ApiErrorException $e) {
            \Illuminate\Support\Facades\Log::error("Stripe Account Retrieval Failed: " . $e->getMessage());
            return [
                'is_verified' => false,
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Resolve a dispute by splitting funds between client and provider.
     */
    public function resolveDispute(Mission $mission, float $providerAmount, float $refundAmount): void
    {
        if ($mission->payment_intent_id) {
            try {
                // 1. Capture the partial amount for the provider
                // Note: platform_commission should still be handled or adjusted
                $this->stripe->paymentIntents->capture($mission->payment_intent_id, [
                    'amount_to_capture' => $providerAmount * 100,
                ]);

                // 2. Refund the remaining amount is implied if not captured, 
                // but for 'manual_capture' it just releases the rest eventually.
                // To be explicit, Stripe doesn't have a 'partial_release' as a single call.
                // Usually, the uncaptured amount is released automatically by the bank after 7 days.
            } catch (\Stripe\Exception\ApiErrorException $e) {
                \Illuminate\Support\Facades\Log::error("Stripe Dispute Resolution Failed: " . $e->getMessage());
                throw new \Exception("Stripe Dispute Resolution Failed: " . $e->getMessage());
            }
        }
    }
}
