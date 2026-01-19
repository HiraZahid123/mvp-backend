<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewQuestionNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    protected $question;

    public function __construct($question)
    {
        $this->question = $question;
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
                    ->subject('New Question on your OFLEM Mission')
                    ->greeting('Hello ' . $notifiable->name . '!')
                    ->line('A helper has asked a question about your mission: ' . $this->question->mission->title)
                    ->line('Question: ' . $this->question->question)
                    ->action('Answer Question', url('/missions/' . $this->question->mission_id))
                    ->line('Answering quickly helps you find the best helper!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'mission_id' => $this->question->mission_id,
            'mission_title' => $this->question->mission->title,
            'question_id' => $this->question->id,
            'message' => 'New question received',
        ];
    }
}
