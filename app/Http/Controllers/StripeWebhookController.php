<?php

namespace App\Http\Controllers;

use App\Models\Mission;
use App\Models\Payment;
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
        }
        
        return response()->json(['status' => 'success']);
    }
    
    protected function handlePaymentSucceeded($paymentIntent)
    {
        // payment_intent.succeeded is for immediate capture
        // We use it as a fallback or for direct payments if we ever add them
        $this->markAsHeld($paymentIntent);
    }

    protected function handlePaymentAuthorized($paymentIntent)
    {
        // This is specifically for manual capture (amount_capturable_updated)
        // This is the status 'requires_capture'
        $this->markAsHeld($paymentIntent);
    }

    protected function markAsHeld($paymentIntent)
    {
        $payment = Payment::where('payment_intent_id', $paymentIntent->id)->first();
        
        if ($payment) {
            $payment->update([
                'status' => Payment::STATUS_HELD,
                'held_at' => now(),
            ]);
            
            $mission = $payment->mission;
            
            // If mission was waiting for payment to be secured
            // Note: We don't auto-confirm yet, we let the user click "Confirm Assignment"
            // but we could notify them or update UI state.
        }
    }
    
    protected function handlePaymentFailed($paymentIntent)
    {
        // Handle failed payment (notify user, unlock mission logic if needed)
    }
    
    protected function handleRefund($charge)
    {
        // Handle refund logic
        if (isset($charge->payment_intent)) {
             $payment = Payment::where('payment_intent_id', $charge->payment_intent)->first();
             if ($payment) {
                 $payment->update([
                     'status' => 'refunded',
                     'refunded_at' => now(),
                 ]);
                 
                 // Potentially cancel mission or update status if not already
             }
        }
    }
}
