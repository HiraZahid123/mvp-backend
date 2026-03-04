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
        Schema::table('payments', function (Blueprint $table) {
            $table->string('external_reference_id')->nullable()->after('payment_intent_id')->comment('Stripe Refund or Transfer ID');
            $table->decimal('platform_fee', 10, 2)->nullable()->after('platform_commission');
        });

        Schema::table('withdrawals', function (Blueprint $table) {
            $table->string('external_reference_id')->nullable()->after('status')->comment('Stripe Transfer ID');
            $table->string('currency', 3)->default('CHF')->after('amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['external_reference_id', 'platform_fee']);
        });

        Schema::table('withdrawals', function (Blueprint $table) {
            $table->dropColumn(['external_reference_id', 'currency']);
        });
    }
};
