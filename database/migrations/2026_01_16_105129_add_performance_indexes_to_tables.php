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
        // 1. Indexes for Users (Spatial matching)
        Schema::table('users', function (Blueprint $table) {
            $table->index(['location_lat', 'location_lng'], 'idx_user_location');
            $table->index('is_admin');
        });

        // 2. Indexes for Missions (Searching & Dashboard)
        Schema::table('missions', function (Blueprint $table) {
            $table->index('category');
            $table->index('status');
            $table->index('user_id');
        });

        // 3. Indexes for Provider Skills (Relational matching)
        Schema::table('provider_skills', function (Blueprint $table) {
            // Composite Primary is already there: [user_id, skill_id]
            // We specifically need an index on skill_id for searching providers BY skill
            $table->index('skill_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_user_location');
            $table->dropIndex(['is_admin']);
        });

        Schema::table('missions', function (Blueprint $table) {
            $table->dropIndex(['category']);
            $table->dropIndex(['status']);
            $table->dropIndex(['user_id']);
        });

        Schema::table('provider_skills', function (Blueprint $table) {
            $table->dropIndex(['skill_id']);
        });
    }
};
