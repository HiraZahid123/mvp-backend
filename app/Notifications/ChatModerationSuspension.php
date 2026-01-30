<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ChatModerationSuspension extends Notification
{
    use Queueable;

    protected $suspendedUntil;

    public function __construct($suspendedUntil)
    {
        $this->suspendedUntil = $suspendedUntil;
    }

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Chat Access Has Been Suspended')
            ->line('Your account has reached 3 moderation strikes.')
            ->line("Your chat access has been suspended until: " . $this->suspendedUntil->format('Y-m-d H:i'))
            ->line('Continued violations may lead to a permanent account ban.')
            ->action('Contact Support', url('/support'))
            ->line('Thank you for your understanding.');
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'moderation_suspension',
            'suspended_until' => $this->suspendedUntil,
            'message' => "Your chat access has been suspended until " . $this->suspendedUntil->format('Y-m-d H:i') . " due to multiple violations.",
        ];
    }
}
