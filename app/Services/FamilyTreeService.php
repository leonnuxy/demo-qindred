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

        Log::info("Mapping user node", [
            'user_id' => $user->id, 
            'name' => $user->name,
            'tree_id' => $treeId
        ]);

        $node = [
            'id'         => $user->id,
            'name'       => $user->name,
            'firstName'  => $user->first_name,
            'lastName'   => $user->last_name,
            'gender'     => $user->gender?->value,
            'dateOfBirth'=> optional($user->date_of_birth)->toDateString(),
            'dateOfDeath'=> optional($user->date_of_death)->toDateString(), 
            'isDeceased' => (bool)$user->is_deceased,
            'email'      => $user->email,
            'attributes' => [
                'birth_date'=> optional($user->date_of_birth)->toDateString(),
                'death_date'=> optional($user->date_of_death)->toDateString(),
                'gender'    => $user->gender?->value,
                'isCreator' => $treeId && FamilyTree::where('id', $treeId)
                                ->where('creator_id', $user->id)->exists(),
                'roleInTree'=> $treeId ? FamilyMember::where('family_tree_id', $treeId)
                                ->where('user_id', $user->id)
                                ->first()?->role : null,
            ],
        ];

        // collect relations
        foreach (['father','mother'] as $parentType) {
            $parent = $user->{$parentType . 'InTree'}($treeId);
            if ($parent) {
                Log::info("Found {$parentType} for user", [
                    'user_id' => $user->id,
                    'parent_id' => $parent->id,
                    'parent_name' => $parent->name
                ]);
                if (!isset($node['parents'])) {
                    $node['parents'] = [];
                }
                $node['parents'][] = $this->mapNodeRecursive($parent, $treeId, $seen);
            } else {
                Log::info("No {$parentType} found for user", [
                    'user_id' => $user->id,
                    'tree_id' => $treeId
                ]);
            }
        }

        foreach (['spouses','children'] as $rel) {
            $collection = $user->{$rel . 'InTree'}($treeId);
            if ($collection instanceof Collection && $collection->count() > 0) {
                Log::info("Found {$rel} for user", [
                    'user_id' => $user->id,
                    'count' => $collection->count(),
                    'ids' => $collection->pluck('id')->toArray()
                ]);
                if (!isset($node[$rel])) {
                    $node[$rel] = [];
                }
                foreach ($collection as $other) {
                    $node[$rel][] = $this->mapNodeRecursive($other, $treeId, $seen);
                }
            } else {
                Log::info("No {$rel} found for user", [
                    'user_id' => $user->id,
                    'tree_id' => $treeId
                ]);
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
                            Log::info("Created primary relationship", [
                                'user_id' => $me->id,
                                'related_user_id' => $u->id,
                                'type' => $rel->value
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
                            $reciprocalType = $rel->getReciprocal()->value;
                            UserRelationship::create([
                                'family_tree_id'   => (string)$treeId,
                                'user_id'          => (string)$u->id,
                                'related_user_id'  => (string)$me->id,
                                'relationship_type'=> $reciprocalType,
                            ]);
                            Log::info("Created reciprocal relationship", [
                                'user_id' => $u->id,
                                'related_user_id' => $me->id,
                                'type' => $reciprocalType
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
                    
                    // Special handling for specific relationships to ensure all family connections
                    if (in_array($rel->value, ['child', 'father', 'mother', 'parent'])) {
                        $this->ensureFamilyLinks($treeId, $me->id, $u->id, $rel->value);
                    }
                }
            }

            // Only log if a new member was created or associated
            $actionText = $isNewUser ? "Added new member {$u->name} directly" : "Associated existing user {$u->name} with the family tree";
            $this->logActivity($treeId, $actionText);
            
            // Return the member data with the updated hierarchical tree data
            return [
                'id' => $u->id,
                'firstName' => $u->first_name,
                'lastName' => $u->last_name,
                'email' => $u->email,
                'dateOfBirth' => $u->date_of_birth ? $u->date_of_birth->format('Y-m-d') : null,
                'dateOfDeath' => $u->date_of_death ? $u->date_of_death->format('Y-m-d') : null,
                'isDeceased' => (bool)$u->is_deceased,
                'gender' => $u->gender?->value ?? null,
                'relationshipToUser' => $relationshipType,
                'roleInTree' => 'member', // Default role
                'isPlaceholder' => (bool)($u->is_placeholder ?? false),
                'hierarchicalTreeData' => $this->getTreeForDisplay($treeId, $me ? $me->id : $this->getFallbackUserId($treeId)),
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
                // Create or update the primary relationship (me to member)
                UserRelationship::updateOrCreate(
                    [
                        'family_tree_id' => (string)$treeId,
                        'user_id' => (string)$me->id,
                        'related_user_id' => (string)$u->id
                    ],
                    ['relationship_type' => $rel->value]
                );
                
                Log::info("Updated primary relationship", [
                    'user_id' => $me->id,
                    'related_user_id' => $u->id,
                    'relationship_type' => $rel->value
                ]);
                
                // Create or update the reciprocal relationship (member to me)
                UserRelationship::updateOrCreate(
                    [
                        'family_tree_id' => (string)$treeId,
                        'user_id' => (string)$u->id,
                        'related_user_id' => (string)$me->id
                    ],
                    ['relationship_type' => $rel->getReciprocal()->value]
                );
                
                Log::info("Updated reciprocal relationship", [
                    'user_id' => $u->id,
                    'related_user_id' => $me->id,
                    'relationship_type' => $rel->getReciprocal()->value
                ]);
                
                // Ensure family links are updated for parent-child relationships
                if (in_array($rel->value, ['child', 'father', 'mother', 'parent'])) {
                    $this->ensureFamilyLinks($treeId, $me->id, $u->id, $rel->value);
                }
            } catch (\Exception $e) {
                Log::error("Failed to update relationships", [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                // Continue even if relationship update fails
            }
        }

        $this->logActivity($treeId, "Updated {$u->name}");
        
        // Get the updated relationship for this user
        $relationship = 'other'; // default
        if ($me) {
            $rel = UserRelationship::where('family_tree_id', $treeId)
                ->where('user_id', $me->id)
                ->where('related_user_id', $u->id)
                ->first();
            if ($rel) {
                $relationship = $rel->relationship_type;
            }
        }
        
        // Return updated member with fresh tree data
        return [
            'id' => $u->id,
            'firstName' => $u->first_name,
            'lastName' => $u->last_name,
            'email' => $u->email,
            'dateOfBirth' => $u->date_of_birth ? $u->date_of_birth->format('Y-m-d') : null,
            'dateOfDeath' => $u->date_of_death ? $u->date_of_death->format('Y-m-d') : null, 
            'isDeceased' => (bool)$u->is_deceased,
            'gender' => $u->gender?->value ?? null,
            'relationshipToUser' => $relationship,
            'roleInTree' => FamilyMember::where('family_tree_id', $treeId)
                          ->where('user_id', $u->id)
                          ->first()?->role ?? 'member',
            'hierarchicalTreeData' => $this->getTreeForDisplay($treeId, $me ? $me->id : null),
        ];
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
        
        // Get the family tree to check for creator
        $familyTree = FamilyTree::find($treeId);
        if (!$familyTree) {
            return [];
        }
        
        // Get all family members with their user relationships
        $familyMembers = FamilyMember::with(['user.gender'])
            ->where('family_tree_id', $treeId)
            ->get();
            
        // Get relationship data for each member if current user is authenticated
        $relationships = [];
        if ($me) {
            $relationships = UserRelationship::where('family_tree_id', $treeId)
                ->where('user_id', $me->id)
                ->pluck('relationship_type', 'related_user_id')
                ->toArray();
        }
        
        return $familyMembers->map(function($fm) use ($familyTree) {
            // Determine if this member is the creator of the family tree
            $isCreator = $familyTree->creator_id === $fm->user->id;
            
            return [
                'id' => $fm->user->id,
                'firstName' => $fm->user->first_name,
                'lastName' => $fm->user->last_name,
                'email' => $fm->user->email,
                'dateOfBirth' => $fm->user->date_of_birth ? $fm->user->date_of_birth->format('Y-m-d') : null,
                'dateOfDeath' => $fm->user->date_of_death ? $fm->user->date_of_death->format('Y-m-d') : null,
                'isDeceased' => (bool)$fm->user->is_deceased,
                'gender' => $fm->user->gender?->value ?? null,
                'relationshipToUser' => $relationships[$fm->user->id] ?? $fm->role ?? 'other',
                'roleInTree' => $fm->role,
                'isPlaceholder' => (bool)($fm->user->is_placeholder ?? false),
                'isCreator' => $isCreator,  // Add flag to identify the creator
            ];
        })->toArray();
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

    /**
     * Ensure proper family links are created for parent-child relationships
     *
     * @param string $treeId
     * @param string $userId1
     * @param string $userId2
     * @param string $relationshipType
     * @return void
     */
    protected function ensureFamilyLinks(string $treeId, string $userId1, string $userId2, string $relationType): void
    {
        Log::info("Ensuring family links", [
            'tree_id' => $treeId,
            'user1_id' => $userId1,
            'user2_id' => $userId2,
            'relationship' => $relationType
        ]);

        // If user1 is a parent of user2
        if (in_array($relationType, ['father', 'mother', 'parent'])) {
            $parentId = $userId1;
            $childId = $userId2;
        }
        // If user1 is a child of user2
        else if ($relationType === 'child') {
            $parentId = $userId2;
            $childId = $userId1;
        }
        // Not a parent-child relationship
        else {
            return;
        }

        try {
            // Get parent's spouse if any exists
            $parent = User::find($parentId);
            $spouses = $parent->spousesInTree($treeId);

            if ($spouses && $spouses->count() > 0) {
                foreach ($spouses as $spouse) {
                    // Add parent relationship from spouse to child
                    $existingParentRel = UserRelationship::where('family_tree_id', $treeId)
                        ->where('user_id', $spouse->id)
                        ->where('related_user_id', $childId)
                        ->first();
                        
                    if (!$existingParentRel) {
                        // Determine the appropriate parent type based on spouse's gender
                        $parentType = 'parent'; // Default
                        if ($spouse->gender) {
                            if ($spouse->gender->value === 'male') {
                                $parentType = 'father';
                            } else if ($spouse->gender->value === 'female') {
                                $parentType = 'mother';
                            }
                        }
                        
                        UserRelationship::create([
                            'family_tree_id'   => $treeId,
                            'user_id'          => $spouse->id,
                            'related_user_id'  => $childId,
                            'relationship_type'=> $parentType,
                        ]);
                        
                        // Add child relationship from child to spouse
                        UserRelationship::create([
                            'family_tree_id'   => $treeId,
                            'user_id'          => $childId,
                            'related_user_id'  => $spouse->id,
                            'relationship_type'=> 'child',
                        ]);
                        
                        Log::info("Created additional parent-child relationship", [
                            'parent_id' => $spouse->id,
                            'child_id' => $childId
                        ]);
                    }
                }
            }
            
            // Get parent's other children to create sibling relationships
            $child = User::find($childId);
            $parent = User::find($parentId);
            $siblings = $parent->childrenInTree($treeId)->where('id', '!=', $childId);
            
            if ($siblings && $siblings->count() > 0) {
                foreach ($siblings as $sibling) {
                    // Create bidirectional sibling relationships
                    $existingRelation = UserRelationship::where('family_tree_id', $treeId)
                        ->where('user_id', $childId)
                        ->where('related_user_id', $sibling->id)
                        ->first();
                        
                    if (!$existingRelation) {
                        // Create sibling relationship in both directions
                        UserRelationship::create([
                            'family_tree_id'   => $treeId,
                            'user_id'          => $childId,
                            'related_user_id'  => $sibling->id,
                            'relationship_type'=> 'sibling',
                        ]);
                        
                        UserRelationship::create([
                            'family_tree_id'   => $treeId,
                            'user_id'          => $sibling->id,
                            'related_user_id'  => $childId,
                            'relationship_type'=> 'sibling',
                        ]);
                        
                        Log::info("Created sibling relationship", [
                            'sibling1_id' => $childId,
                            'sibling2_id' => $sibling->id
                        ]);
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error("Error creating family links", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Get a fallback user ID when there's no authenticated user
     * This will return the creator of the family tree
     */
    private function getFallbackUserId(string $treeId): ?string
    {
        try {
            $tree = FamilyTree::find($treeId);
            if ($tree && $tree->creator_id) {
                Log::info("Using fallback user ID", [
                    'tree_id' => $treeId,
                    'fallback_user_id' => $tree->creator_id
                ]);
                return $tree->creator_id;
            }
            
            // If no creator found, try to find any member of the tree
            $member = FamilyMember::where('family_tree_id', $treeId)->first();
            if ($member) {
                Log::info("Using first member as fallback", [
                    'tree_id' => $treeId,
                    'fallback_user_id' => $member->user_id
                ]);
                return $member->user_id;
            }
            
            Log::warning("No fallback user found for tree", ['tree_id' => $treeId]);
            return null;
        } catch (\Exception $e) {
            Log::error("Error finding fallback user", [
                'tree_id' => $treeId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
}
