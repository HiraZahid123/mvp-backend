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
        Schema::table('provider_profiles', function (Blueprint $table) {
            $table->string('iban_encrypted')->nullable()->after('main_category');
            $table->string('id_document_path')->nullable()->after('iban_encrypted');
            $table->string('address_proof_path')->nullable()->after('id_document_path');
            $table->string('work_permit_path')->nullable()->after('address_proof_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('provider_profiles', function (Blueprint $table) {
            $table->dropColumn(['iban_encrypted', 'id_document_path', 'address_proof_path', 'work_permit_path']);
        });
    }
};
