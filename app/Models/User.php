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
        'is_admin',
        'provider',
        'provider_id',
        'provider_token',
        'provider_refresh_token',
        'provider_token_expires_at',
        'username',
        'profile_photo',
        'zip_code',
        'last_selected_role',
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
}
