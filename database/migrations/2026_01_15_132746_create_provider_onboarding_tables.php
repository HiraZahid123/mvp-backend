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
        // 1. Skills Table
        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('category')->nullable(); // Construction, Tech, etc.
            $table->timestamps();
        });

        // 2. Provider Profiles (Extended info for users)
        Schema::create('provider_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('bio')->nullable();
            $table->integer('years_experience')->default(0);
            $table->string('main_category')->nullable();
            $table->json('raw_ai_analysis')->nullable(); // Store original AI output
            $table->timestamps();
        });

        // 3. Provider Skills (Pivot)
        Schema::create('provider_skills', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('skill_id')->constrained()->onDelete('cascade');
            $table->enum('proficiency_level', ['beginner', 'intermediate', 'expert'])->default('intermediate');
            $table->boolean('verified')->default(false);
            
            $table->primary(['user_id', 'skill_id']); // Composite Key
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('provider_skills');
        Schema::dropIfExists('provider_profiles');
        Schema::dropIfExists('skills');
    }
};
