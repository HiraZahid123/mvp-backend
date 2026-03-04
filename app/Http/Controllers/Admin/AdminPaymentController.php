<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\AdminActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminPaymentController extends Controller
{
    public function index()
    {
        $payments = Payment::with(['mission.user', 'mission.assignedUser'])
            ->latest()
            ->paginate(20);

        return \Inertia\Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
        ]);
    }

    public function show(Payment $payment)
    {
        $payment->load(['mission.user', 'mission.assignedUser']);

        return \Inertia\Inertia::render('Admin/Payments/Show', [
            'payment' => $payment,
        ]);
    }

    public function issueRefund(Request $request, Payment $payment)
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        // Integrate with StripeService refund logic
        app(\App\Services\StripeService::class)->refund($payment->mission);

        AdminActivityLog::create([
            'admin_id' => Auth::id(),
            'action' => 'payment_refunded',
            'subject_type' => Payment::class,
            'subject_id' => $payment->id,
            'metadata' => ['reason' => $request->reason],
        ]);

        return response()->json(['message' => 'Refund processed successfully']);
    }

    public function resolveDispute(Request $request, Payment $payment)
    {
        $request->validate([
            'provider_amount' => 'required|numeric|min:0',
            'client_refund' => 'required|numeric|min:0',
            'reason' => 'required|string',
        ]);

        $mission = $payment->mission;

        // Use Stripe service to handle the split
        app(\App\Services\StripeService::class)->resolveDispute(
            $mission,
            $request->provider_amount,
            $request->client_refund
        );

        $payment->update([
            'status' => 'dispute_resolved',
            'provider_amount' => $request->provider_amount,
            'refunded_at' => now(),
        ]);

        $mission->update(['status' => 'RESOLVED']);

        AdminActivityLog::create([
            'admin_id' => Auth::id(),
            'action' => 'dispute_resolved',
            'subject_type' => Payment::class,
            'subject_id' => $payment->id,
            'metadata' => [
                'provider_amount' => $request->provider_amount,
                'client_refund' => $request->client_refund,
                'reason' => $request->reason
            ],
        ]);

        return response()->json(['message' => 'Dispute resolved and funds split successfully']);
    }
}
