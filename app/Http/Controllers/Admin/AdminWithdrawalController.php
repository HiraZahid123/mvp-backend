<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use App\Notifications\WithdrawalStatusNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        // ★ Tier 3 #14 — Notify provider
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

        // Return amount to user's available balance
        $user = $withdrawal->user;
        $user->decrement('pending_withdrawal', $withdrawal->amount);

        $withdrawal->update([
            'status'       => Withdrawal::STATUS_REJECTED,
            'processed_by' => Auth::id(),
            'processed_at' => now(),
            'admin_notes'  => $request->input('admin_notes'),
        ]);

        // ★ Tier 3 #14 — Notify provider
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

        // Update user's withdrawal tracking
        $user->decrement('balance', $withdrawal->amount);
        $user->decrement('pending_withdrawal', $withdrawal->amount);
        $user->increment('total_withdrawn', $withdrawal->amount);

        $withdrawal->update([
            'status'      => Withdrawal::STATUS_COMPLETED,
            'admin_notes' => $request->input('admin_notes', $withdrawal->admin_notes),
        ]);

        // ★ Tier 3 #14 — Notify provider
        $withdrawal->user->notify(new WithdrawalStatusNotification($withdrawal->fresh()));

        return back()->with('success', 'Withdrawal marked as completed.');
    }
}
