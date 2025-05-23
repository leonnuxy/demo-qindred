<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Family extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    /**
     * UUID primary keys, not auto-increment.
     * 
     * @var bool
     */
    public $incrementing = false;

    /**
     * Primary key type.
     * 
     * @var string
     */
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'creator_id',
        'updated_by',
        'deleted_by',
        'privacy', // private, shared, public
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Append these accessors when casting to array/JSON.
     *
     * @var array<string>
     */
    protected $appends = [
        'member_count',
        'pending_invitations_count',
        'status',
    ];

    /**
     * Get the user who created the family tree.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    /**
     * The user that last updated this family tree.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * The user that deleted this family tree.
     */
    public function deleter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

    /**
     * Get the members of this family tree.
     */
    public function members(): HasMany
    {
        return $this->hasMany(FamilyMember::class);
    }

    /**
     * Get the users belonging to this family tree through family members.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'family_members')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    /**
     * Get the invitations for the family tree.
     */
    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class);
    }
    
    /**
     * Get the activity logs for the family tree.
     */
    public function logs(): HasMany
    {
        return $this->hasMany(FamilyTreeLog::class)->latest();
    }

    /**
     * Get relationships defined in this family tree.
     */
    public function relationships(): HasMany
    {
        return $this->hasMany(UserRelationship::class);
    }

    /**
     * A family tree is "active" if it has at least one member.
     */
    public function getStatusAttribute(): string
    {
        // Avoid an extra query: use loaded relation if available
        $count = $this->relationLoaded('members')
            ? $this->members->count()
            : $this->members()->count();

        return $count > 0 ? 'active' : 'inactive';
    }

    /**
     * Get the count of pending invitations.
     */
    public function getPendingInvitationsCountAttribute(): int
    {
        return $this->relationLoaded('invitations')
            ? $this->invitations->where('status', 'pending')->count()
            : $this->invitations()->where('status', 'pending')->count();
    }
    
    /**
     * Get the count of members.
     */
    public function getMemberCountAttribute(): int
    {
        return $this->relationLoaded('members')
            ? $this->members->count()
            : $this->members()->count();
    }
}