<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.{chatId}', function ($user, $chatId) {
    $chat = \App\Models\Chat::find($chatId);
    if (!$chat) return false;

    // Check if user ID exists in the participants array (handling potential string/int types)
    // We strictly compare casted integers to be safe
    if (in_array((int)$user->id, array_map('intval', $chat->participant_ids))) {
        return ['id' => $user->id, 'name' => $user->name];
    }
    return false;
});


Broadcast::channel('mission.{missionId}', function ($user, $missionId) {
    $mission = \App\Models\Mission::find($missionId);
    if (!$mission) return false;

    // If mission is open, any authenticated user can listen
    if ($mission->status === \App\Models\Mission::STATUS_OUVERTE) {
        return true;
    }

    return (int)$user->id === (int)$mission->user_id || (int)$user->id === (int)$mission->assigned_user_id;
});
