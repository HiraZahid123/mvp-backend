<?php

namespace App\Notifications;

use App\Models\Withdrawal;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WithdrawalStatusNotification extends Notification
{
    use Queueable;

    public function __construct(public Withdrawal $withdrawal) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $status = ucfirst($this->withdrawal->status);
        $amount = 'CHF ' . number_format($this->withdrawal->amount, 2);

        return (new MailMessage)
            ->subject("Withdrawal {$status} — {$amount}")
            ->greeting("Hello {$notifiable->name},")
            ->line("Your withdrawal request for {$amount} has been **{$this->withdrawal->status}**.")
            ->when($this->withdrawal->admin_notes, fn($m) => $m->line("Admin note: {$this->withdrawal->admin_notes}"))
            ->action('View Wallet', url('/wallet'))
            ->line('Thank you for using Oflem.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'           => 'withdrawal_status',
            'withdrawal_id'  => $this->withdrawal->id,
            'status'         => $this->withdrawal->status,
            'amount'         => $this->withdrawal->amount,
            'admin_notes'    => $this->withdrawal->admin_notes,
            'message'        => $this->buildMessage(),
            'url'            => '/wallet',
            'icon'           => $this->withdrawal->status === 'completed' ? 'check-circle' : ($this->withdrawal->status === 'rejected' ? 'x-circle' : 'clock'),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    private function buildMessage(): string
    {
        return match ($this->withdrawal->status) {
            'approved'  => "Your withdrawal of CHF {$this->withdrawal->amount} has been approved and will be processed shortly.",
            'completed' => "Your withdrawal of CHF {$this->withdrawal->amount} has been completed. Funds have been sent to your bank.",
            'rejected'  => "Your withdrawal of CHF {$this->withdrawal->amount} was rejected." . ($this->withdrawal->admin_notes ? " Reason: {$this->withdrawal->admin_notes}" : ''),
            default     => "Your withdrawal status has been updated to {$this->withdrawal->status}.",
        };
    }
}
