<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WalletController extends Controller
{
    /**
     * Provider Wallet — balance, earnings, rating, analytics
     */
    public function index()
    {
        $user = Auth::user();

        $totalEarned = Payment::whereHas('mission', fn($q) => $q->where('assigned_user_id', $user->id))
            ->where('status', 'captured')
            ->sum('provider_amount');

        // Sync balance
        $actualBalance = $totalEarned - $user->total_withdrawn;
        if (round($user->balance, 2) != round($actualBalance, 2)) {
            $user->balance = $actualBalance;
            $user->save();
        }

        // Earnings transactions (with category)
        $transactions = Payment::whereHas('mission', fn($q) => $q->where('assigned_user_id', $user->id))
            ->where('status', 'captured')
            ->with('mission:id,title,category')
            ->orderByDesc('captured_at')
            ->get();

        // Category breakdown (by provider_amount)
        $categoryBreakdown = $transactions
            ->groupBy(fn($tx) => $tx->mission->category ?? 'Other')
            ->map(fn($g) => round($g->sum('provider_amount'), 2))
            ->sortByDesc(fn($v) => $v)
            ->toArray();

        // Earnings velocity — current month stats
        $now = now();
        $currentMonthTxs = $transactions->filter(
            fn($tx) => $tx->captured_at
                && $tx->captured_at->month === $now->month
                && $tx->captured_at->year  === $now->year
        );
        $currentMonthTotal = round($currentMonthTxs->sum('provider_amount'), 2);
        $dayOfMonth        = $now->day;
        $earningsPerDay    = $dayOfMonth > 0 ? round($currentMonthTotal / $dayOfMonth, 2) : 0;
        $projectedMonthly  = round($earningsPerDay * 30, 2);

        // Pending withdrawals
        $pendingWithdrawals = $user->withdrawals()
            ->whereIn('status', [Withdrawal::STATUS_PENDING, Withdrawal::STATUS_APPROVED])
            ->orderByDesc('created_at')
            ->get();

        // Completed / rejected withdrawal history
        $withdrawalHistory = $user->withdrawals()
            ->whereIn('status', [Withdrawal::STATUS_COMPLETED, Withdrawal::STATUS_REJECTED])
            ->orderByDesc('processed_at')
            ->get();

        return Inertia::render('Wallet', [
            'balance'             => $user->balance,
            'availableBalance'    => $user->available_balance,
            'pendingWithdrawal'   => $user->pending_withdrawal,
            'totalWithdrawn'      => $user->total_withdrawn,
            'transactions'        => $transactions,
            'categoryBreakdown'   => $categoryBreakdown,
            'pendingWithdrawals'  => $pendingWithdrawals,
            'withdrawalHistory'   => $withdrawalHistory,
            'rating'              => round((float) ($user->rating_cache ?? 0), 1),
            'reviewsCount'        => (int) ($user->reviews_count_cache ?? 0),
            'savedBankAccounts'   => $user->saved_bank_accounts ?? [],  // ★ Tier 2 #8
            // Tier 2 #7 — Earnings velocity
            'earningsVelocity'    => [
                'currentMonth'     => $currentMonthTotal,
                'perDay'           => $earningsPerDay,
                'projectedMonthly' => $projectedMonthly,
                'dayOfMonth'       => $dayOfMonth,
                'txCount'          => $currentMonthTxs->count(),
            ],
        ]);
    }

    /**
     * Client Wallet — spending history, commission, refunds/disputes
     */
    public function clientIndex()
    {
        $user = Auth::user();

        // Captured payments (paid missions)
        $payments = Payment::whereHas('mission', fn($q) => $q->where('user_id', $user->id))
            ->where('status', 'captured')
            ->with('mission:id,title,assigned_user_id,category', 'mission.assignedUser:id,name,avatar')
            ->orderByDesc('captured_at')
            ->get();

        $totalSpent      = round($payments->sum('amount'), 2);
        $totalCommission = round($payments->sum('platform_commission'), 2);
        $totalToProvider = round($payments->sum('provider_amount'), 2);

        $categoryBreakdown = $payments
            ->groupBy(fn($p) => $p->mission->category ?? 'Other')
            ->map(fn($g) => round($g->sum('amount'), 2))
            ->sortByDesc(fn($v) => $v)
            ->toArray();

        // ★ Tier 2 #9 — Refunded / Disputed payments
        $issuePayments = Payment::whereHas('mission', fn($q) => $q->where('user_id', $user->id))
            ->whereIn('status', [Payment::STATUS_REFUNDED, Payment::STATUS_DISPUTED])
            ->with('mission:id,title,category')
            ->orderByDesc('updated_at')
            ->get();

        $totalRefunded = round($issuePayments->where('status', 'refunded')->sum('amount'), 2);

        // ★ Tier 3 #13 — Repeat Provider Insights (loyalty tracking)
        $repeatProviders = $payments
            ->filter(fn($p) => $p->mission?->assigned_user_id)
            ->groupBy(fn($p) => $p->mission->assigned_user_id)
            ->map(fn($group, $providerId) => [
                'provider_id'    => $providerId,
                'provider_name'  => optional($group->first()->mission->assignedUser ?? null)->name ?? 'Provider #' . $providerId,
                'provider_avatar' => optional($group->first()->mission->assignedUser ?? null)->avatar,
                'mission_count'  => $group->count(),
                'total_paid'     => round($group->sum('amount'), 2),
            ])
            ->filter(fn($p) => $p['mission_count'] > 1)
            ->sortByDesc(fn($p) => $p['mission_count'])
            ->values()
            ->take(5)
            ->toArray();

        return Inertia::render('ClientWallet', [
            'totalSpent'        => $totalSpent,
            'totalCommission'   => $totalCommission,
            'totalToProvider'   => $totalToProvider,
            'categoryBreakdown' => $categoryBreakdown,
            'payments'          => $payments,
            'issuePayments'     => $issuePayments,
            'totalRefunded'     => $totalRefunded,
            'repeatProviders'   => $repeatProviders,   // ★ Tier 3 #13
        ]);
    }

    /**
     * ★ Tier 3 #12 — Tax Summary page (annual breakdown)
     */
    public function taxSummary()
    {
        $user = Auth::user();

        $transactions = Payment::whereHas('mission', fn($q) => $q->where('assigned_user_id', $user->id))
            ->where('status', 'captured')
            ->with('mission:id,title,category')
            ->orderByDesc('captured_at')
            ->get();

        // Group by year then month
        $byYear = [];
        foreach ($transactions as $tx) {
            if (!$tx->captured_at) continue;
            $year  = $tx->captured_at->year;
            $month = $tx->captured_at->format('M');
            if (!isset($byYear[$year])) {
                $byYear[$year] = ['year' => $year, 'total' => 0, 'commission' => 0, 'count' => 0, 'months' => []];
            }
            if (!isset($byYear[$year]['months'][$month])) {
                $byYear[$year]['months'][$month] = ['month' => $month, 'total' => 0, 'commission' => 0, 'count' => 0];
            }
            $byYear[$year]['total']                    += $tx->provider_amount;
            $byYear[$year]['commission']               += $tx->platform_commission;
            $byYear[$year]['count']                    += 1;
            $byYear[$year]['months'][$month]['total']     += $tx->provider_amount;
            $byYear[$year]['months'][$month]['commission'] += $tx->platform_commission;
            $byYear[$year]['months'][$month]['count']     += 1;
        }

        // Convert to indexed arrays, round values
        $taxData = collect($byYear)
            ->sortByDesc('year')
            ->map(fn($y) => [
                ...$y,
                'total'      => round($y['total'], 2),
                'commission' => round($y['commission'], 2),
                'months'     => array_values(array_map(
                    fn($m) => [...$m, 'total' => round($m['total'], 2), 'commission' => round($m['commission'], 2)],
                    $y['months']
                )),
            ])
            ->values()
            ->toArray();

        return Inertia::render('TaxReport', [
            'taxData'      => $taxData,
            'providerName' => $user->name,
            'year'         => now()->year,
        ]);
    }

    /**
     * Request a withdrawal — optionally save bank details
     */
    public function requestWithdrawal(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'amount'                      => 'required|numeric|min:10|max:' . $user->available_balance,
            'bank_details'                => 'required|array',
            'bank_details.account_holder' => 'required|string|max:255',
            'bank_details.iban'           => 'required|string|max:34',
            'bank_details.bank_name'      => 'nullable|string|max:255',
            'save_bank_account'           => 'boolean',  // ★ Tier 2 #8
        ]);

        $user->withdrawals()->create([
            'amount'       => $validated['amount'],
            'status'       => Withdrawal::STATUS_PENDING,
            'bank_details' => $validated['bank_details'],
        ]);

        $user->increment('pending_withdrawal', $validated['amount']);

        // ★ Tier 2 #8 — Optionally persist bank account for future use
        if (!empty($validated['save_bank_account'])) {
            $saved = $user->saved_bank_accounts ?? [];
            // Avoid exact duplicates (same IBAN)
            $iban   = strtoupper(preg_replace('/\s+/', '', $validated['bank_details']['iban']));
            $exists = collect($saved)->contains(fn($a) => strtoupper(preg_replace('/\s+/', '', $a['iban'] ?? '')) === $iban);
            if (!$exists) {
                $saved[] = $validated['bank_details'];
                $user->saved_bank_accounts = array_slice($saved, 0, 5);
                $user->save();
            }
        }

        return back()->with('success', 'Withdrawal request submitted! We will process it within 3–5 business days.');
    }

    /**
     * Cancel a pending withdrawal request
     */
    public function cancelWithdrawal(Withdrawal $withdrawal)
    {
        $user = Auth::user();

        if ($withdrawal->user_id !== $user->id) abort(403);

        if ($withdrawal->status !== Withdrawal::STATUS_PENDING) {
            return back()->withErrors(['withdrawal' => 'Only pending withdrawals can be cancelled.']);
        }

        $user->decrement('pending_withdrawal', $withdrawal->amount);
        $withdrawal->delete();

        return back()->with('success', 'Withdrawal request cancelled.');
    }

    /**
     * ★ Tier 2 #8 — Delete a saved bank account by index
     */
    public function deleteBankAccount(Request $request, int $index)
    {
        $user  = Auth::user();
        $saved = $user->saved_bank_accounts ?? [];

        if (!isset($saved[$index])) abort(404);

        array_splice($saved, $index, 1);
        $user->saved_bank_accounts = array_values($saved);
        $user->save();

        return back()->with('success', 'Bank account removed.');
    }

    /**
     * ★ Tier 2 #10 — Export provider earnings as CSV
     */
    public function exportCsv()
    {
        $user = Auth::user();

        $transactions = Payment::whereHas('mission', fn($q) => $q->where('assigned_user_id', $user->id))
            ->where('status', 'captured')
            ->with('mission:id,title,category')
            ->orderByDesc('captured_at')
            ->get();

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="oflem_earnings_' . now()->format('Y-m-d') . '.csv"',
            'Cache-Control'       => 'no-store',
        ];

        $callback = function () use ($transactions) {
            $handle = fopen('php://output', 'w');
            // BOM for Excel UTF-8 compatibility
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($handle, ['Date', 'Mission', 'Category', 'Gross Amount (CHF)', 'Platform Fee (CHF)', 'Your Earnings (CHF)', 'Status']);

            foreach ($transactions as $tx) {
                fputcsv($handle, [
                    $tx->captured_at ? $tx->captured_at->format('Y-m-d') : '',
                    $tx->mission->title ?? "Mission #{$tx->mission_id}",
                    $tx->mission->category ?? '—',
                    number_format($tx->amount, 2),
                    number_format($tx->platform_commission, 2),
                    number_format($tx->provider_amount, 2),
                    'Cleared',
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * ★ Tier 2 #10 — Export client spending as CSV
     */
    public function exportClientCsv()
    {
        $user = Auth::user();

        $payments = Payment::whereHas('mission', fn($q) => $q->where('user_id', $user->id))
            ->whereIn('status', ['captured', 'refunded', 'disputed'])
            ->with('mission:id,title,category')
            ->orderByDesc('captured_at')
            ->get();

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="oflem_spending_' . now()->format('Y-m-d') . '.csv"',
            'Cache-Control'       => 'no-store',
        ];

        $callback = function () use ($payments) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($handle, ['Date', 'Mission', 'Category', 'Total Paid (CHF)', 'Platform Fee (CHF)', 'Provider Received (CHF)', 'Status']);

            foreach ($payments as $p) {
                fputcsv($handle, [
                    $p->captured_at ? $p->captured_at->format('Y-m-d') : ($p->refunded_at ? $p->refunded_at->format('Y-m-d') : ''),
                    $p->mission->title ?? "Mission #{$p->mission_id}",
                    $p->mission->category ?? '—',
                    number_format($p->amount, 2),
                    number_format($p->platform_commission, 2),
                    number_format($p->provider_amount, 2),
                    ucfirst($p->status),
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}
