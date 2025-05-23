<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class FamilyTree extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    /**
     * Disable auto-incrementing and use string (UUID) keys.
     */
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'id',           // allow seeder to set the UUID
        'name',
        'description',
        'creator_id',   // matches your migration's foreign key
        'privacy',
    ];

    /**
     * Relationships.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(FamilyMember::class);
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(FamilyTreeLog::class)->latest();
    }

    public function users(): BelongsToMany
    {
        return $this
            ->belongsToMany(User::class, 'family_members')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Accessors.
     */
    public function getMemberCountAttribute(): int
    {
        return $this->members()->count();
    }

    public function getPendingInvitationsCountAttribute(): int
    {
        return $this->invitations()->where('status', 'pending')->count();
    }
}
