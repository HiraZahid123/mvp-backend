<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Message;
use App\Models\Mission;
use App\Services\ChatModerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChatController extends Controller
{
    protected $moderationService;
    
    public function __construct(ChatModerationService $moderationService)
    {
        $this->moderationService = $moderationService;
    }
    
    public function index()
    {
        $userId = Auth::id();
        
        // Get chats where user is participant
        $chats = Chat::whereJsonContains('participant_ids', $userId)
            ->with(['mission', 'messages' => function($q) {
                $q->latest()->take(1);
            }])
            ->orderByDesc('last_message_at')
            ->get();
            
        return response()->json($chats);
    }
    
    public function messages(Request $request)
    {
        $userId = Auth::id();
        
        // Get all chats for this user
        $chats = Chat::whereJsonContains('participant_ids', $userId)
            ->with(['mission.user', 'mission.assignedUser', 'mission.offers.user', 'messages' => function($q) {
                $q->latest()->take(1);
            }])
            ->orderByDesc('last_message_at')
            ->get();
        
        return Inertia::render('Messages', [
            'chats' => $chats,
            'selectedChatId' => $request->query('chat_id')
        ]);
    }
    
    public function show(Chat $chat)
    {
        $this->authorizeParticipant($chat);
        
        $messages = $chat->messages()
            ->with('user:id,name,avatar')
            ->orderBy('created_at', 'asc')
            ->get();
            
        return response()->json($messages);
    }
    
    public function store(Request $request, Chat $chat)
    {
        $this->authorizeParticipant($chat);
        
        $request->validate([
            'content' => 'required|string|max:2000',
        ]);
        
        $user = Auth::user();
        
        // Moderation Check
        $check = $this->moderationService->checkMessage($request->content, $user);
        
        if (!$check['allowed']) {
             if ($check['reason'] === 'chat_suspended') {
                 return response()->json([
                     'error' => 'You are suspended from chat until ' . $check['suspended_until']->format('d/m/Y H:i'),
                     'suspended' => true
                 ], 403);
             }
             
             // Blocked message (saved as blocked)
             $message = $chat->messages()->create([
                 'user_id' => $user->id,
                 'content' => $request->content,
                 'is_blocked' => true,
                 'blocked_reason' => $check['violation_type'],
             ]);
             
             return response()->json([
                 'error' => 'Message blocked: Contact information detected.',
                 'message' => $message,
                 'violation' => true
             ], 422);
        }
        
        $message = $chat->messages()->create([
            'user_id' => $user->id,
            'content' => $request->content,
        ]);
        
        // Load user relationship immediately
        $message->load('user:id,name,avatar');
        
        $chat->touch('last_message_at');
        
        // Log before broadcasting
        \Log::info('About to broadcast message:', ['message_id' => $message->id, 'chat_id' => $chat->id]);
        
        // Broadcast to all users in the channel
        broadcast(new \App\Events\MessageSent($message));
        
        // Log after broadcasting
        \Log::info('Broadcast completed for message:', ['message_id' => $message->id]);

        // Notify other participants
        foreach ($chat->participant_ids as $participantId) {
            if ($participantId != $user->id) {
                $participant = \App\Models\User::find($participantId);
                if ($participant) {
                    $participant->notify(new \App\Notifications\NewMessageNotification($message));
                }
            }
        }
        
        // Return message with user relationship loaded
        return response()->json($message);
    }
    
    // Create or get chat for a mission
    public function getMissionChat(Mission $mission)
    {
        if (Auth::id() !== $mission->user_id && Auth::id() !== $mission->assigned_user_id) {
            abort(403);
        }

        // Ensure mission has been assigned before creating chat
        if (!$mission->assigned_user_id) {
            return response()->json([
                'error' => 'Chat cannot be created until a performer is assigned to this mission.'
            ], 422);
        }
        
        // Validate both participants exist
        $participantIds = array_values(array_filter([$mission->user_id, $mission->assigned_user_id]));
        
        if (count($participantIds) !== 2) {
            return response()->json([
                'error' => 'Invalid mission state: missing participant information.'
            ], 422);
        }
        
        $chat = Chat::firstOrCreate([
            'mission_id' => $mission->id,
        ], [
            'participant_ids' => $participantIds,
        ]);
        
        // Ensure participants are correct and no nulls exist
        if (!in_array(Auth::id(), $chat->participant_ids) || in_array(null, $chat->participant_ids, true)) {
             // Re-sync participants if needed
             $validParticipants = array_values(array_filter([$mission->user_id, $mission->assigned_user_id]));
             if (count($validParticipants) === 2) {
                 $chat->update(['participant_ids' => $validParticipants]);
             }
        }
        
        return response()->json($chat);
    }
    
    public function typing(Request $request, Chat $chat)
    {
        $this->authorizeParticipant($chat);

        $request->validate([
            'is_typing' => 'required|boolean',
        ]);

        broadcast(new \App\Events\TypingIndicator(
            $chat->id,
            Auth::id(),
            Auth::user()->name,
            $request->is_typing
        ))->toOthers();

        return response()->json(['status' => 'success']);
    }

    protected function authorizeParticipant(Chat $chat)
    {
        if (!in_array(Auth::id(), $chat->participant_ids)) {
            abort(403);
        }
    }
}
