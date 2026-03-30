<?php

namespace App\Http\Controllers;

use App\Models\Mission;
use App\Models\MissionOffer;
use App\Services\StripeService;
use App\Models\Chat;
use App\Services\MissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MissionOfferController extends Controller
{
    protected $stripeService;
    protected $missionService;

    public function __construct(StripeService $stripeService, MissionService $missionService)
    {
        $this->stripeService = $stripeService;
        $this->missionService = $missionService;
    }

    public function submitOffer(Request $request, Mission $mission)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'message' => 'nullable|string',
        ]);

        if ($mission->status !== Mission::STATUS_OUVERTE) {
            return back()->withErrors(['mission' => 'This mission is no longer accepting offers.']);
        }

        if ($mission->user_id == Auth::id()) {
            return back()->withErrors(['mission' => 'You cannot submit an offer on your own mission.']);
        }

        $existingOffer = $mission->offers()
            ->where('user_id', Auth::id())
            ->where('status', '!=', 'rejected')
            ->first();

        if ($existingOffer) {
            return back()->withErrors(['mission' => 'You have already submitted an offer for this mission.']);
        }

        $offer = $mission->offers()->create([
            'user_id' => Auth::id(),
            'amount' => $request->amount,
            'message' => $request->message,
        ]);

        $mission->user->notify(new \App\Notifications\NewOfferNotification($offer));

        return back()->with('success', 'Offer submitted successfully!');
    }

    public function selectOffer(Request $request, Mission $mission, MissionOffer $offer)
    {
        if (Auth::id() != $mission->user_id && !Auth::user()->isAdmin()) {
            abort(403);
        }

        if ($offer->user_id === $mission->user_id) {
            return back()->withErrors(['mission' => 'You cannot select your own offer.']);
        }

        try {
            $pi = null;
            DB::transaction(function () use ($mission, $offer, &$pi) {
                if ($mission->status !== Mission::STATUS_EN_NEGOCIATION) {
                    $this->missionService->transitionStatus($mission, Mission::STATUS_EN_NEGOCIATION);
                }
                $mission->assigned_user_id = $offer->user_id;
                $mission->budget = $offer->amount;
                $mission->save();

                $pi = $this->stripeService->createHold($mission);

                $offer->update(['status' => 'accepted']);
                $mission->offers()->where('id', '!=', $offer->id)->update(['status' => 'rejected']);
            });

            $offer->user->notify(new \App\Notifications\MissionAssignedNotification($mission));

            $mission->offers()
                ->where('id', '!=', $offer->id)
                ->whereNotNull('user_id')
                ->get()
                ->each(function ($o) use ($mission) {
                    $o->user->notify(new \App\Notifications\OfferRejectedNotification($mission));
                });

            $chat = Chat::firstOrCreate([
                'mission_id' => $mission->id,
            ], [
                'participant_ids' => [$mission->user_id, $offer->user_id],
            ]);

            return back()
                ->with('success', 'Provider selected! Please complete the payment hold.')
                ->with('stripe_client_secret', $pi->client_secret)
                ->with('chat_id', $chat->id);
        } catch (\Exception $e) {
            Log::error('Select Offer Failed: ' . $e->getMessage());
            return back()->withErrors(['mission' => 'Failed to select offer. Please try again.']);
        }
    }
}
