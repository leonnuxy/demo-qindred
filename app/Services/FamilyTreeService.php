<?php

namespace App\Services;

use App\Enums\RelationshipType;
use App\Models\FamilyMember;
use App\Models\FamilyTree;
use App\Models\User;
use App\Models\UserRelationship;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FamilyTreeService
{
    public function getTreeForDisplay(string $familyTreeId, ?string $perspectiveUserId = null): array
    {
        $tree = FamilyTree::find($familyTreeId);
        if (! $tree) {
            Log::warning("Tree {$familyTreeId} not found");
            return ['error' => 'Family tree not found.'];
        }

        // pick a root: perspective user if member, else creator
        $rootUser = null;
        if ($perspectiveUserId && $u = User::find($perspectiveUserId)) {
            $isMember = FamilyMember::where('family_tree_id',$familyTreeId)
                ->where('user_id',$perspectiveUserId)->exists();
            $rootUser = $isMember ? $u : $tree->creator;
        } else {
            $rootUser = $tree->creator;
        }

        if (! $rootUser) {
            Log::warning("No root for tree {$familyTreeId}");
            return ['error' => 'Could not determine a root user.'];
        }
        // start with an empty “seen” list in a variable so we can pass it by reference
        $seen = [];
        return $this->mapNodeRecursive($rootUser, $familyTreeId, $seen);
    }

    protected function mapNodeRecursive(User $user, string $treeId, array &$seen): array
    {
        if (in_array($user->id, $seen)) {
            return ['id'=>$user->id, 'name'=>$user->name,'note'=>'circular ref'];
        }
        $seen[] = $user->id;

        $node = [
            'id'         => $user->id,
            'name'       => $user->name,
            'attributes' => [
                'birth_date'=> optional($user->date_of_birth)->toDateString(),
                'death_date'=> optional($user->date_of_death)->toDateString(),
            ],
        ];

        // collect relations
        foreach (['father','mother'] as $parentType) {
            if ($p = $user->{$parentType . 'InTree'}($treeId)) {
                $node['parents'][] = $this->mapNodeRecursive($p, $treeId, $seen);
            }
        }

        foreach (['spouses','children'] as $rel) {
            $coll = $user->{$rel . 'InTree'}($treeId);
            if ($coll instanceof Collection) {
                foreach ($coll as $other) {
                    $node[$rel][] = $this->mapNodeRecursive($other, $treeId, $seen);
                }
            }
        }

        return $node;
    }

    public function createFamilyTree(array $data, string $userId): FamilyTree
    {
        return DB::transaction(function() use($data,$userId){
            $tree = FamilyTree::create([
                'name'        => $data['name'],
                'description' => $data['description'] ?? null,
                'creator_id'  => $userId,
                'privacy'     => $data['privacy'] ?? 'private',
            ]);

            FamilyMember::create([
                'family_tree_id' => $tree->id,
                'user_id'        => $userId,
                'role'           => 'creator',
            ]);

            return $tree;
        });
    }

    public function addDirectMember(string $treeId, array $m): array
    {
        $me = Auth::user();
        
        if (!$me) {
            Log::warning("Attempted to add direct member without authentication");
        }
        
        return DB::transaction(function() use($treeId,$m,$me){
            // Use the relationshipToUser or relationshipToMe field (for backward compatibility)
            $relationshipType = $m['relationshipToUser'] ?? $m['relationshipToMe'] ?? null;
            
            // Log the inputs for debugging
            Log::info("Adding direct member", [
                'tree_id' => $treeId,
                'relationship' => $relationshipType,
                'email' => $m['email'] ?? null,
            ]);
            
            // First, check if this is an existing user (based on valid email)
            $existingUser = null;
            if (!empty($m['email']) && filter_var($m['email'], FILTER_VALIDATE_EMAIL)) {
                $existingUser = User::where('email', $m['email'])->first();
                if ($existingUser) {
                    Log::info("Found existing user", ['id' => $existingUser->id, 'email' => $existingUser->email]);
                }
            }
            
            // If it's the logged-in user, use that
            if ($existingUser && $existingUser->id === $me->id) {
                $u = $existingUser;
                $isNewUser = false;
            } 
            // For any other email match, use that user
            else if ($existingUser) {
                $u = $existingUser;
                $isNewUser = false;
            } 
            // Otherwise create a new placeholder user
            else {
                try {
                    $u = User::create([
                        'id'                 => Str::uuid(), // Generate UUID
                        'first_name'         => $m['firstName'],
                        'last_name'          => $m['lastName'],
                        'date_of_birth'      => $m['dateOfBirth'] ?? null,
                        'date_of_death'      => ($m['isDeceased'] ?? false) ? ($m['dateOfDeath'] ?? null) : null,
                        'email'              => !empty($m['email']) && filter_var($m['email'], FILTER_VALIDATE_EMAIL) 
                            ? $m['email'] 
                            : 'placeholder-'.Str::uuid().'@local',
                        'password'           => bcrypt(Str::random(32)), // Generate a random secure password
                        'is_placeholder'     => true,
                        'email_verified_at'  => now(),
                        'role'               => 'user',
                        'status'             => ($m['isDeceased'] ?? false) ? 'deceased' : 'active',
                    ]);
                    
                    Log::info("Created new user", ['id' => $u->id, 'email' => $u->email]);
                    $isNewUser = true;
                } catch (\Exception $e) {
                    Log::error("Failed to create user", ['error' => $e->getMessage()]);
                    throw $e;
                }
            }

            // Only create the family member record if it doesn't exist
            $existingMember = FamilyMember::where('family_tree_id', $treeId)
                ->where('user_id', $u->id)
                ->first();
                
            if (!$existingMember) {
                // Log user ID for debugging
                Log::info("Creating family member", [
                    'tree_id' => $treeId,
                    'user_id' => $u->id,
                    'role' => $relationshipType,
                ]);
                
                try {
                    FamilyMember::create([
                        'family_tree_id' => (string)$treeId,
                        'user_id'        => (string)$u->id,
                        'role'           => (string)$relationshipType,
                    ]);
                } catch (\Exception $e) {
                    Log::error("Failed to create family member", [
                        'tree_id' => $treeId,
                        'user_id' => $u->id,
                        'role' => $relationshipType,
                        'error' => $e->getMessage(),
                    ]);
                    throw $e;
                }
            }

            /** store relationship both ways **/
            if ($rel = RelationshipType::tryFrom($relationshipType)) {
                // Only create relationships if the current user is authenticated and not the same as the target user
                if ($me && $me->id !== $u->id) {
                    // Create primary relationship (me to other) if it doesn't exist
                    $existingRel1 = UserRelationship::where('family_tree_id', $treeId)
                        ->where('user_id', $me->id)
                        ->where('related_user_id', $u->id)
                        ->first();
                        
                    if (!$existingRel1) {
                        try {
                            UserRelationship::create([
                                'family_tree_id'   => (string)$treeId,
                                'user_id'          => (string)$me->id,
                                'related_user_id'  => (string)$u->id,
                                'relationship_type'=> $rel->value,
                            ]);
                        } catch (\Exception $e) {
                            Log::error("Failed to create primary relationship", [
                                'error' => $e->getMessage(),
                                'user_id' => $me->id,
                                'related_user_id' => $u->id,
                            ]);
                            // Continue without throwing to allow other operations
                        }
                    }
                    
                    // Create reciprocal relationship (other to me) if it doesn't exist
                    $existingRel2 = UserRelationship::where('family_tree_id', $treeId)
                        ->where('user_id', $u->id)
                        ->where('related_user_id', $me->id)
                        ->first();
                        
                    if (!$existingRel2) {
                        try {
                            UserRelationship::create([
                                'family_tree_id'   => (string)$treeId,
                                'user_id'          => (string)$u->id,
                                'related_user_id'  => (string)$me->id,
                                'relationship_type'=> $rel->getReciprocal()->value,
                            ]);
                        } catch (\Exception $e) {
                            Log::error("Failed to create reciprocal relationship", [
                                'error' => $e->getMessage(),
                                'user_id' => $u->id,
                                'related_user_id' => $me->id,
                            ]);
                            // Continue without throwing
                        }
                    }
                }
            }

            // Only log if a new member was created or associated
            $actionText = $isNewUser ? "Added new member {$u->name} directly" : "Associated existing user {$u->name} with the family tree";
            $this->logActivity($treeId, $actionText);
            
            return [
                'id' => $u->id,
                'firstName'=> $u->first_name,
                'lastName' => $u->last_name,
                'relationshipToUser'=> $relationshipType,
                'isPlaceholder'=> $u->is_placeholder ?? false,
            ];
        });
    }

    public function inviteMember(string $treeId, array $m): array
    {
        $inv = \App\Models\Invitation::create([
            'family_tree_id'   => $treeId,
            'email'            => $m['email'],
            'invited_by'       => Auth::id(),
            'relationship_type'=> $m['relationshipToUser'],
            'status'           => 'pending',
        ]);
        $this->logActivity($treeId, "Invited {$m['email']}");
        return [
            'id' => 'pending_'.$inv->id,
            'email' => $m['email'],
            'status'=> 'pending',
        ];
    }

    public function updateMember(string $treeId, string $memberId, array $m): array
    {
        // Log the inputs for debugging
        Log::info("Updating member", [
            'tree_id' => $treeId,
            'member_id' => $memberId,
            'data' => $m
        ]);
        
        try {
            $u = User::findOrFail($memberId);
            $u->update([
                'first_name'    => $m['firstName'],
                'last_name'     => $m['lastName'],
                'date_of_birth' => $m['dateOfBirth'] ?? null,
                'date_of_death' => $m['isDeceased'] ? $m['dateOfDeath'] : null,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to update user", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }

        $me = Auth::user();
        
        if ($rel = RelationshipType::tryFrom($m['relationshipToUser']) && $me) {
            try {
                UserRelationship::updateOrCreate(
                    [
                        'family_tree_id' => (string)$treeId,
                        'user_id' => (string)$me->id,
                        'related_user_id' => (string)$u->id
                    ],
                    ['relationship_type' => $rel->value]
                );
                
                UserRelationship::updateOrCreate(
                    [
                        'family_tree_id' => (string)$treeId,
                        'user_id' => (string)$u->id,
                        'related_user_id' => (string)$me->id
                    ],
                    ['relationship_type' => $rel->getReciprocal()->value]
                );
            } catch (\Exception $e) {
                Log::error("Failed to update relationships", [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                // Continue even if relationship update fails
            }
        }

        $this->logActivity($treeId, "Updated {$u->name}");
        return ['id'=>$u->id,'firstName'=>$u->first_name,'lastName'=>$u->last_name];
    }

    public function deleteMember(string $treeId, string $memberId): bool
    {
        DB::transaction(function() use($treeId,$memberId){
            UserRelationship::where('family_tree_id',$treeId)
                ->where(function($q)use($memberId){
                    $q->where('user_id',$memberId)
                      ->orWhere('related_user_id',$memberId);
                })->delete();

            FamilyMember::where('family_tree_id',$treeId)
                ->where('user_id',$memberId)
                ->delete();
        });
        $this->logActivity($treeId, "Removed member {$memberId}");
        return true;
    }

    public function getFamilyMembers(string $treeId): array
    {
        $me = Auth::user();
        return FamilyMember::with('user.gender')
            ->where('family_tree_id',$treeId)
            ->get()
            ->map(fn($fm)=>[
                'id'        => $fm->user->id,
                'name'      => $fm->user->name,
                'roleInTree'=> $fm->role,
            ])->toArray();
    }

    public function getRelationshipTypes(): array
    {
        return collect(RelationshipType::cases())
            ->map(fn($c)=>['value'=>$c->value,'label'=>$c->getDisplayName()])
            ->all();
    }

    protected function logActivity(string $treeId, string $msg): void
    {
        // Get authenticated user ID or use the tree's creator ID as fallback
        $userId = Auth::id();
        
        // If no authenticated user, find the tree creator
        if (!$userId) {
            $tree = FamilyTree::find($treeId);
            $userId = $tree->creator_id ?? null;
            \Log::info("No authenticated user for activity log, using fallback user", ['tree_id' => $treeId, 'fallback_user_id' => $userId]);
        }
        
        // Only proceed if we have a user ID
        if ($userId) {
            FamilyTree::find($treeId)
                ->logs()
                ->create(['user_id' => $userId, 'action' => $msg]);
        } else {
            \Log::warning("Failed to create activity log - no user ID available", ['tree_id' => $treeId, 'action' => $msg]);
        }
    }
}
