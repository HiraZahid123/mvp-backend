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
            $table->decimal('pending_withdrawal', 10, 2)->default(0.00)->after('balance');
            $table->decimal('total_withdrawn', 10, 2)->default(0.00)->after('pending_withdrawal');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['pending_withdrawal', 'total_withdrawn']);
        });

    }
};
