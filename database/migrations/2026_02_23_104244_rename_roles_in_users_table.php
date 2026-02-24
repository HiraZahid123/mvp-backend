<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Modify the enums first to allow 'client' and 'provider'
        DB::statement("ALTER TABLE users MODIFY COLUMN role_type ENUM('customer', 'performer', 'client', 'provider', 'both', 'admin') NOT NULL DEFAULT 'customer'");
        DB::statement("ALTER TABLE users MODIFY COLUMN last_selected_role ENUM('customer', 'performer', 'client', 'provider', 'both') NULL");

        // 2. Update existing data
        DB::table('users')->where('role_type', 'customer')->update(['role_type' => 'client']);
        DB::table('users')->where('role_type', 'performer')->update(['role_type' => 'provider']);
        
        DB::table('users')->where('last_selected_role', 'customer')->update(['last_selected_role' => 'client']);
        DB::table('users')->where('last_selected_role', 'performer')->update(['last_selected_role' => 'provider']);

        // 3. Finalize the enums by removing old values
        DB::statement("ALTER TABLE users MODIFY COLUMN role_type ENUM('client', 'provider', 'both', 'admin') NOT NULL DEFAULT 'client'");
        DB::statement("ALTER TABLE users MODIFY COLUMN last_selected_role ENUM('client', 'provider', 'both') NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Revert data
        DB::table('users')->where('role_type', 'client')->update(['role_type' => 'customer']);
        DB::table('users')->where('role_type', 'provider')->update(['role_type' => 'performer']);

        DB::table('users')->where('last_selected_role', 'client')->update(['last_selected_role' => 'customer']);
        DB::table('users')->where('last_selected_role', 'provider')->update(['last_selected_role' => 'performer']);

        // 2. Revert enum
        DB::statement("ALTER TABLE users MODIFY COLUMN role_type ENUM('customer', 'performer', 'both', 'admin') NOT NULL DEFAULT 'customer'");
    }
};
