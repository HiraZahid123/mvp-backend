<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProviderProfile extends Model
{
    protected $fillable = [
        'user_id',
        'bio',
        'years_experience',
        'main_category',
        'avs_number',
        'hourly_rate',
        'raw_ai_analysis',
        'iban_encrypted',
        'id_document_path',
        'address_proof_path',
        'work_permit_path',
    ];

    protected $casts = [
        'raw_ai_analysis' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
