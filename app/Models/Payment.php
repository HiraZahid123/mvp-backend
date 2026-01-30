<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    // Payment Statuses
    const STATUS_PENDING = 'pending';
    const STATUS_AUTHORIZED = 'authorized';
    const STATUS_HELD = 'held';
    const STATUS_CAPTURED = 'captured';
    const STATUS_FAILED = 'failed';
    const STATUS_REFUNDED = 'refunded';
    const STATUS_DISPUTED = 'disputed';

    protected $fillable = [
        'mission_id',
        'payment_intent_id',
        'status',
        'amount',
        'platform_commission',
        'performer_amount',
        'currency',
        'held_at',
        'captured_at',
        'refunded_at',
        'refund_reason',
        'stripe_metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'platform_commission' => 'decimal:2',
        'performer_amount' => 'decimal:2',
        'held_at' => 'datetime',
        'captured_at' => 'datetime',
        'refunded_at' => 'datetime',
        'stripe_metadata' => 'array',
    ];

    public function mission()
    {
        return $this->belongsTo(Mission::class);
    }
}
