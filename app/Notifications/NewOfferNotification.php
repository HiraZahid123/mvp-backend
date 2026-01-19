<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewOfferNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    protected $offer;

    public function __construct($offer)
    {
        $this->offer = $offer;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('New Offer on your OFLEM Mission')
                    ->greeting('Hello ' . $notifiable->name . '!')
                    ->line('You have received a new offer of CHF ' . $this->offer->amount . ' for your mission: ' . $this->offer->mission->title)
                    ->action('View Mission', url('/missions/' . $this->offer->mission_id))
                    ->line('Thank you for using OFLEM!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'mission_id' => $this->offer->mission_id,
            'mission_title' => $this->offer->mission->title,
            'offer_id' => $this->offer->id,
            'amount' => $this->offer->amount,
            'message' => 'New offer received',
        ];
    }
}
