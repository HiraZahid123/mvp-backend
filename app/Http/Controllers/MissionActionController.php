<?php

namespace App\Http\Controllers;

use App\Models\Mission;
use App\Models\User;
use App\Models\Chat;
use App\Models\Payment;
use App\Services\StripeService;
use App\Services\MissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\MissionOffer;
use Illuminate\Support\Facades\Log;

class MissionActionController extends Controller
{
    protected $stripeService;
    protected $missionService;

    public function __construct(StripeService $stripeService, MissionService $missionService)
    {
        $this->stripeService = $stripeService;
        $this->missionService = $missionService;
    }

    public function acceptFixedPrice(Mission $mission)
    {
        if ($mission->price_type !== 'fixed') {
            return back()->withErrors(['mission' => 'This mission requires an offer.']);
        }

        if ($mission->user_id == Auth::id()) {
            return back()->withErrors(['mission' => 'You cannot accept your own mission.']);
        }

        if (!$mission->canTransitionTo(Mission::STATUS_EN_NEGOCIATION)) {
            return back()->withErrors(['mission' => 'This mission is no longer available.']);
        }

        try {
            // Check if already applied
            $existingOffer = $mission->offers()
                ->where('user_id', Auth::id())
                ->first();

            if ($existingOffer) {
                return back()->withErrors(['mission' => 'You have already accepted the price for this mission.']);
            }

            $chat = null;
            DB::transaction(function () use ($mission, &$chat) {
                // Instead of direct assignment, create an offer at the fixed price
                $offer = $mission->offers()->create([
                    'user_id' => Auth::id(),
                    'amount' => $mission->budget,
                    'message' => 'I accept the fixed price for this mission.',
                    'status' => 'pending',
                ]);

                // Create a chat between the provider and the client (interview stage)
                $chat = Chat::firstOrCreate([
                    'mission_id' => $mission->id,
                ], [
                    'participant_ids' => [$mission->user_id, Auth::id()],
                ]);

                $chat->touch('last_message_at');

                // Notify client
                $mission->user->notify(new \App\Notifications\NewOfferNotification($offer));
            });

            return redirect()->route('missions.show', $mission->id)
                ->with('success', 'You have accepted the price! The client will review your profile and contact you.')
                ->with('chat_id', $chat->id);
        } catch (\Exception $e) {
            Log::error('Accept Mission Failed: ' . $e->getMessage());
            return back()->withErrors(['mission' => 'Failed to accept mission. Please try again.']);
        }
    }

    public function hire(Request $request, Mission $mission, User $provider)
    {
        if (Auth::id() != $mission->user_id && !Auth::user()->isAdmin()) {
            abort(403);
        }

        if ($mission->user_id === $provider->id) {
            return response()->json(['message' => 'You cannot hire yourself for your own mission.'], 422);
        }

        if ($mission->status !== Mission::STATUS_OUVERTE) {
            return response()->json(['message' => 'Mission is no longer open for hiring.'], 422);
        }

        try {
            $pi = null;
            DB::transaction(function () use ($mission, $provider, &$pi) {
                $this->missionService->transitionStatus($mission, Mission::STATUS_EN_NEGOCIATION);
                $mission->assigned_user_id = $provider->id;
                $mission->save();

                // Re-read the mission under a lock to get the authoritative payment_intent_id.
                // The $mission variable captured in the closure reflects pre-transaction state;
                // transitionStatus() works on an internal copy and does not update it.
                $fresh = Mission::lockForUpdate()->find($mission->id);

                if ($fresh->payment_intent_id) {
                    $pi = $this->stripeService->getPaymentIntent($fresh->payment_intent_id);
                } else {
                    $pi = $this->stripeService->createHold($fresh);
                }

                $existingOffer = $mission->offers()->where('user_id', $provider->id)->first();
                if ($existingOffer) {
                    $existingOffer->update(['status' => 'accepted']);
                }

                $mission->offers()->where('user_id', '!=', $provider->id)->update(['status' => 'rejected']);
            });

            $provider->notify(new \App\Notifications\MissionAssignedNotification($mission));

            $chat = Chat::firstOrCreate([
                'mission_id' => $mission->id,
            ], [
                'participant_ids' => [$mission->user_id, $provider->id],
            ]);

            return redirect()->route('missions.show', $mission->id)
                ->with('success', 'Provider hired successfully! Please complete the payment hold.')
                ->with('stripe_client_secret', $pi->client_secret)
                ->with('chat_id', $chat->id);
        } catch (\Exception $e) {
            Log::error('Direct Hire Failed: ' . $e->getMessage());
            return back()->withErrors(['mission' => 'Failed to hire provider. ' . $e->getMessage()]);
        }
    }

