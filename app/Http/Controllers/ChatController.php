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
        // Get chats where user is participant (handling both string and int types in JSON)
        $chats = Chat::where(function ($query) use ($userId) {
                $query->whereJsonContains('participant_ids', $userId)
                      ->orWhereJsonContains('participant_ids', (string) $userId)
                      ->orWhereJsonContains('participant_ids', (int) $userId);
            })
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
        // Get chats where user is participant (handling both string and int types in JSON)
        $chats = Chat::where(function ($query) use ($userId) {
                $query->whereJsonContains('participant_ids', $userId)
                      ->orWhereJsonContains('participant_ids', (string) $userId)
                      ->orWhereJsonContains('participant_ids', (int) $userId);
            })
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
        
        $user = Auth::id();
        
        // If chat is pending and user is Provider, block sending
        if ($chat->status === Chat::STATUS_PENDING && $user == $chat->mission->assigned_user_id) {
            return response()->json([
                'error' => 'Your message request is pending client approval.'
            ], 403);
        }

        // If chat is pending and user is Client, activate it automatically
        if ($chat->status === Chat::STATUS_PENDING && $user == $chat->mission->user_id) {
            $chat->update(['status' => Chat::STATUS_ACTIVE]);
        }
        
        // Block sending in rejected chats
        if ($chat->status === Chat::STATUS_REJECTED) {
            return response()->json([
                'error' => 'This chat request has been declined.'
            ], 403);
        }

        $request->validate([
            'content' => 'required|string|max:2000',
        ]);
        
        $fullUser = Auth::user();
        
        // Moderation Check
        $check = $this->moderationService->checkMessage($request->content, $fullUser);
        
        if (!$check['allowed']) {
             if ($check['reason'] === 'chat_suspended') {
                 return response()->json([
                     'error' => 'You are suspended from chat until ' . $check['suspended_until']->format('d/m/Y H:i'),
                     'suspended' => true
                 ], 403);
             }
             
             // Blocked message (saved as blocked)
             $message = $chat->messages()->create([
                 'user_id' => $fullUser->id,
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
            'user_id' => $fullUser->id,
            'content' => $request->content,
        ]);
        
        // Load user relationship immediately
        $message->load('user:id,name,avatar');
        
        $chat->touch('last_message_at');
        
        // Broadcast to all users in the channel
        broadcast(new \App\Events\MessageSent($message));
        
        // Notify other participants
        foreach ($chat->participant_ids as $participantId) {
            if ($participantId != $fullUser->id) {
                $participant = \App\Models\User::find($participantId);
                if ($participant) {
                    $participant->notify(new \App\Notifications\NewMessageNotification($message));
                }
            }
        }
        
        return response()->json($message);
    }

    public function accept(Chat $chat)
    {
        if (Auth::id() != $chat->mission->user_id) {
            abort(403);
        }

        $chat->update(['status' => Chat::STATUS_ACTIVE]);

        return response()->json(['message' => 'Chat request accepted']);
    }

    public function reject(Chat $chat)
    {
        if (Auth::id() != $chat->mission->user_id) {
            abort(403);
        }

        $chat->update(['status' => Chat::STATUS_REJECTED]);

        return response()->json(['message' => 'Chat request declined']);
    }
    
    // Create or get chat for a mission
    public function getMissionChat(Mission $mission)
    {
        $userId = Auth::id();
        
        // Use loose comparison (==) to handle string/int types from different DB drivers
        if ($userId != $mission->user_id && $userId != $mission->assigned_user_id) {
            abort(403);
        }

        // Ensure mission has been assigned before creating chat
        if (!$mission->assigned_user_id) {
            return response()->json([
                'error' => 'Chat cannot be created until a provider is assigned to this mission.'
            ], 422);
        }

        // Check if chat already exists
        $chat = Chat::where('mission_id', $mission->id)->first();

        // If chat doesn't exist and user is the Provider, create as pending
        if (!$chat && $userId == $mission->assigned_user_id) {
            $chat = Chat::create([
                'mission_id' => $mission->id,
                'participant_ids' => array_values(array_filter([$mission->user_id, $mission->assigned_user_id])),
                'status' => Chat::STATUS_PENDING,
            ]);
            
            return response()->json($chat);
        }
        
        // If chat doesn't exist and user is Client, create as active
        if (!$chat && $userId == $mission->user_id) {
            $chat = Chat::create([
                'mission_id' => $mission->id,
                'participant_ids' => array_values(array_filter([$mission->user_id, $mission->assigned_user_id])),
                'status' => Chat::STATUS_ACTIVE,
            ]);
            
            return response()->json($chat);
        }
        
        // Ensure participants are correct and no nulls exist
        if (!in_array($userId, $chat->participant_ids) || in_array(null, $chat->participant_ids, true)) {
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
