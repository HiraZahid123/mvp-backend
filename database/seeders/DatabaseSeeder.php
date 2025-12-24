<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
        ]);

        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '+1987654321',
            'role_type' => 'customer',
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
            'location_lat' => 40.7128,
            'location_lng' => -74.0060,
            'location_address' => 'New York, NY, USA',
            'discovery_radius_km' => 10,
        ]);
    }
}
