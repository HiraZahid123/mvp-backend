<?php

namespace App\Services;

use App\Models\Mission;
use App\Models\User;
use App\Models\Chat;
use App\Events\MissionStatusUpdated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MissionService
{
    /**
     * Transitions a mission to a new status securely.
     */
    public function transitionStatus(Mission $mission, string $newStatus, bool $shouldBroadcast = true): bool
    {
        return DB::transaction(function () use ($mission, $newStatus, $shouldBroadcast) {
            // Lock the mission row for update to prevent race conditions
            $mission = Mission::lockForUpdate()->find($mission->id);

            if (!$mission->canTransitionTo($newStatus)) {
                Log::warning("Illegal transition attempt for mission ID: {$mission->id} from {$mission->status} to {$newStatus}");
                throw new \Exception("Cannot transition from {$mission->status} to {$newStatus}");
            }

            $oldStatus = $mission->status;
            $mission->status = $newStatus;

            // Set appropriate timestamps
            $now = now();
            switch ($newStatus) {
                case Mission::STATUS_VERROUILLEE:
                    $mission->locked_at = $now;
                    break;
                case Mission::STATUS_EN_COURS:
                    $mission->started_at = $now;
                    break;
                case Mission::STATUS_EN_VALIDATION:
                    $mission->validation_started_at = $now;
                    break;
                case Mission::STATUS_TERMINEE:
                    $mission->completed_at = $now;
                    break;
                case Mission::STATUS_ANNULEE:
                    $mission->cancelled_at = $now;
                    break;
            }

            $mission->save();

            if ($shouldBroadcast) {
                DB::afterCommit(function () use ($mission, $oldStatus) {
                    broadcast(new MissionStatusUpdated($mission, $oldStatus))->toOthers();
                });
            }

            return true;
        });
    }

    /**
     * Assigns a provider to a mission and transitions it to "Negotiation".
     */
    public function assignProvider(Mission $mission, User $provider): bool
    {
        return DB::transaction(function () use ($mission, $provider) {
            $mission = Mission::lockForUpdate()->find($mission->id);

            // Ensure the mission is still open
            if ($mission->status !== Mission::STATUS_OUVERTE) {
                throw new \Exception("Mission is no longer open for assignment.");
            }

            $mission->assigned_user_id = $provider->id;
            $mission->save();

            // Transition directly or via separate step? Usually "Hire" moves it to VERROUILLEE if payment is handled.
            // For now, let's just use the transitionStatus logic if we change status.
            return true;
        });
    }

    /**
     * Reveals the full address to the assigned provider and records a chat message.
     */
    public function revealAddress(Mission $mission): void
    {
        DB::transaction(function () use ($mission) {
            $mission = Mission::lockForUpdate()->find($mission->id);

            if ($mission->address_revealed) {
                return;
            }

            $mission->address_revealed = true;
            $mission->save();

            // Create system message in chat
            $chat = Chat::firstOrCreate(
                ['mission_id' => $mission->id],
                ['participant_ids' => array_filter([$mission->user_id, $mission->assigned_user_id])]
            );

            $chat->messages()->create([
                'user_id' => null, // System message
                'content' => json_encode([
                    'type' => 'address_revealed',
                    'message' => '🔓 Full address revealed: ' . $mission->exact_address,
                ]),
                'is_system_message' => true,
            ]);
        });
    }

    /**
     * Hardens the "Hire" flow: handles state transition, locking, and status updates atomatically.
     */
    public function hireProvider(Mission $mission, User $provider): bool
    {
        return DB::transaction(function () use ($mission, $provider) {
            $mission = Mission::lockForUpdate()->find($mission->id);

            if ($mission->status !== Mission::STATUS_OUVERTE && $mission->status !== Mission::STATUS_EN_NEGOCIATION) {
                throw new \Exception("Mission is not in a states that allows hiring.");
            }

            $mission->assigned_user_id = $provider->id;
            $this->transitionStatus($mission, Mission::STATUS_VERROUILLEE, true);
            
            return true;
        });
    }
}
