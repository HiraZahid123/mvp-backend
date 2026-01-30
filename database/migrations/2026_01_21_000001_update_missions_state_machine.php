<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add new columns first
        Schema::table('missions', function (Blueprint $table) {
            // Timestamps for state tracking
            $table->timestamp('locked_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('validation_started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            
            // Dispute handling
            $table->text('dispute_reason')->nullable();
            $table->foreignId('dispute_resolver_id')->nullable()->constrained('users');
            $table->timestamp('dispute_resolved_at')->nullable();
            
            // Payment tracking
            $table->string('payment_intent_id')->nullable()->index();
            $table->decimal('platform_commission', 10, 2)->nullable();
            
            // Address privacy
            $table->boolean('address_revealed')->default(false);
        });

        // Update status enum
        // We do this in a way that preserves data if possible
        // But since we are switching from English to French uppercase, we'll map them
        
        // 1. Rename old status to status_old (temporarily)
        Schema::table('missions', function (Blueprint $table) {
            $table->string('status_old')->nullable()->after('status');
        });
        
        DB::table('missions')->update(['status_old' => DB::raw('status')]);
        
        // 2. Drop old status column
        Schema::table('missions', function (Blueprint $table) {
            $table->dropColumn('status');
        });
        
        // 3. Add new status column
        Schema::table('missions', function (Blueprint $table) {
            $table->enum('status', [
                'OUVERTE',           // Open for offers
                'EN_NEGOCIATION',    // Locked during offer acceptance
                'VERROUILLEE',       // Payment held, assigned
                'EN_COURS',          // Work in progress
                'EN_VALIDATION',     // Awaiting customer validation
                'TERMINEE',          // Completed
                'ANNULEE',           // Cancelled
                'EN_LITIGE'          // Disputed
            ])->default('OUVERTE')->after('additional_details');
        });
        
        // 4. Map old data to new status
        DB::table('missions')->where('status_old', 'open')->update(['status' => 'OUVERTE']);
        DB::table('missions')->where('status_old', 'assigned')->update(['status' => 'VERROUILLEE']);
        DB::table('missions')->where('status_old', 'completed')->update(['status' => 'TERMINEE']);
        DB::table('missions')->where('status_old', 'cancelled')->update(['status' => 'ANNULEE']);
        
        // 5. Drop status_old
        Schema::table('missions', function (Blueprint $table) {
            $table->dropColumn('status_old');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('missions', function (Blueprint $table) {
            $table->dropForeign(['dispute_resolver_id']);
        });

        Schema::table('missions', function (Blueprint $table) {
            $table->dropColumn([
                'locked_at', 'started_at', 'validation_started_at', 
                'completed_at', 'cancelled_at',
                'dispute_reason', 'dispute_resolver_id', 'dispute_resolved_at',
                'payment_intent_id', 'platform_commission', 'address_revealed'
            ]);
            
            // Revert status to original
            $table->dropColumn('status');
        });

        Schema::table('missions', function (Blueprint $table) {
            $table->enum('status', ['open', 'assigned', 'completed', 'cancelled'])->default('open')->after('additional_details');
        });
    }
};
