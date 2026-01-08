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
            if (!Schema::hasColumn('users', 'provider')) {
                $table->string('provider')->nullable()->after('is_admin'); // google, apple, facebook
            }
            if (!Schema::hasColumn('users', 'provider_id')) {
                $table->string('provider_id')->nullable()->after('provider'); // OAuth provider ID
            }
            if (!Schema::hasColumn('users', 'provider_token')) {
                $table->string('provider_token')->nullable()->after('provider_id'); // Access token
            }
            if (!Schema::hasColumn('users', 'provider_refresh_token')) {
                $table->string('provider_refresh_token')->nullable()->after('provider_token'); // Refresh token (if applicable)
            }
            if (!Schema::hasColumn('users', 'provider_token_expires_at')) {
                $table->timestamp('provider_token_expires_at')->nullable()->after('provider_refresh_token'); // Token expiry
            }

            if (!Schema::hasTable('users_provider_id_index')) {
                $table->index('provider_id'); // For faster lookups
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['provider_id']);
            $table->dropColumn([
                'provider',
                'provider_id',
                'provider_token',
                'provider_refresh_token',
                'provider_token_expires_at',
            ]);
        });
    }
};
