<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvitationLink extends Model
{
    use HasFactory, HasUuids;

    // UUID PK instead of auto‐increment int:
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'email',
        'first_name',
        'last_name',
        'date_of_birth',
        'date_of_death',
        'is_deceased',
        'relationship_type',
        'last_sent',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'date_of_death' => 'date',
        'is_deceased'   => 'boolean',
        'last_sent'     => 'datetime',
        'created_at'    => 'datetime',
        'updated_at'    => 'datetime',
    ];

    /**
     * Who generated this link?
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
