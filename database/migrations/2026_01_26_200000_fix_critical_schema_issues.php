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
        // We use a try-catch or just standard unique if we are sure it doesn't exist.
        // In Laravel 11+, we can use Schema::hasIndex but it's sometimes tricky.
        // We'll just define it directly.
        Schema::table('chats', function (Blueprint $table) {
            $table->unique('mission_id', 'chats_mission_id_unique');
        });

        // 2. Add Foreign Key Constraints (Issue #14)
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
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mission_offers', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['mission_id']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['chat_id']);
        });

        Schema::table('chats', function (Blueprint $table) {
            $table->dropForeign(['mission_id']);
            $table->dropUnique(['mission_id']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['mission_id']);
        });

        Schema::table('missions', function (Blueprint $table) {
            $table->dropForeign(['assigned_user_id']);
            $table->dropForeign(['user_id']);
        });
    }
};
