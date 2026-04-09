<?php

namespace App\Services;

use App\Models\ChatStrike;
use App\Models\User;

class ChatModerationService
{
    protected $patterns = [
        'phone'    => '/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/',
        'email'    => '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/',
        'social'   => '/@[a-zA-Z0-9_]{3,}/',
        'link'     => '/(https?:\/\/[^\s]+)/',

        // Messaging platforms — checked against normalized text to catch
        // "wh4tsapp", "t.e.l.e.g.r.a.m", "s i g n a l", etc.
        'platform' => '/\b(whatsapp|telegram|signal|viber|snapchat|discord|wechat|line)\b/i',

        // Off-platform payment bypass attempts
        'payment'  => '/\b(paypal|venmo|cashapp|zelle|wire\s*transfer|bank\s*transfer|iban|bitcoin|btc|ethereum|eth|crypto)\b/i',

        // Explicit contact-request phrases
        'contact'  => '/\b(call\s+me\s+(at|on)|text\s+me\s+(at|on|via)|dm\s+me|my\s+(phone|number|cell|mobile)\s+is|find\s+me\s+on|contact\s+me\s+(outside|directly))\b/i',
    ];

    /**
     * Normalize text to defeat obfuscation before pattern matching.
     * Collapses spaces/dots between letters ("w h a t s" → "whats"),
     * strips zero-width chars, and maps common leetspeak digits to letters.
     */
    protected function normalizeForPatterns(string $content): string
    {
        // Strip zero-width and invisible Unicode characters
        $content = preg_replace('/[\x{200B}-\x{200D}\x{FEFF}\x{00AD}\x{2060}]/u', '', $content);

        // Collapse single separator characters between word characters
        $content = preg_replace('/(?<=\w)([\s\.\-\_\*](?=\w))+/u', '', $content);

        // Leetspeak substitution
        $content = strtr($content, [
            '0' => 'o', '1' => 'i', '3' => 'e', '4' => 'a',
            '5' => 's', '6' => 'g', '7' => 't', '@' => 'a', '$' => 's',
        ]);

        return $content;
    }

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

        $normalized = $this->normalizeForPatterns($content);

        // Check both original and normalized text so obfuscated variants are caught.
        foreach ($this->patterns as $type => $pattern) {
            if (preg_match($pattern, $content, $matches) || preg_match($pattern, $normalized, $matches)) {
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
