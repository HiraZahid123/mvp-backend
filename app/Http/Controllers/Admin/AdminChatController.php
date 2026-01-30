<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\ChatStrike;
use App\Models\User;
use App\Models\AdminActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminChatController extends Controller
{
    public function flaggedMessages()
    {
        $messages = Message::where('is_blocked', true)
            ->with(['user', 'chat.mission'])
            ->latest()
            ->paginate(20);
            
        return \Inertia\Inertia::render('Admin/Chat/Index', [
            'messages' => $messages,
        ]);
    }

    public function userStrikes()
    {
        $strikes = ChatStrike::with(['user', 'message'])
            ->latest()
            ->paginate(20);
            
        return response()->json($strikes);
    }

    public function clearStrikes(User $user)
    {
        $user->chatStrikes()->delete();
        $user->update(['chat_suspended_until' => null]);

        AdminActivityLog::create([
            'admin_id' => Auth::id(),
            'action' => 'strikes_cleared',
            'subject_type' => User::class,
            'subject_id' => $user->id,
            'metadata' => [],
        ]);

        return response()->json(['message' => 'Strikes cleared and suspension lifted']);
    }
}
