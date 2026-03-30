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
            $table->index('role_type');
        });

        Schema::table('missions', function (Blueprint $table) {
            $table->index('assigned_user_id');
        });

        Schema::table('chats', function (Blueprint $table) {
            $table->index('mission_id');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->index('chat_id');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('reviewer_id');
        });

        Schema::table('mission_offers', function (Blueprint $table) {
            $table->index('user_id');
        });

        Schema::table('mission_questions', function (Blueprint $table) {
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role_type']);
        });

        Schema::table('missions', function (Blueprint $table) {
            $table->dropIndex(['assigned_user_id']);
        });

        Schema::table('chats', function (Blueprint $table) {
            $table->dropIndex(['mission_id']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex(['chat_id']);
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['reviewer_id']);
        });

        Schema::table('mission_offers', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
        });

        Schema::table('mission_questions', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
        });
    }
};