    public function confirmAssignment(Mission $mission)
    {
        if (Auth::id() != $mission->user_id && !Auth::user()->isAdmin()) {
            abort(403);
        }

        if (!$mission->canTransitionTo(Mission::STATUS_VERROUILLEE)) {
            return back()->withErrors(['mission' => 'Cannot confirm assignment in current state.']);
        }

        try {
            if ($mission->payment_intent_id) {
                // Single fetch — avoids a race between two consecutive API calls
                $pi = $this->stripeService->getPaymentIntent($mission->payment_intent_id);
                if ($pi->status !== 'requires_capture' && $pi->status !== 'succeeded') {
                    return back()
                        ->withErrors(['mission' => 'Payment hold is not confirmed. Please complete the payment first.'])
                        ->with('stripe_client_secret', $pi->client_secret);
                }
            } else {
                $pi = $this->stripeService->createHold($mission);
                return back()
                    ->with('success', 'Please complete the payment hold to confirm the assignment.')
                    ->with('stripe_client_secret', $pi->client_secret);
            }

            DB::transaction(function () use ($mission) {
                $this->missionService->transitionStatus($mission, Mission::STATUS_VERROUILLEE);
                $this->missionService->revealAddress($mission);
            });

            $chat = Chat::firstOrCreate([
                'mission_id' => $mission->id,
            ], [
                'participant_ids' => [$mission->user_id, $mission->assigned_user_id],
            ]);

            return back()
                ->with('success', 'Assignment confirmed! The provider can now start work and see your address.')
                ->with('chat_id', $chat->id);
        } catch (\Exception $e) {
            Log::error('Confirm Assignment Failed: ' . $e->getMessage());
            return back()->withErrors(['mission' => 'Failed to confirm assignment. Please try again.']);
        }
    }

    public function startWork(Mission $mission)
    {
        if (!$mission->assigned_user_id || Auth::id() != $mission->assigned_user_id) {
            abort(403);
        }

        if (!$mission->canTransitionTo(Mission::STATUS_EN_COURS)) {
            return back()->withErrors(['mission' => 'Cannot start work in current state.']);
        }

        $this->missionService->transitionStatus($mission, Mission::STATUS_EN_COURS);

        return back()->with('success', 'Work started!');
    }

    public function submitForValidation(Request $request, Mission $mission)
    {
        if (!$mission->assigned_user_id || Auth::id() != $mission->assigned_user_id) {
            abort(403);
        }

        if (!$mission->canTransitionTo(Mission::STATUS_EN_VALIDATION)) {
            return back()->withErrors(['mission' => 'Cannot submit for validation in current state.']);
        }

        $request->validate([
            'completion_proof' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'completion_notes' => 'nullable|string|max:1000',
        ]);

        if ($request->hasFile('completion_proof')) {
            $path = $request->file('completion_proof')->store('mission_proofs', 'public');
            $mission->completion_proof_path = $path;
        }

        if ($request->filled('completion_notes')) {
            $mission->completion_notes = $request->completion_notes;
        }

        $this->missionService->transitionStatus($mission, Mission::STATUS_EN_VALIDATION);

        $mission->user->notify(new \App\Notifications\MissionReadyForValidationNotification($mission));

        return back()->with('success', 'Mission submitted for validation! The host has 72 hours to validate.');
    }

