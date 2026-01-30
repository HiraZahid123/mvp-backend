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
        // 1. Add Unique Index to Chats (Issue #4)
        // Check if index exists native Laravel method (available since Laravel 10)
        if (!Schema::hasIndex('chats', 'chats_mission_id_unique')) {
             Schema::table('chats', function (Blueprint $table) {
                $table->unique('mission_id', 'chats_mission_id_unique');
            });
        }

        // 2. Add Foreign Key Constraints (Issue #14)
        // NOTE: These foreign keys were already defined in the create_*.php migrations using 'constrained()'.
        // Re-adding them here causes "Duplicate key on write or update" (errno: 121).
        // We are commenting them out to fix the migration error.
        
        /*
        Schema::table('missions', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('assigned_user_id')->references('id')->on('users')->onDelete('set null');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->foreign('mission_id')->references('id')->on('missions')->onDelete('cascade');
        });

        Schema::table('chats', function (Blueprint $table) {
            $table->foreign('mission_id')->references('id')->on('missions')->onDelete('cascade');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->foreign('chat_id')->references('id')->on('chats')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
        
        Schema::table('mission_offers', function (Blueprint $table) {
            $table->foreign('mission_id')->references('id')->on('missions')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
        */
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We commented out the foreign key creation in up(), so we must not drop them here
        // as they belong to the original tables.
        
        /*
        Schema::table('mission_offers', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['mission_id']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['chat_id']);
        });
        */

        Schema::table('chats', function (Blueprint $table) {
            // $table->dropForeign(['mission_id']); // Commented out
            if (Schema::hasIndex('chats', 'chats_mission_id_unique')) {
                $table->dropUnique('chats_mission_id_unique');
            }
        });

        /*
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['mission_id']);
        });

        Schema::table('missions', function (Blueprint $table) {
            $table->dropForeign(['assigned_user_id']);
            $table->dropForeign(['user_id']);
        });
        */
    }
};
