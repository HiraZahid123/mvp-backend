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
        User::updateOrCreate(
            ['email' => 'admin@oflem.com'],
            [
                'name' => 'Admin User',
                'username' => 'admin',
                'phone' => '+41123456789',
                'password' => Hash::make('admin123'),
                'role_type' => 'admin', // Dedicated admin role - not performer or customer
                'admin_role' => 'super_admin', // Super admin with full control
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
                'location_lat' => 46.5197,
                'location_lng' => 6.6323,
                'location_address' => 'Lausanne, Switzerland',
                'balance' => '0.00',
                'pending_withdrawal' => '0.00',
                'total_withdrawn' => '0.00',
            ]
        );

    }
}
