<?php

namespace App\Models;

use App\Enums\RelationshipType;
use Illuminate\Database\Eloquent\Concerns\HasUuids; 
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class UserRelationship extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'related_user_id',
        'relationship_type',
        'family_tree_id',
    ];

    protected $casts = [
        'relationship_type' => RelationshipType::class,
        'created_at'        => 'datetime',
        'updated_at'        => 'datetime',
    ];

    /**
     * Boot method to generate UUID on creating.
     */
    protected static function booted(): void
    {
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function relatedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'related_user_id');
    }

    public function familyTree(): BelongsTo
    {
        return $this->belongsTo(FamilyTree::class);
    }
}
