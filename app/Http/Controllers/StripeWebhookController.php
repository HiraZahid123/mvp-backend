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
            case 'charge.refunded':
                $this->handleRefund($event->data->object);
                break;
        }
        
        return response()->json(['status' => 'success']);
    }
    
    protected function handlePaymentSucceeded($paymentIntent)
    {
        $payment = Payment::where('payment_intent_id', $paymentIntent->id)->first();
        
        if ($payment) {
            $payment->update([
                'status' => 'held',
                'held_at' => now(),
            ]);
            
            $mission = $payment->mission;
            
            // If mission was waiting for payment to be secured
            if ($mission->status === Mission::STATUS_EN_NEGOCIATION || $mission->status === Mission::STATUS_OUVERTE) {
                 $mission->transitionTo(Mission::STATUS_VERROUILLEE);
            
                 // Reveal address and notify via chat
                 $mission->revealAddress();
            }
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
