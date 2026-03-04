<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentFailedNotification extends Notification
{
    use Queueable;

    protected $mission;

    /**
     * Create a new notification instance.
     */
    public function __construct(Mission $mission)
    {
        $this->mission = $mission;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Payment Failed: ' . $this->mission->title)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('The payment hold for your mission "' . $this->mission->title . '" has failed.')
            ->line('Please check your payment method and try again to confirm the assignment.')
            ->action('View Mission', url(route('missions.show', $this->mission->id)))
            ->line('Thank you for using Oflem!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'mission_id' => $this->mission->id,
            'mission_title' => $this->mission->title,
            'message' => 'Payment failed for mission: ' . $this->mission->title,
            'type' => 'payment_failed',
        ];
    }
}
