<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modify the role_type enum to include 'admin'
        DB::statement("ALTER TABLE users MODIFY COLUMN role_type ENUM('customer', 'performer', 'both', 'admin') NOT NULL DEFAULT 'customer'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove 'admin' from the enum (revert to original values)
        DB::statement("ALTER TABLE users MODIFY COLUMN role_type ENUM('customer', 'performer', 'both') NOT NULL DEFAULT 'customer'");
    }
};
