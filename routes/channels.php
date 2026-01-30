<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.{chatId}', function ($user, $chatId) {
    $chat = \App\Models\Chat::find($chatId);
    return $chat && in_array($user->id, $chat->participant_ids);
});

Broadcast::channel('mission.{missionId}', function ($user, $missionId) {
    $mission = \App\Models\Mission::find($missionId);
    if (!$mission) return false;

    // If mission is open, any authenticated user can listen (to see Q&A real-time)
    if ($mission->status === \App\Models\Mission::STATUS_OUVERTE) {
        return true;
    }

    return $user->id === $mission->user_id || $user->id === $mission->assigned_user_id;
});
