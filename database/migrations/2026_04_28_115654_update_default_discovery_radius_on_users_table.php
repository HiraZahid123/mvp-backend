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
        // Update default for new users
        Schema::table('users', function (Blueprint $table) {
            $table->integer('discovery_radius_km')->default(50)->change();
        });

        // Update existing users who are still using the old default (10 or 30)
        DB::table('users')
            ->whereIn('discovery_radius_km', [10, 30])
            ->update(['discovery_radius_km' => 50]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->integer('discovery_radius_km')->default(10)->change();
        });
    }
};
