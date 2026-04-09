<?php

namespace App\Http\Controllers;

use App\Models\Mission;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        try {
            $event = Webhook::constructEvent(
                $payload,
                $sigHeader,
                config('services.stripe.webhook_secret')
            );
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // ★ PRODUCT READY: Log the webhook event
        $log = \App\Models\StripeWebhookLog::create([
            'stripe_event_id' => $event->id,
            'event_type' => $event->type,
            'payload' => json_decode($payload, true),
            'status' => 'pending',
        ]);

        try {
            switch ($event->type) {
                case 'payment_intent.succeeded':
                    $this->handlePaymentSucceeded($event->data->object);
                    break;
                case 'payment_intent.payment_failed':
                    $this->handlePaymentFailed($event->data->object);
                    break;
                case 'payment_intent.amount_capturable_updated':
                    $this->handlePaymentAuthorized($event->data->object);
                    break;
                case 'charge.refunded':
                    $this->handleRefund($event->data->object);
                    break;
                case 'account.updated':
                    $this->handleAccountUpdated($event->data->object);
                    break;
            }

            $log->update(['status' => 'processed']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Webhook processing failed (Event: {$event->id}): " . $e->getMessage());
            $log->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Internal server error during processing'], 500);
        }

        return response()->json(['status' => 'success']);
    }

    protected function handlePaymentSucceeded($paymentIntent)
    {
        // payment_intent.succeeded is for immediate capture
        $this->markAsHeld($paymentIntent);
    }

    protected function handlePaymentAuthorized($paymentIntent)
    {
        // This is specifically for manual capture (amount_capturable_updated)
        $this->markAsHeld($paymentIntent);
    }

    protected function markAsHeld($paymentIntent)
    {
        $payment = Payment::where('payment_intent_id', $paymentIntent->id)->first();

        if ($payment && $payment->status === Payment::STATUS_PENDING) {
            $payment->update([
                'status' => Payment::STATUS_HELD,
                'held_at' => now(),
            ]);

            // Note: Mission status is updated when the user clicks "Confirm Assignment"
            // which checks for this 'held' status.
        }
    }

    protected function handlePaymentFailed($paymentIntent)
    {
        $payment = Payment::where('payment_intent_id', $paymentIntent->id)->first();
        if ($payment) {
            $payment->update(['status' => Payment::STATUS_FAILED]);

            // Notify client that payment failed
            $payment->mission->user->notify(new \App\Notifications\PaymentFailedNotification($payment->mission));
        }
    }

    protected function handleRefund($charge)
    {
        if (isset($charge->payment_intent)) {
            $payment = Payment::where('payment_intent_id', $charge->payment_intent)->first();
            if ($payment) {
                // Do not overwrite a CAPTURED payment with REFUNDED.
                // A CAPTURED status means resolveDispute() performed a partial capture and
                // issued a partial refund — the charge.refunded webhook fires for that partial
                // refund but the payment is legitimately captured for the provider's share.
                // Overwriting it would break any downstream balance-credit check on STATUS_CAPTURED.
                if ($payment->status === Payment::STATUS_CAPTURED) {
                    return;
                }

                $payment->update([
                    'status' => Payment::STATUS_REFUNDED,
                    'refunded_at' => now(),
                    'external_reference_id' => $charge->refunds->data[0]->id ?? null,
                ]);
            }
        }
    }

    protected function handleAccountUpdated($account)
    {
        $user = User::where('stripe_connect_id', $account->id)->first();
        if ($user) {
            // Update user onboarding status based on requirements
            $requirements = $account->requirements;
            if (empty($requirements->currently_due) && $account->charges_enabled && $account->payouts_enabled) {
                // Account is fully verified
                // We could add a field to user table or log it
                \Illuminate\Support\Facades\Log::info("User {$user->id} Stripe account fully verified.");
            } else {
                \Illuminate\Support\Facades\Log::warning("User {$user->id} Stripe account has pending requirements.");
            }
        }
    }
}
