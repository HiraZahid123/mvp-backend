<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Stores an array of saved bank accounts for quick withdrawal re-use
            $table->json('saved_bank_accounts')->nullable()->after('total_withdrawn');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('saved_bank_accounts');
        });
    }
};
