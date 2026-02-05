<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WalletController extends Controller
{
    /**
     * Performer Wallet - Show earnings, balance, and withdrawal options
     */
    public function index()
    {
        $user = Auth::user();
        
        // Sum all captured payments where user was the performer (total earned)
        $totalEarned = Payment::whereHas('mission', function($query) use ($user) {
                $query->where('assigned_user_id', $user->id);
            })
            ->where('status', 'captured')
            ->sum('performer_amount');

        // Sync balance if out of date
        $actualBalance = $totalEarned - $user->total_withdrawn;
        if (round($user->balance, 2) != round($actualBalance, 2)) {
            $user->balance = $actualBalance;
            $user->save();
        }

        // Get earnings transactions
        $transactions = Payment::whereHas('mission', function($query) use ($user) {
                $query->where('assigned_user_id', $user->id);
            })
            ->where('status', 'captured')
            ->with('mission:id,title')
            ->orderByDesc('captured_at')
            ->get();

        // Get pending withdrawals
        $pendingWithdrawals = $user->withdrawals()
            ->whereIn('status', [Withdrawal::STATUS_PENDING, Withdrawal::STATUS_APPROVED])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Wallet', [
            'balance' => $user->balance,
            'availableBalance' => $user->available_balance,
            'pendingWithdrawal' => $user->pending_withdrawal,
            'totalWithdrawn' => $user->total_withdrawn,
            'transactions' => $transactions,
            'pendingWithdrawals' => $pendingWithdrawals,
        ]);
    }

    /**
     * Client Wallet - Show spending history
     */
    public function clientIndex()
    {
        $user = Auth::user();

        // Get all payments for missions created by this user
        $payments = Payment::whereHas('mission', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->where('status', 'captured')
            ->with('mission:id,title,assigned_user_id')
            ->orderByDesc('captured_at')
            ->get();

        $totalSpent = $payments->sum('amount');

        return Inertia::render('ClientWallet', [
            'totalSpent' => $totalSpent,
            'payments' => $payments,
        ]);
    }

    /**
     * Request a withdrawal
     */
    public function requestWithdrawal(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'amount' => 'required|numeric|min:10|max:' . $user->available_balance,
            'bank_details' => 'required|array',
            'bank_details.account_holder' => 'required|string|max:255',
            'bank_details.iban' => 'required|string|max:34',
            'bank_details.bank_name' => 'nullable|string|max:255',
        ]);

        // Create withdrawal request
        $withdrawal = $user->withdrawals()->create([
            'amount' => $validated['amount'],
            'status' => Withdrawal::STATUS_PENDING,
            'bank_details' => $validated['bank_details'],
        ]);

        // Update user's pending withdrawal amount
        $user->increment('pending_withdrawal', $validated['amount']);

        return back()->with('success', 'Withdrawal request submitted successfully! We will process it within 3-5 business days.');
    }

    /**
     * Cancel a pending withdrawal request
     */
    public function cancelWithdrawal(Withdrawal $withdrawal)
    {
        $user = Auth::user();

        // Verify ownership and status
        if ($withdrawal->user_id !== $user->id) {
            abort(403);
        }

        if ($withdrawal->status !== Withdrawal::STATUS_PENDING) {
            return back()->withErrors(['withdrawal' => 'Only pending withdrawals can be cancelled.']);
        }

        // Return amount to available balance
        $user->decrement('pending_withdrawal', $withdrawal->amount);

        // Delete the withdrawal request
        $withdrawal->delete();

        return back()->with('success', 'Withdrawal request cancelled.');
    }
}
