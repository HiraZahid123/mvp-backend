<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use Carbon\Carbon;

class OTPVerification extends Model
{
    protected $table = 'otp_verifications';

    protected $fillable = [
        'user_id',
        'identifier',
        'type',
        'otp_code',
        'token',
        'expires_at',
        'verified_at',
        'attempts'
    ];

    protected $hidden = [
        'otp_code',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isVerified(): bool
    {
        return !is_null($this->verified_at);
    }

    public function canAttempt(): bool
    {
        return $this->attempts < 3 && !$this->isExpired();
    }

    public function incrementAttempts(): void
    {
        $this->increment('attempts');
    }

    public function verify(): void
    {
        $this->update([
            'verified_at' => now(),
            'attempts' => $this->attempts + 1
        ]);
    }

    public static function generateToken(): string
    {
        return Str::random(64);
    }

    public static function generateOTP(): string
    {
        return str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    }

    public static function findByToken(string $token): ?self
    {
        return self::where('token', $token)->first();
    }

    public static function findActiveByIdentifier(string $identifier, string $type): ?self
    {
        return self::where('identifier', $identifier)
            ->where('type', $type)
            ->whereNull('verified_at')
            ->where('expires_at', '>', now())
            ->first();
    }
}
