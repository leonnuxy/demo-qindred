<?php

namespace App\Models;

use App\Enums\RelationshipType;
use App\Models\Gender;
use App\Models\UserRelationship;
use App\Models\FamilyTree;
use App\Models\FamilyMember;
use App\Models\Invitation;
use App\Models\Family;
use App\Models\Memory;
use App\Models\Testimonial;
use App\Models\Event;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable implements MustVerifyEmail
{
    use Notifiable, HasFactory, HasUuids;

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            // Auto verify all emails for now
            $user->email_verified_at = now();
        });
    }

    /**
     * Primary key is UUID and not auto-increment.
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
     * Eager-load gender relationship.
     *
     * @var array<string>
     */
    protected $with = ['gender'];

    /**
     * Mass assignable attributes.
     *
     * @var array<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'gender_id',
        'date_of_birth',
        'date_of_death',
        'role',
        'status',
        'bio',
        'phone',
        'city',
        'state',
        'country',
        'profile_photo',
        'avatar_path',
        'profile_visibility',
        'is_profile_placeholder',
        'is_profile_completed',
        'setup_completed',
        'setup_completed_at',
    ];

    /**
     * Hidden attributes for serialization.
     *
     * @var array<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Attribute casting.
     *
     * @var array<string,string>
     */
    protected $casts = [
        'email_verified_at'    => 'datetime',
        'created_at'           => 'datetime',
        'updated_at'           => 'datetime',
        'setup_completed_at'   => 'datetime',
        'date_of_birth'        => 'date',
        'date_of_death'        => 'date',
        'password'             => 'hashed',
        'is_profile_placeholder' => 'boolean',
        'is_profile_completed'   => 'boolean',
        'setup_completed'        => 'boolean',
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

    /**
     * Accessor for full name.
     */
    public function getNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    /**
     * Accessor for avatar URL or placeholder.
     */
    public function getAvatarUrlAttribute(): string
    {
        return $this->avatar_path
            ? asset('storage/'.$this->avatar_path)
            : '/assets/avatar-placeholder.png';
    }

    /**
     * Eloquent relationships.
     */
    public function gender()
    {
        return $this->belongsTo(Gender::class);
    }

    public function createdFamilyTrees()
    {
        return $this->hasMany(FamilyTree::class, 'creator_id');
    }

    public function familyMemberships()
    {
        return $this->hasMany(FamilyMember::class);
    }

    public function familyTrees()
    {
        return $this->belongsToMany(FamilyTree::class, 'family_members')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function sentInvitations()
    {
        return $this->hasMany(Invitation::class, 'invited_by');
    }

    public function families()
    {
        return $this->belongsToMany(Family::class, 'family_user')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function memories()
    {
        return $this->hasMany(Memory::class);
    }

    public function testimonials()
    {
        return $this->hasMany(Testimonial::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }

    /**
     * Convenience methods for role checks.
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    // Additional relationship helpers for family-tree context
    protected function getRelatedUsersInTree(
        $familyTreeId,
        RelationshipType $type,
        bool $asSubject = true
    ) {
        \Log::info("Looking for relationships", [
            'user_id' => $this->id,
            'tree_id' => $familyTreeId,
            'relationship_type' => $type->value,
            'as_subject' => $asSubject
        ]);
        
        $query = UserRelationship::where('family_tree_id', $familyTreeId)
                                  ->where('relationship_type', $type->value);
        if ($asSubject) {
            $query->where('user_id', $this->id);
            $relatedIds = $query->pluck('related_user_id')->toArray();
            \Log::info("Found related users (as subject)", [
                'count' => count($relatedIds),
                'ids' => $relatedIds
            ]);
            return self::whereIn('id', $relatedIds);
        }
        $query->where('related_user_id', $this->id);
        $userIds = $query->pluck('user_id')->toArray();
        \Log::info("Found users (as object)", [
            'count' => count($userIds),
            'ids' => $userIds
        ]);
        return self::whereIn('id', $userIds);
    }

    public function fatherInTree($familyTreeId)
    {
        return $this->getRelatedUsersInTree($familyTreeId, RelationshipType::FATHER, false)
                    ->first();
    }

    public function motherInTree($familyTreeId)
    {
        return $this->getRelatedUsersInTree($familyTreeId, RelationshipType::MOTHER, false)
                    ->first();
    }

    public function spousesInTree($familyTreeId)
    {
        // Use Marriage model for more accurate spouse tracking
        $marriages = \App\Models\Marriage::where('family_tree_id', $familyTreeId)
            ->where(function($q) {
                $q->where('spouse1_id', $this->id)
                  ->orWhere('spouse2_id', $this->id);
            })
            ->with(['spouse1', 'spouse2'])
            ->get();
            
        $spouses = collect();
        foreach ($marriages as $marriage) {
            $spouse = $marriage->spouse1_id === $this->id ? $marriage->spouse2 : $marriage->spouse1;
            if ($spouse) {
                // Add marriage context to the spouse
                $spouse->marriage_context = [
                    'marriage_id' => $marriage->id,
                    'marriage_date' => $marriage->marriage_date,
                    'divorce_date' => $marriage->divorce_date,
                    'is_current' => $marriage->is_current,
                ];
                $spouses->push($spouse);
            }
        }
        
        return $spouses;
    }

    public function childrenInTree($familyTreeId)
    {
        $children = $this->getRelatedUsersInTree($familyTreeId, RelationshipType::CHILD)
                         ->get();
                         
        // Enhance children with marriage context
        return $children->map(function($child) use ($familyTreeId) {
            $relationship = \App\Models\UserRelationship::where('family_tree_id', $familyTreeId)
                ->where('user_id', $this->id)
                ->where('related_user_id', $child->id)
                ->where('relationship_type', RelationshipType::CHILD->value)
                ->first();
                
            if ($relationship && $relationship->marriage_id) {
                $marriage = \App\Models\Marriage::find($relationship->marriage_id);
                if ($marriage) {
                    $child->marriage_context = [
                        'marriage_id' => $marriage->id,
                        'other_parent_id' => $relationship->other_parent_id,
                        'other_parent' => $relationship->other_parent_id ? 
                            User::find($relationship->other_parent_id) : null,
                    ];
                }
            }
            
            return $child;
        });
    }
    
    /**
     * Get children from a specific marriage
     */
    public function childrenFromMarriage($familyTreeId, $marriageId)
    {
        $childIds = \App\Models\UserRelationship::where('family_tree_id', $familyTreeId)
            ->where('user_id', $this->id)
            ->where('relationship_type', RelationshipType::CHILD->value)
            ->where('marriage_id', $marriageId)
            ->pluck('related_user_id');
            
        return User::whereIn('id', $childIds)->get();
    }
}
