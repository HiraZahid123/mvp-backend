<?php

namespace App\Services;

use App\Models\ChatStrike;
use App\Models\User;

class ChatModerationService
{
    protected $patterns = [
        'phone' => '/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/',
        'email' => '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/',
        'social' => '/@[a-zA-Z0-9_]{3,}/',
        'link' => '/(https?:\/\/[^\s]+)/',
    ];
    
    public function checkMessage(string $content, User $user): array
    {
        // Check if user is suspended
        if ($user->chat_suspended_until && $user->chat_suspended_until->isFuture()) {
            return [
                'allowed' => false,
                'reason' => 'chat_suspended',
                'suspended_until' => $user->chat_suspended_until,
            ];
        }
        
        // Check for violations
        foreach ($this->patterns as $type => $pattern) {
            if (preg_match($pattern, $content, $matches)) {
                $this->issueStrike($user, $type, $matches[0]);
                
                return [
                    'allowed' => false,
                    'reason' => 'contact_info_detected',
                    'violation_type' => $type,
                ];
            }
        }
        
        return ['allowed' => true];
    }
    
    protected function issueStrike(User $user, string $type, string $content)
    {
        ChatStrike::create([
            'user_id' => $user->id,
            'violation_type' => $type,
            'violation_content' => $content,
            'expires_at' => now()->addDays(30),
        ]);
        
        $activeStrikes = ChatStrike::where('user_id', $user->id)
            ->where('expires_at', '>', now())
            ->count();
        
        // Notify user about the strike
        if ($activeStrikes < 3) {
            $user->notify(new \App\Notifications\ChatModerationWarning($activeStrikes));
        }

        // 3 Strikes = 7 Day Suspension
        if ($activeStrikes >= 3) {
            $user->update(['chat_suspended_until' => now()->addDays(7)]);
            $user->notify(new \App\Notifications\ChatModerationSuspension(now()->addDays(7)));
        }
    }
}
