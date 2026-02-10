<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'phone_country_code',
        'phone_verified_at',
        'role_type',
        'location_lat',
        'location_lng',
        'location_address',
        'discovery_radius_km',
        'provider',
        'provider_id',
        'provider_token',
        'provider_refresh_token',
        'provider_token_expires_at',
        'username',
        'profile_photo',
        'zip_code',
        'last_selected_role',
        'chat_suspended_until',
        'admin_role',
        'rating_cache',
        'reviews_count_cache',
        'balance',
        'pending_withdrawal',
        'total_withdrawn',
        'is_admin',
    ];


    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'phone_verified_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'location_lat' => 'decimal:7',
            'location_lng' => 'decimal:7',
            'discovery_radius_km' => 'integer',
            'is_admin' => 'boolean',
            'chat_suspended_until' => 'datetime',
            'admin_role' => 'string',
            'balance' => 'decimal:2',
            'pending_withdrawal' => 'decimal:2',
            'total_withdrawn' => 'decimal:2',
        ];


    }

    /**
     * Get the OTP verifications for the user.
     */
    public function otpVerifications(): HasMany
    {
        return $this->hasMany(OTPVerification::class);
    }

    /**
     * Check if user has admin role.
     */
    public function isAdmin(): bool
    {
        return $this->is_admin;
    }
    /**
     * Check if user is super admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->is_admin && $this->admin_role === 'super_admin';
    }

    /**
     * Check if user has customer role.
     */
    public function isCustomer(): bool
    {
        return in_array($this->role_type, ['customer', 'both']);
    }

    /**
     * Check if user has performer role.
     */
    public function isPerformer(): bool
    {
        return in_array($this->role_type, ['performer', 'both']);
    }

    /**
     * Check if phone is verified.
     */
    public function hasVerifiedPhone(): bool
    {
        return !is_null($this->phone_verified_at);
    }

    /**
     * Get user's location as array.
     */
    public function getLocationAttribute(): ?array
    {
        if ($this->location_lat && $this->location_lng) {
            return [
                'lat' => $this->location_lat,
                'lng' => $this->location_lng,
            ];
        }
        return null;
    }

    /**
     * Set user's location from array.
     */
    public function setLocationAttribute(?array $location): void
    {
        if ($location && isset($location['lat'], $location['lng'])) {
            $this->location_lat = $location['lat'];
            $this->location_lng = $location['lng'];
        } else {
            $this->location_lat = null;
            $this->location_lng = null;
        }
    }

    /**
     * Get user's avatar URL.
     */
    public function getAvatarAttribute($value): ?string
    {
        return $value ? asset('storage/' . $value) : null;
    }

    /**
     * Check if user authenticated via social provider
     */
    public function isSocialUser(): bool
    {
        return !empty($this->provider);
    }

    /**
     * Find user by social provider and provider ID
     */
    public static function findByProvider(string $provider, string $providerId): ?self
    {
        return self::where('provider', $provider)
                  ->where('provider_id', $providerId)
                  ->first();
    }

    /**
     * Create user from social provider data
     */
    public static function createFromProvider(string $provider, array $providerUser, string $roleType = 'customer'): self
    {
        return self::create([
            'name' => $providerUser['name'] ?? $providerUser['nickname'] ?? 'User',
            'email' => $providerUser['email'],
            'provider' => $provider,
            'provider_id' => $providerUser['id'],
            'provider_token' => $providerUser['token'] ?? null,
            'provider_refresh_token' => $providerUser['refreshToken'] ?? null,
            'provider_token_expires_at' => isset($providerUser['expiresIn'])
                ? now()->addSeconds($providerUser['expiresIn'])
                : null,
            'email_verified_at' => now(), // Social providers verify emails
            'role_type' => $roleType,
        ]);
    }

    /**
     * Update social provider token information
     */
    public function updateProviderToken(string $token, ?string $refreshToken = null, ?int $expiresIn = null): void
    {
        $this->update([
            'provider_token' => $token,
            'provider_refresh_token' => $refreshToken,
            'provider_token_expires_at' => $expiresIn ? now()->addSeconds($expiresIn) : null,
        ]);
    }

    /**
     * Get profile photo URL with OFLEM placeholder fallback
     */
    public function getProfilePhotoUrlAttribute(): string
    {
        if ($this->profile_photo) {
            return asset('storage/' . $this->profile_photo);
        }
        
        // Return OFLEM custom placeholder icon
        return asset('images/oflem-placeholder.svg');
    }

    /**
     * Get last selected role with fallback to role_type
     */
    public function getLastSelectedRole(): string
    {
        return $this->last_selected_role ?? $this->role_type ?? 'customer';
    }

    /**
     * Get display name (username or name)
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->username ?? $this->name;
    }

    /**
     * Get the provider's extended profile.
     */
    public function providerProfile()
    {
        return $this->hasOne(ProviderProfile::class);
    }

    /**
     * Get the skills associated with the user.
     */
    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'provider_skills')
                    ->withPivot('proficiency_level', 'verified');
    }

    /**
     * Get the user's notification preferences.
     */
    public function notificationPreference()
    {
        return $this->hasOne(NotificationPreference::class);
    }

    /**
     * Get the user's chat strikes.
     */
    public function chatStrikes()
    {
        return $this->hasMany(ChatStrike::class);
    }

    /**
     * Get reviews received by this user (as the target).
     */
    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'user_id');
    }

    /**
     * Get reviews given by this user (as the reviewer).
     */
    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    /**
     * Get user's withdrawal requests
     */
    public function withdrawals()
    {
        return $this->hasMany(\App\Models\Withdrawal::class);
    }

    /**
     * Get average rating from cache.
     */
    public function getAverageRatingAttribute(): float
    {
        return (float) ($this->rating_cache ?? 0);
    }

    /**
     * Get total number of reviews received from cache.
     */
    public function getTotalReviewsAttribute(): int
    {
        return $this->reviews_count_cache ?? 0;
    }

    /**
     * Get available balance (Balance - Pending Withdrawals).
     */
    public function getAvailableBalanceAttribute(): float
    {
        return max(0, $this->balance - $this->pending_withdrawal);
    }

    /**
     * Get rating distribution (count per star rating).
     */
    public function getRatingDistribution(): array
    {
        $distribution = [
            5 => 0,
            4 => 0,
            3 => 0,
            2 => 0,
            1 => 0,
        ];

        $reviews = $this->reviewsReceived()
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        foreach ($reviews as $rating => $count) {
            $distribution[$rating] = $count;
        }

        return $distribution;
    }

    /**
     * Scope to find users whose discovery radius covers a specific point.
     * Includes bounding box optimization.
     */
    public function scopeNearby($query, $lat, $lng)
    {
        if (!$lat || !$lng) return $query;

        // Bounding Box Optimization: 
        // We use a 100km box as a pre-filter (generous enough for any discovery radius)
        $maxRadius = 100;
        $latDelta = $maxRadius / 111.045;
        $lngDelta = $maxRadius / (111.045 * cos(deg2rad($lat)));

        $query->whereBetween('location_lat', [$lat - $latDelta, $lat + $latDelta])
              ->whereBetween('location_lng', [$lng - $lngDelta, $lng + $lngDelta]);

        $haversine = "(6371 * acos(cos(radians(?)) * cos(radians(location_lat)) * cos(radians(location_lng) - radians(?)) + sin(radians(?)) * sin(radians(location_lat))))";

        return $query->selectRaw("users.*, $haversine AS distance_to_point", [$lat, $lng, $lat])
            ->where('role_type', '!=', 'customer') // Only performers or both
            ->where('is_admin', false)
            ->whereRaw("$haversine <= users.discovery_radius_km", [$lat, $lng, $lat]);
    }

    /**
     * Check if user has selected a role.
     */
    public function hasSelectedRole(): bool
    {
        return !empty($this->role_type);
    }

    /**
     * Check if user has completed basic profile setup (identity & location).
     */
    public function isProfileComplete(): bool
    {
        return $this->hasSelectedRole() && 
               !empty($this->username) && 
               !is_null($this->location_lat) && 
               !is_null($this->location_lng);
    }
}
