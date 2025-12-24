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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->unique()->nullable();
            $table->string('phone_country_code', 5)->nullable();
            $table->timestamp('phone_verified_at')->nullable();
            $table->enum('role_type', ['customer', 'performer', 'both'])->default('customer');
            $table->decimal('location_lat', 10, 7)->nullable();
            $table->decimal('location_lng', 10, 7)->nullable();
            $table->string('location_address')->nullable();
            $table->integer('discovery_radius_km')->default(10);
            $table->boolean('is_admin')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'phone_country_code',
                'phone_verified_at',
                'role_type',
                'location_lat',
                'location_lng',
                'location_address',
                'discovery_radius_km',
                'is_admin'
            ]);
        });
    }
};
