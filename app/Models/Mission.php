<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Mission extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'location',
        'lat',
        'lng',
        'date_time',
        'budget',
        'price_type',
        'category',
        'additional_details',
        'status',
        'assigned_user_id',
        'exact_address',
        'locked_at',
        'started_at',
        'validation_started_at',
        'completed_at',
        'cancelled_at',
        'dispute_reason',
        'dispute_resolver_id',
        'dispute_resolved_at',
        'payment_intent_id',
        'platform_commission',
        'address_revealed',
        'completion_proof_path',
        'completion_notes',
    ];

    protected $casts = [
        'date_time' => 'datetime',
        'locked_at' => 'datetime',
        'started_at' => 'datetime',
        'validation_started_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'dispute_resolved_at' => 'datetime',
        'address_revealed' => 'boolean',
    ];

    // State machine constants
    const STATUS_OUVERTE = 'OUVERTE';
    const STATUS_EN_NEGOCIATION = 'EN_NEGOCIATION';
    const STATUS_VERROUILLEE = 'VERROUILLEE';
    const STATUS_EN_COURS = 'EN_COURS';
    const STATUS_EN_VALIDATION = 'EN_VALIDATION';
    const STATUS_TERMINEE = 'TERMINEE';
    const STATUS_ANNULEE = 'ANNULEE';
    const STATUS_EN_LITIGE = 'EN_LITIGE';

    // State transition validation
    protected $stateTransitions = [
        self::STATUS_OUVERTE => [self::STATUS_EN_NEGOCIATION, self::STATUS_ANNULEE],
        self::STATUS_EN_NEGOCIATION => [self::STATUS_VERROUILLEE, self::STATUS_OUVERTE, self::STATUS_ANNULEE],
        self::STATUS_VERROUILLEE => [self::STATUS_EN_COURS, self::STATUS_EN_LITIGE, self::STATUS_ANNULEE],
        self::STATUS_EN_COURS => [self::STATUS_EN_VALIDATION, self::STATUS_EN_LITIGE],
        self::STATUS_EN_VALIDATION => [self::STATUS_TERMINEE, self::STATUS_EN_LITIGE],
        self::STATUS_EN_LITIGE => [self::STATUS_EN_COURS, self::STATUS_TERMINEE, self::STATUS_ANNULEE],
    ];

    public function canTransitionTo(string $newStatus): bool
    {
        // Validate dispute resolution before allowing transition from EN_LITIGE
        if (
            $this->status === self::STATUS_EN_LITIGE &&
            in_array($newStatus, [self::STATUS_TERMINEE, self::STATUS_ANNULEE])
        ) {
            // Only allow transition if dispute has been resolved by admin
            if (!$this->dispute_resolved_at) {
                return false;
            }
        }

        return in_array($newStatus, $this->stateTransitions[$this->status] ?? []);
    }

    public function transitionTo(string $newStatus, bool $shouldBroadcast = true): bool
    {
        // Proxy to MissionService for backward compatibility if needed, 
        // but it's better to force using the service.
        // For now, I'll keep it but mark as deprecated or calling the service if I can inject it (hard in model).
        // Since I've updated all call sites, I can remove it.
        return app(\App\Services\MissionService::class)->transitionStatus($this, $newStatus, $shouldBroadcast);
    }

    // Address visibility
    public function canSeeFullAddress(?User $user): bool
    {
        // Null check to prevent fatal errors with guest users
        if (!$user) {
            return false;
        }

        // Only show full address when VERROUILLEE or later AND user is involved
        return $this->address_revealed &&
            in_array($this->status, [
                self::STATUS_VERROUILLEE,
                self::STATUS_EN_COURS,
                self::STATUS_EN_VALIDATION,
                self::STATUS_TERMINEE
            ]) &&
            ($user->id === $this->user_id || $user->id === $this->assigned_user_id);
    }

    /**
     * Reveals the full address and creates a system message in the chat.
     */
    public function revealAddress(): void
    {
        app(\App\Services\MissionService::class)->revealAddress($this);
    }

    public function getApproximateLocation(): string
    {
        // Return city + approximate distance only
        // Note: For now, just returning the location, but this can be enhanced later
        return $this->location; // e.g., "Lausanne, ~2km"
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function disputeResolver()
    {
        return $this->belongsTo(User::class, 'dispute_resolver_id');
    }

    public function offers()
    {
        return $this->hasMany(MissionOffer::class);
    }

    public function questions()
    {
        return $this->hasMany(MissionQuestion::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function chat()
    {
        return $this->hasOne(Chat::class);
    }

    /**
     * Scope for FULLTEXT search on title and description.
     */
    public function scopeSearch($query, $term)
    {
        if (!$term) return $query;
        return $query->whereFullText(['title', 'description'], $term);
    }

    /**
     * Scope for radius-based filtering using Haversine formula.
     */
    public function scopeWithinDistance($query, $lat, $lng, $radiusKm = 10)
    {
        if (!$lat || !$lng) return $query;

        // Clamp latitude to prevent division by zero at poles
        $lat = max(-89.9, min(89.9, $lat));

        // Bounding Box Optimization: Narrow down the rows using indexes before Haversine
        $latDelta = $radiusKm / 111.045;
        $lngDelta = $radiusKm / (111.045 * cos(deg2rad($lat)));

        $query->whereBetween('lat', [$lat - $latDelta, $lat + $latDelta])
            ->whereBetween('lng', [$lng - $lngDelta, $lng + $lngDelta]);

        $haversine = "(6371 * acos(LEAST(1, GREATEST(-1, cos(radians(?)) * cos(radians(lat)) * cos(radians(lng) - radians(?)) + sin(radians(?)) * sin(radians(lat))))))";

        // Use whereRaw for the actual filter to support pagination count queries
        $query->whereRaw("$haversine <= ?", [$lat, $lng, $lat, $radiusKm]);

        // Keep selectRaw so the 'distance' attribute is available in the model
        return $query->selectRaw("*, $haversine AS distance", [$lat, $lng, $lat]);
    }

    /**
     * Scope for filtering by budget range.
     */
    public function scopeFilterByBudget($query, $min = null, $max = null)
    {
        if ($min !== null) {
            $query->where('budget', '>=', $min);
        }
        if ($max !== null) {
            $query->where('budget', '<=', $max);
        }
        return $query;
    }

    /**
     * Scope for filtering by deadline/date.
     */
    public function scopeFilterByDeadline($query, $start = null, $end = null)
    {
        if ($start) {
            $query->where('date_time', '>=', $start);
        }
        if ($end) {
            $query->where('date_time', '<=', $end);
        }
        return $query;
    }

    /**
     * Scope for filtering by category.
     */
    public function scopeFilterByCategory($query, $categories)
    {
        if (empty($categories)) return $query;
        if (is_array($categories)) {
            return $query->whereIn('category', $categories);
        }
        return $query->where('category', $categories);
    }

    /**
     * Scope for main filter logic.
     */
    public function scopeFilter($query, $filters)
    {
        return $query->search($filters['search'] ?? null)
            ->filterByCategory($filters['categories'] ?? null)
            ->filterByBudget($filters['budget_min'] ?? null, $filters['budget_max'] ?? null)
            ->filterByDeadline($filters['start_date'] ?? null, $filters['end_date'] ?? null);
    }
}
