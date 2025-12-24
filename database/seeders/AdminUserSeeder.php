<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@oflem.com'],
            [
                'name' => 'Admin User',
                'phone' => '+1234567890',
                'password' => Hash::make('password'),
                'role_type' => 'customer', // Default role for admin
                'is_admin' => true,
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
                'location_lat' => 40.7128,
                'location_lng' => -74.0060,
                'location_address' => 'New York, NY, USA',
                'discovery_radius_km' => 10,
            ]
        );
    }
}
