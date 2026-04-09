<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use App\Models\Withdrawal;
use App\Notifications\WithdrawalStatusNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminWithdrawalController extends Controller
{
    /**
     * Display all withdrawal requests
     */
    public function index(Request $request)
    {
        $status = $request->get('status', 'pending');

        $withdrawals = Withdrawal::with('user:id,name,email,username')
            ->when($status !== 'all', function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->orderByDesc('created_at')
            ->paginate(20);

        $stats = [
            'pending' => Withdrawal::where('status', Withdrawal::STATUS_PENDING)->count(),
            'approved' => Withdrawal::where('status', Withdrawal::STATUS_APPROVED)->count(),
            'completed' => Withdrawal::where('status', Withdrawal::STATUS_COMPLETED)->count(),
            'rejected' => Withdrawal::where('status', Withdrawal::STATUS_REJECTED)->count(),
        ];

        return Inertia::render('Admin/AdminWithdrawals', [
            'withdrawals' => $withdrawals,
            'stats' => $stats,
            'currentStatus' => $status,
        ]);
    }

    /**
     * Approve a withdrawal request
     */
    public function approve(Request $request, Withdrawal $withdrawal)
    {
        if ($withdrawal->status !== Withdrawal::STATUS_PENDING) {
            return back()->withErrors(['withdrawal' => 'Only pending withdrawals can be approved.']);
        }

        $withdrawal->update([
            'status'       => Withdrawal::STATUS_APPROVED,
            'processed_by' => Auth::id(),
            'processed_at' => now(),
            'admin_notes'  => $request->input('admin_notes'),
        ]);

        AdminActivityLog::create([
            'admin_id'     => Auth::id(),
            'action'       => 'withdrawal_approved',
            'subject_type' => Withdrawal::class,
            'subject_id'   => $withdrawal->id,
            'metadata'     => ['amount' => $withdrawal->amount, 'user_id' => $withdrawal->user_id],
        ]);

        $withdrawal->user->notify(new WithdrawalStatusNotification($withdrawal->fresh()));

        return back()->with('success', 'Withdrawal approved successfully. Please process the bank transfer.');
    }

    /**
     * Reject a withdrawal request
     */
    public function reject(Request $request, Withdrawal $withdrawal)
    {
        if ($withdrawal->status !== Withdrawal::STATUS_PENDING) {
            return back()->withErrors(['withdrawal' => 'Only pending withdrawals can be rejected.']);
        }

        $request->validate([
            'admin_notes' => 'required|string|max:500',
        ]);

        $user = $withdrawal->user;
        $adminId = Auth::id();

        // Both mutations must succeed or fail together: a partial failure would leave
        // pending_withdrawal decremented while the withdrawal still shows PENDING,
        // allowing a second approval/rejection on the same record.
        DB::transaction(function () use ($user, $withdrawal, $request, $adminId) {
            $user->decrement('pending_withdrawal', $withdrawal->amount);

            $withdrawal->update([
                'status'       => Withdrawal::STATUS_REJECTED,
                'processed_by' => $adminId,
                'processed_at' => now(),
                'admin_notes'  => $request->input('admin_notes'),
            ]);
        });

        AdminActivityLog::create([
            'admin_id'     => Auth::id(),
            'action'       => 'withdrawal_rejected',
            'subject_type' => Withdrawal::class,
            'subject_id'   => $withdrawal->id,
            'metadata'     => [
                'amount'      => $withdrawal->amount,
                'user_id'     => $withdrawal->user_id,
                'admin_notes' => $request->input('admin_notes'),
            ],
        ]);

        $withdrawal->user->notify(new WithdrawalStatusNotification($withdrawal->fresh()));

        return back()->with('success', 'Withdrawal rejected. Amount returned to user\'s available balance.');
    }

    /**
     * Mark withdrawal as completed (after bank transfer)
     */
    public function complete(Request $request, Withdrawal $withdrawal)
    {
        if ($withdrawal->status !== Withdrawal::STATUS_APPROVED) {
            return back()->withErrors(['withdrawal' => 'Only approved withdrawals can be marked as completed.']);
        }

        $user = $withdrawal->user;

        // ★ AUTOMATED PAYOUT: Trigger Stripe Transfer if linked
        if ($user->stripe_connect_id) {
            try {
                $stripe = app(\App\Services\StripeService::class);

                // ★ PRODUCT READY: Verify account status before transfer
                $status = $stripe->getAccountStatus($user->stripe_connect_id);
                if (!$status['is_verified']) {
                    return back()->withErrors(['withdrawal' => 'Provider Stripe account is not fully verified or is restricted. Status: ' . $status['status']]);
                }

                $stripe->transferFunds(
                    $user,
                    $withdrawal->amount,
                    $withdrawal->id
                );
            } catch (\Exception $e) {
                return back()->withErrors(['withdrawal' => 'Automated Stripe Transfer Failed: ' . $e->getMessage()]);
            }
        }

        // Wrap all DB mutations atomically — if any step fails the whole block rolls back
        DB::transaction(function () use ($user, $withdrawal, $request) {
            $user->decrement('balance', $withdrawal->amount);
            $user->decrement('pending_withdrawal', $withdrawal->amount);
            $user->increment('total_withdrawn', $withdrawal->amount);

            $withdrawal->update([
                'status'      => Withdrawal::STATUS_COMPLETED,
                'admin_notes' => $request->input('admin_notes', $withdrawal->admin_notes),
            ]);

            AdminActivityLog::create([
                'admin_id'     => Auth::id(),
                'action'       => 'withdrawal_completed',
                'subject_type' => Withdrawal::class,
                'subject_id'   => $withdrawal->id,
                'metadata'     => [
                    'amount'              => $withdrawal->amount,
                    'user_id'             => $withdrawal->user_id,
                    'stripe_transfer_used' => (bool) $user->stripe_connect_id,
                ],
            ]);
        });

        $withdrawal->user->notify(new WithdrawalStatusNotification($withdrawal->fresh()));

        return back()->with('success', 'Withdrawal completed' . ($user->stripe_connect_id ? ' and automated transfer triggered.' : '.'));
    }
}
