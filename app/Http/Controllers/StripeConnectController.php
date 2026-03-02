<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class StripeConnectController extends Controller
{
    protected $stripeService;

    public function __construct(StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    /**
     * Redirect to Stripe for onboarding.
     */
    public function onboard(Request $request)
    {
        $user = Auth::user();

        if (!$user->isProvider()) {
            abort(403, 'Only providers can onboard with Stripe.');
        }

        try {
            // Create Stripe Account if not exists
            if (!$user->stripe_connect_id) {
                $account = $this->stripeService->createExpressAccount($user);
                $user->update(['stripe_connect_id' => $account->id]);
            }

            // Create Account Link
            $accountLink = $this->stripeService->createAccountLink($user->stripe_connect_id);

            return redirect($accountLink->url);
        } catch (\Exception $e) {
            Log::error('Stripe Onboarding Initiation Failed: ' . $e->getMessage());
            return back()->with('error', 'Failed to start Stripe onboarding. Please try again.');
        }
    }

    /**
     * Handle return from Stripe (success).
     */
    public function return(Request $request)
    {
        return redirect()->route('wallet.index')->with('success', 'Stripe account linked successfully! You may need to complete some info on Stripe to receive payouts.');
    }

    /**
     * Handle refresh from Stripe (if link expires).
     */
    public function refresh(Request $request)
    {
        return $this->onboard($request);
    }
}
