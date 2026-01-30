<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ChatModerationWarning extends Notification
{
    use Queueable;

    protected $strikeCount;

    public function __construct($strikeCount)
    {
        $this->strikeCount = $strikeCount;
    }

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Important: Chat Moderation Warning')
            ->line('Your account has received a moderation strike for sharing contact information or prohibited content.')
            ->line("Strike count: {$this->strikeCount}/3")
            ->line('Please follow our community guidelines to avoid account suspension.')
            ->action('View Guidelines', url('/rules'))
            ->line('Thank you for helping keep Oflem safe.');
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'moderation_warning',
            'strike_count' => $this->strikeCount,
            'message' => "Warning: You have {$this->strikeCount} moderation strikes. At 3 strikes, your chat will be suspended for 7 days.",
        ];
    }
}