    public function validateCompletion(Mission $mission)
    {
        if (Auth::id() != $mission->user_id) {
            abort(403, 'Only the mission owner can validate completion.');
        }

        if (!$mission->canTransitionTo(Mission::STATUS_TERMINEE)) {
            return back()->withErrors(['mission' => 'This mission cannot be validated in its current state.']);
        }

        $alreadyCompleted = false;
        try {
            // Stripe capture runs OUTSIDE the DB transaction so no row lock is held during
            // the external HTTP call. releaseFunds() is idempotent: if the payment is already
            // marked captured locally it returns immediately; if Stripe reports
            // charge_already_captured it syncs the local record and returns.
            $this->stripeService->releaseFunds($mission);

            // Short DB-only transaction: lock, verify state, transition, credit balance.
            DB::transaction(function () use ($mission, &$alreadyCompleted) {
                $locked = Mission::lockForUpdate()->find($mission->id);

                if ($locked->status === Mission::STATUS_TERMINEE) {
                    $alreadyCompleted = true;
                    throw new \RuntimeException('__already_completed__');
                }

                $this->missionService->transitionStatus($locked, Mission::STATUS_TERMINEE);

                $payment = Payment::where('mission_id', $locked->id)->first();
                // Only credit balance after confirming Stripe capture succeeded
                if ($payment && $payment->status === Payment::STATUS_CAPTURED && $locked->assignedUser) {
                    $locked->assignedUser->increment('balance', $payment->provider_amount);
                    Log::info("Balance credited for mission {$locked->id}", [
                        'provider_id' => $locked->assignedUser->id,
                        'amount' => $payment->provider_amount,
                    ]);
                }
            });
        } catch (\RuntimeException $e) {
            if ($alreadyCompleted) {
                return back()->with('success', 'Mission has already been validated.');
            }
            Log::error("Completion failed for mission {$mission->id}: " . $e->getMessage());
            return back()->withErrors(['mission' => 'Payment release failed. Please try again or contact support.']);
        } catch (\Exception $e) {
            Log::error("Completion failed for mission {$mission->id}: " . $e->getMessage());
            return back()->withErrors(['mission' => 'Payment release failed. Please try again or contact support.']);
        }

        if ($mission->assignedUser) {
            $mission->assignedUser->notify(new \App\Notifications\MissionCompletedNotification($mission));
        }

        return back()->with('success', 'Mission validated! Payment has been released to the provider.');
    }

    public function initiateDispute(Request $request, Mission $mission)
    {
        if (Auth::id() != $mission->user_id) {
            abort(403, 'Only the mission owner can initiate a dispute.');
        }

        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        if (!$mission->canTransitionTo(Mission::STATUS_EN_LITIGE)) {
            return back()->withErrors(['mission' => 'Cannot initiate dispute in current state.']);
        }

        $mission->update(['dispute_reason' => $request->reason]);
        $this->missionService->transitionStatus($mission, Mission::STATUS_EN_LITIGE);

        $admins = User::where('is_admin', true)->get();
        foreach ($admins as $admin) {
            $admin->notify(new \App\Notifications\DisputeInitiatedNotification($mission));
        }

        if ($mission->assignedUser) {
            $mission->assignedUser->notify(new \App\Notifications\MissionDisputedNotification($mission));
        }

        return back()->with('success', 'Dispute initiated. An admin will review your case.');
    }

    public function cancel(Mission $mission)
    {
        $isOwner = Auth::id() == $mission->user_id;
        $isAssigned = $mission->assigned_user_id && Auth::id() == $mission->assigned_user_id;

        if (!$isOwner && !$isAssigned) {
            abort(403);
        }

        if (!$mission->canTransitionTo(Mission::STATUS_ANNULEE)) {
            return back()->withErrors(['mission' => 'Cannot cancel mission in current state.']);
        }

        $needsRefund = in_array($mission->status, [
            Mission::STATUS_VERROUILLEE,
            Mission::STATUS_EN_COURS,
            Mission::STATUS_EN_VALIDATION
        ]);

        try {
            DB::transaction(function () use ($mission, $needsRefund) {
                if ($needsRefund && $mission->payment_intent_id) {
                    $this->stripeService->refund($mission, 'Mission cancelled');
                }

                $this->missionService->transitionStatus($mission, Mission::STATUS_ANNULEE);
            });
        } catch (\Exception $e) {
            Log::error('Mission Cancellation Failed: ' . $e->getMessage());
            return back()->withErrors(['mission' => 'Failed to cancel mission. Please contact support.']);
        }

        return back()->with('success', 'Mission cancelled.' . ($needsRefund ? ' Refund has been processed.' : ''));
    }
}
