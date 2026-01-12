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
            $table->string('username')->nullable()->after('name');
            $table->string('profile_photo')->nullable()->after('email');
            $table->string('zip_code')->nullable()->after('location_address');
            $table->enum('last_selected_role', ['customer', 'performer', 'both'])->nullable()->after('role_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'profile_photo', 'zip_code', 'last_selected_role']);
        });
    }
};
