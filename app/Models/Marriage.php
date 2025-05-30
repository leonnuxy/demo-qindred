<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Marriage extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'spouse1_id',
        'spouse2_id',
        'family_tree_id',
        'marriage_date',
        'divorce_date',
        'is_current',
        'marriage_type',
    ];

    protected $casts = [
        'marriage_date' => 'date',
        'divorce_date' => 'date',
        'is_current' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
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

    public function spouse1(): BelongsTo
    {
        return $this->belongsTo(User::class, 'spouse1_id');
    }

    public function spouse2(): BelongsTo
    {
        return $this->belongsTo(User::class, 'spouse2_id');
    }

    public function familyTree(): BelongsTo
    {
        return $this->belongsTo(FamilyTree::class);
    }

    public function children(): HasMany
    {
        return $this->hasMany(UserRelationship::class, 'marriage_id')
            ->where('relationship_type', 'child');
    }

    /**
     * Get the other spouse in this marriage relationship
     */
    public function getOtherSpouse(string $userId): ?User
    {
        if ($this->spouse1_id === $userId) {
            return $this->spouse2;
        } elseif ($this->spouse2_id === $userId) {
            return $this->spouse1;
        }
        
        return null;
    }

    /**
     * Check if a user is part of this marriage
     */
    public function includesUser(string $userId): bool
    {
        return $this->spouse1_id === $userId || $this->spouse2_id === $userId;
    }

    /**
     * Scope to get current (not divorced) marriages
     */
    public function scopeCurrent($query)
    {
        return $query->where('is_current', true)
            ->where(function ($q) {
                $q->whereNull('divorce_date')
                  ->orWhere('divorce_date', '>', now());
            });
    }
}
