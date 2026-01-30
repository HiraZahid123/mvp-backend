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
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Quiet Hours (Swiss Time)
            $table->boolean('quiet_hours_enabled')->default(true);
            $table->time('quiet_hours_start')->default('22:00:00');
            $table->time('quiet_hours_end')->default('07:00:00');
            
            // Notification Type Preferences
            $table->boolean('new_mission_nearby')->default(true); // For Performers
            $table->boolean('new_offer_received')->default(true); // For Customers
            $table->boolean('offer_accepted')->default(true);
            $table->boolean('offer_rejected')->default(true);
            $table->boolean('mission_updated')->default(true);
            $table->boolean('mission_cancelled')->default(true);
            $table->boolean('new_question')->default(true);
            $table->boolean('question_answered')->default(true);
            $table->boolean('chat_message')->default(true);
            
            // Delivery Preferences
            $table->boolean('email_enabled')->default(true);
            $table->boolean('push_enabled')->default(true);
            $table->boolean('in_app_enabled')->default(true);
            
            // Digest Options
            $table->boolean('digest_enabled')->default(false);
            $table->enum('digest_frequency', ['hourly', 'daily'])->default('daily');
            
            $table->timestamps();
            
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
    }
};
