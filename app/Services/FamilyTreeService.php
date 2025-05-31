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

        // Determine root user: perspective user if member, else creator
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
            'gender'     => $user->gender?->name,
            'dateOfBirth'=> optional($user->date_of_birth)->toDateString(),
            'dateOfDeath'=> optional($user->date_of_death)->toDateString(), 
            'isDeceased' => (bool)$user->is_deceased,
            'email'      => $user->email,
            'attributes' => [
                'birth_date'=> optional($user->date_of_birth)->toDateString(),
                'death_date'=> optional($user->date_of_death)->toDateString(),
                'gender'    => $user->gender?->name,
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

        // Process spouses as partners with shared children
        $spouses = $user->spousesInTree($treeId);
        if ($spouses instanceof Collection && $spouses->count() > 0) {
            Log::info("Found spouses for user", [
                'user_id' => $user->id,
                'count' => $spouses->count(),
                'ids' => $spouses->pluck('id')->toArray()
            ]);
            
            $node['partners'] = [];
            foreach ($spouses as $spouse) {
                $partnerNode = $this->mapNodeRecursive($spouse, $treeId, $seen);
                
                // Get shared children for this marriage/partnership
                $sharedChildren = $this->getSharedChildren($user->id, $spouse->id, $treeId, $seen);
                $partnerNode['children'] = $sharedChildren;
                
                $node['partners'][] = $partnerNode;
            }
        } else {
            Log::info("No spouses found for user", [
                'user_id' => $user->id,
                'tree_id' => $treeId
            ]);
        }
        
        // Only include children that are NOT shared with any spouse in the main children array
        $allChildren = $user->childrenInTree($treeId);
        if ($allChildren instanceof Collection && $allChildren->count() > 0) {
            Log::info("Found children for user", [
                'user_id' => $user->id,
                'count' => $allChildren->count(),
                'ids' => $allChildren->pluck('id')->toArray()
            ]);
            
            $unsharedChildren = [];
            foreach ($allChildren as $child) {
                // Check if this child is shared with any spouse
                $isSharedChild = false;
                if (isset($node['partners'])) {
                    foreach ($node['partners'] as $partner) {
                        if (isset($partner['children'])) {
                            foreach ($partner['children'] as $sharedChild) {
                                if ($sharedChild['id'] === $child->id) {
                                    $isSharedChild = true;
                                    break 2;
                                }
                            }
                        }
                    }
                }
                
                // Only add to main children array if not shared with a spouse
                if (!$isSharedChild) {
                    $unsharedChildren[] = $this->mapNodeRecursive($child, $treeId, $seen);
                }
            }
            $node['children'] = $unsharedChildren;
        } else {
            Log::info("No children found for user", [
                'user_id' => $user->id,
                'tree_id' => $treeId
            ]);
            $node['children'] = [];
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
            
            // Extract additional relationship context for enhanced spouse/marriage tracking
            $spouseId = $m['spouseId'] ?? null; // For when adding a child, specify which spouse is the other parent
            $marriageDate = $m['marriageDate'] ?? null; // For spouse relationships
            $divorceDate = $m['divorceDate'] ?? null; // For divorced spouses
            $isCurrent = $m['isCurrent'] ?? true; // Whether this relationship is current
            
            // Log the inputs for debugging
            Log::info("Adding direct member", [
                'tree_id' => $treeId,
                'relationship' => $relationshipType,
                'email' => $m['email'] ?? null,
                'spouse_id' => $spouseId,
                'marriage_date' => $marriageDate,
                'is_current' => $isCurrent,
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

            /** Enhanced relationship creation with marriage tracking **/
            Log::info("Attempting to create relationship", [
                'relationship_type_input' => $relationshipType,
                'relationship_type_class' => gettype($relationshipType),
            ]);
            
            $rel = RelationshipType::tryFrom($relationshipType);
            Log::info("Relationship enum result", [
                'enum_result' => $rel ? $rel->value : 'null',
                'input_value' => $relationshipType
            ]);
            
            if ($rel) {
                // Only create relationships if the current user is authenticated and not the same as the target user
                if ($me && $me->id !== $u->id) {
                    
                    // Special handling for spouse relationships - create Marriage record
                    $marriageId = null;
                    if ($relationshipType === 'spouse') {
                        $marriageId = $this->createOrUpdateMarriage($treeId, $me->id, $u->id, [
                            'marriage_date' => $marriageDate,
                            'divorce_date' => $divorceDate,
                            'is_current' => $isCurrent,
                        ]);
                        Log::info("Created/updated marriage", ['marriage_id' => $marriageId]);
                    }
                    
                    // For children, link to specific marriage if spouseId is provided
                    $otherParentId = null;
                    if ($relationshipType === 'child' && $spouseId) {
                        // Find the marriage between me and the specified spouse
                        $marriage = \App\Models\Marriage::where('family_tree_id', $treeId)
                            ->where(function($q) use ($me, $spouseId) {
                                $q->where(function($sub) use ($me, $spouseId) {
                                    $sub->where('spouse1_id', $me->id)
                                       ->where('spouse2_id', $spouseId);
                                })->orWhere(function($sub) use ($me, $spouseId) {
                                    $sub->where('spouse1_id', $spouseId)
                                       ->where('spouse2_id', $me->id);
                                });
                            })
                            ->first();
                            
                        if ($marriage) {
                            $marriageId = $marriage->id;
                            $otherParentId = $spouseId;
                            Log::info("Linking child to marriage", [
                                'marriage_id' => $marriageId,
                                'other_parent_id' => $otherParentId
                            ]);
                        }
                    }
                    
                    // Determine the correct relationship types based on WHO we're adding
                    // The key insight: when adding a "child", we're creating a parent->child relationship
                    // But when adding a "parent", we need to create a child->parent relationship
                    
                    if ($relationshipType === 'child') {
                        // I am adding my child: I am the parent, they are the child
                        // Store: parent_id -> CHILD -> child_id
                        $primaryType = RelationshipType::CHILD->value;
                        $reciprocalType = RelationshipType::PARENT->value;
                    } elseif ($relationshipType === 'parent') {
                        // I am adding my parent: I am the child, they are the parent
                        // Store: child_id -> FATHER/MOTHER -> parent_id
                        // Need to determine if this parent is father or mother based on their gender
                        $parentGender = $u->gender?->name;
                        if ($parentGender === 'Male') {
                            $primaryType = RelationshipType::FATHER->value;
                        } elseif ($parentGender === 'Female') {
                            $primaryType = RelationshipType::MOTHER->value;
                        } else {
                            $primaryType = RelationshipType::PARENT->value; // Fallback
                        }
                        $reciprocalType = RelationshipType::CHILD->value;
                    } else {
                        // For other relationships (spouse, sibling, etc.)
                        $primaryType = $rel->value;
                        $reciprocalType = $rel->getReciprocal()->value;
                    }
                    
                    // Create primary relationship with correct direction
                    if ($relationshipType === 'child') {
                        // Adding a child: store parent->child relationship
                        $existingRel1 = UserRelationship::where('family_tree_id', $treeId)
                            ->where('user_id', $me->id)
                            ->where('related_user_id', $u->id)
                            ->first();
                            
                        if (!$existingRel1) {
                            UserRelationship::create([
                                'family_tree_id'   => (string)$treeId,
                                'user_id'          => (string)$me->id,
                                'related_user_id'  => (string)$u->id,
                                'relationship_type'=> $primaryType,
                                'marriage_id'      => $marriageId,
                                'other_parent_id'  => $otherParentId,
                                'relationship_start_date' => $marriageDate,
                                'relationship_end_date' => $divorceDate,
                                'is_current'       => $isCurrent,
                            ]);
                            Log::info("Created parent->child relationship", [
                                'parent_id' => $me->id,
                                'child_id' => $u->id,
                                'type' => $primaryType,
                            ]);
                        }
                        
                        // Create reciprocal child->parent relationship for InTree methods
                        $existingRel2 = UserRelationship::where('family_tree_id', $treeId)
                            ->where('user_id', $u->id)
                            ->where('related_user_id', $me->id)
                            ->first();
                            
                        if (!$existingRel2) {
                            // Determine if I am father or mother based on my gender
                            $myGender = $me->gender?->name;
                            $childToParentType = ($myGender === 'Male') ? RelationshipType::FATHER->value : 
                                               (($myGender === 'Female') ? RelationshipType::MOTHER->value : RelationshipType::PARENT->value);
                            
                            UserRelationship::create([
                                'family_tree_id'   => (string)$treeId,
                                'user_id'          => (string)$u->id,
                                'related_user_id'  => (string)$me->id,
                                'relationship_type'=> $childToParentType,
                                'marriage_id'      => $marriageId,
                                'other_parent_id'  => $otherParentId,
                                'relationship_start_date' => $marriageDate,
                                'relationship_end_date' => $divorceDate,
                                'is_current'       => $isCurrent,
                            ]);
                            Log::info("Created child->parent relationship", [
                                'child_id' => $u->id,
                                'parent_id' => $me->id,
                                'type' => $childToParentType,
                            ]);
                        }
                    } elseif ($relationshipType === 'parent') {
                        // Adding a parent: store child->parent relationship
                        $existingRel1 = UserRelationship::where('family_tree_id', $treeId)
                            ->where('user_id', $me->id)
                            ->where('related_user_id', $u->id)
                            ->first();
                            
                        if (!$existingRel1) {
                            UserRelationship::create([
                                'family_tree_id'   => (string)$treeId,
                                'user_id'          => (string)$me->id,
                                'related_user_id'  => (string)$u->id,
                                'relationship_type'=> $primaryType,
                                'marriage_id'      => $marriageId,
                                'other_parent_id'  => $otherParentId,
                                'relationship_start_date' => $marriageDate,
                                'relationship_end_date' => $divorceDate,
                                'is_current'       => $isCurrent,                            ]);
                            Log::info("Created child->parent relationship", [
                                'child_id' => $me->id,
                                'parent_id' => $u->id,
                                'type' => $primaryType,
                            ]);
                        }
                        
                        // Create reciprocal parent->child relationship
                        $existingRel2 = UserRelationship::where('family_tree_id', $treeId)
                            ->where('user_id', $u->id)
                            ->where('related_user_id', $me->id)
                            ->first();
                            
                        if (!$existingRel2) {
                            UserRelationship::create([
                                'family_tree_id'   => (string)$treeId,
                                'user_id'          => (string)$u->id,
                                'related_user_id'  => (string)$me->id,
                                'relationship_type'=> $reciprocalType,
                                'marriage_id'      => $marriageId,
                                'other_parent_id'  => $otherParentId,
                                'relationship_start_date' => $marriageDate,
                                'relationship_end_date' => $divorceDate,
                                'is_current'       => $isCurrent,
                            ]);
                            Log::info("Created parent->child relationship", [
                                'parent_id' => $u->id,
                                'child_id' => $me->id,
                                'type' => $reciprocalType,
                            ]);
                        }
                    } else {
                        // For other relationships (spouse, sibling, etc.)
                        $primaryType = $rel->value;
                        $reciprocalType = $rel->getReciprocal()->value;
                        
                        // Create primary relationship with correct direction
                        $existingRel1 = UserRelationship::where('family_tree_id', $treeId)
                            ->where('user_id', $me->id)
                            ->where('related_user_id', $u->id)
                            ->first();
                            
                        if (!$existingRel1) {
                            UserRelationship::create([
                                'family_tree_id'   => (string)$treeId,
                                'user_id'          => (string)$me->id,
                                'related_user_id'  => (string)$u->id,
                                'relationship_type'=> $primaryType,
                                'marriage_id'      => $marriageId,
                                'other_parent_id'  => $otherParentId,
                                'relationship_start_date' => $marriageDate,
                                'relationship_end_date' => $divorceDate,
                                'is_current'       => $isCurrent,
                            ]);
                            Log::info("Created primary relationship", [
                                'user_id' => $me->id,
                                'related_user_id' => $u->id,
                                'type' => $primaryType,
                                'marriage_id' => $marriageId,
                                'other_parent_id' => $otherParentId,
                            ]);
                        }
                        
                        // Create reciprocal relationship (other to me) if it doesn't exist
                        $existingRel2 = UserRelationship::where('family_tree_id', $treeId)
                            ->where('user_id', $u->id)
                            ->where('related_user_id', $me->id)
                            ->first();
                            
                        if (!$existingRel2) {
                            try {
                                // For reciprocal relationships, swap the marriage context appropriately
                                $reciprocalMarriageId = $marriageId;
                                $reciprocalOtherParentId = null;
                                
                                // If this was a child relationship with other parent specified,
                                // the reciprocal (parent relationship) should reference the current user as other parent
                                if ($relationshipType === 'child' && $otherParentId) {
                                    $reciprocalOtherParentId = $me->id;
                                }
                                
                                UserRelationship::create([
                                    'family_tree_id'   => (string)$treeId,
                                    'user_id'          => (string)$u->id,
                                    'related_user_id'  => (string)$me->id,
                                    'relationship_type'=> $reciprocalType,
                                    'marriage_id'      => $reciprocalMarriageId,
                                    'other_parent_id'  => $reciprocalOtherParentId,
                                    'relationship_start_date' => $marriageDate,
                                    'relationship_end_date' => $divorceDate,
                                    'is_current'       => $isCurrent,
                                ]);
                                Log::info("Created reciprocal relationship", [
                                    'user_id' => $u->id,
                                    'related_user_id' => $me->id,
                                    'type' => $reciprocalType,
                                    'marriage_id' => $reciprocalMarriageId,
                                    'other_parent_id' => $reciprocalOtherParentId,
                                ]);
                            } catch (\Exception $e) {
                                Log::error("Failed to create reciprocal relationship", [
                                    'error' => $e->getMessage(),
                                    'user_id' => $u->id,
                                    'related_user_id' => $me->id,
                                ]);
                            }
                        }
                    }
                    
                    // Special handling for specific relationships to ensure all family connections
                    if (in_array($rel->value, ['child', 'father', 'mother', 'parent'])) {
                        $this->ensureFamilyLinks($treeId, $me->id, $u->id, $rel->value);
                    }
                } else {
                    Log::info("Skipping relationship creation - no authenticated user or same user");
                }
            } else {
                Log::warning("Failed to create RelationshipType from input", [
                    'input' => $relationshipType,
                    'type' => gettype($relationshipType)
                ]);
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
                'gender' => $u->gender?->name ?? null,
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
                // Extract enhanced relationship data
                $spouseId = $m['spouseId'] ?? null;
                $marriageDate = $m['marriageDate'] ?? null;
                $divorceDate = $m['divorceDate'] ?? null;
                $isCurrent = $m['isCurrent'] ?? true;
                
                // Handle spouse relationship updates - create/update marriage
                $marriageId = null;
                if ($m['relationshipToUser'] === 'spouse') {
                    $marriageId = $this->createOrUpdateMarriage($treeId, $me->id, $u->id, [
                        'marriage_date' => $marriageDate,
                        'divorce_date' => $divorceDate,
                        'is_current' => $isCurrent,
                    ]);
                    Log::info("Updated marriage during member update", ['marriage_id' => $marriageId]);
                }
                
                // For children, handle marriage linkage if spouse specified
                $otherParentId = null;
                if ($m['relationshipToUser'] === 'child' && $spouseId) {
                    // Find the marriage between me and the specified spouse
                    $marriage = \App\Models\Marriage::where('family_tree_id', $treeId)
                        ->where(function($q) use ($me, $spouseId) {
                            $q->where(function($sub) use ($me, $spouseId) {
                                $sub->where('spouse1_id', $me->id)
                                   ->where('spouse2_id', $spouseId);
                            })->orWhere(function($sub) use ($me, $spouseId) {
                                $sub->where('spouse1_id', $spouseId)
                                   ->where('spouse2_id', $me->id);
                            });
                        })
                        ->first();
                        
                    if ($marriage) {
                        $marriageId = $marriage->id;
                        $otherParentId = $spouseId;
                        Log::info("Updated child-marriage linkage", [
                            'marriage_id' => $marriageId,
                            'other_parent_id' => $otherParentId
                        ]);
                    }
                }
                
                // Determine the correct relationship types based on WHO we're updating
                // Apply the same fixed direction logic as in addDirectMember
                
                if ($m['relationshipToUser'] === 'child') {
                    // I am updating my child: I am the parent, they are the child
                    // Store: parent_id -> CHILD -> child_id
                    $primaryType = RelationshipType::CHILD->value;
                    $reciprocalType = RelationshipType::PARENT->value;
                } elseif ($m['relationshipToUser'] === 'parent') {
                    // I am updating my parent: I am the child, they are the parent
                    // Store: child_id -> FATHER/MOTHER -> parent_id
                    // Need to determine if this parent is father or mother based on their gender
                    $parentGender = $u->gender?->name;
                    if ($parentGender === 'Male') {
                        $primaryType = RelationshipType::FATHER->value;
                    } elseif ($parentGender === 'Female') {
                        $primaryType = RelationshipType::MOTHER->value;
                    } else {
                        $primaryType = RelationshipType::PARENT->value; // Fallback
                    }
                    $reciprocalType = RelationshipType::CHILD->value;
                } else {
                    // For other relationships (spouse, sibling, etc.)
                    $primaryType = $rel->value;
                    $reciprocalType = $rel->getReciprocal()->value;
                }
                
                // Create or update relationships with correct direction
                if ($m['relationshipToUser'] === 'child') {
                    // Updating a child: store parent->child relationship
                    UserRelationship::updateOrCreate(
                        [
                            'family_tree_id' => (string)$treeId,
                            'user_id' => (string)$me->id,
                            'related_user_id' => (string)$u->id
                        ],
                        [
                            'relationship_type' => $primaryType,
                            'marriage_id' => $marriageId,
                            'other_parent_id' => $otherParentId,
                            'relationship_start_date' => $marriageDate,
                            'relationship_end_date' => $divorceDate,
                            'is_current' => $isCurrent,
                        ]
                    );
                    
                    // Create/update reciprocal child->parent relationship for InTree methods
                    $myGender = $me->gender?->name;
                    $childToParentType = ($myGender === 'Male') ? RelationshipType::FATHER->value : 
                                       (($myGender === 'Female') ? RelationshipType::MOTHER->value : RelationshipType::PARENT->value);
                    
                    UserRelationship::updateOrCreate(
                        [
                            'family_tree_id' => (string)$treeId,
                            'user_id' => (string)$u->id,
                            'related_user_id' => (string)$me->id
                        ],
                        [
                            'relationship_type' => $childToParentType,
                            'marriage_id' => $marriageId,
                            'other_parent_id' => $otherParentId,
                            'relationship_start_date' => $marriageDate,
                            'relationship_end_date' => $divorceDate,
                            'is_current' => $isCurrent,
                        ]
                    );
                    
                    Log::info("Updated parent->child and child->parent relationships", [
                        'parent_id' => $me->id,
                        'child_id' => $u->id,
                        'parent_to_child_type' => $primaryType,
                        'child_to_parent_type' => $childToParentType,
                    ]);
                } elseif ($m['relationshipToUser'] === 'parent') {
                    // Updating a parent: store child->parent relationship
                    UserRelationship::updateOrCreate(
                        [
                            'family_tree_id' => (string)$treeId,
                            'user_id' => (string)$me->id,
                            'related_user_id' => (string)$u->id
                        ],
                        [
                            'relationship_type' => $primaryType,
                            'marriage_id' => $marriageId,
                            'other_parent_id' => $otherParentId,
                            'relationship_start_date' => $marriageDate,
                            'relationship_end_date' => $divorceDate,
                            'is_current' => $isCurrent,
                        ]
                    );
                    
                    // Create/update reciprocal parent->child relationship
                    UserRelationship::updateOrCreate(
                        [
                            'family_tree_id' => (string)$treeId,
                            'user_id' => (string)$u->id,
                            'related_user_id' => (string)$me->id
                        ],
                        [
                            'relationship_type' => $reciprocalType,
                            'marriage_id' => $marriageId,
                            'other_parent_id' => $otherParentId,
                            'relationship_start_date' => $marriageDate,
                            'relationship_end_date' => $divorceDate,
                            'is_current' => $isCurrent,
                        ]
                    );
                    
                    Log::info("Updated child->parent and parent->child relationships", [
                        'child_id' => $me->id,
                        'parent_id' => $u->id,
                        'child_to_parent_type' => $primaryType,
                        'parent_to_child_type' => $reciprocalType,
                    ]);
                } else {
                    // For other relationships (spouse, sibling, etc.) - use original logic
                    UserRelationship::updateOrCreate(
                        [
                            'family_tree_id' => (string)$treeId,
                            'user_id' => (string)$me->id,
                            'related_user_id' => (string)$u->id
                        ],
                        [
                            'relationship_type' => $primaryType,
                            'marriage_id' => $marriageId,
                            'other_parent_id' => $otherParentId,
                            'relationship_start_date' => $marriageDate,
                            'relationship_end_date' => $divorceDate,
                            'is_current' => $isCurrent,
                        ]
                    );
                    
                    Log::info("Updated primary relationship", [
                        'user_id' => $me->id,
                        'related_user_id' => $u->id,
                        'relationship_type' => $primaryType,
                        'marriage_id' => $marriageId,
                        'other_parent_id' => $otherParentId,
                    ]);
                    
                    // Create or update the reciprocal relationship (member to me) with enhanced data
                    $reciprocalMarriageId = $marriageId;
                    $reciprocalOtherParentId = null;
                    
                    // If this was a child relationship with other parent specified,
                    // the reciprocal (parent relationship) should reference the current user as other parent
                    if ($m['relationshipToUser'] === 'child' && $otherParentId) {
                        $reciprocalOtherParentId = $me->id;
                    }
                    
                    UserRelationship::updateOrCreate(
                        [
                            'family_tree_id' => (string)$treeId,
                            'user_id' => (string)$u->id,
                            'related_user_id' => (string)$me->id
                        ],
                        [
                            'relationship_type' => $reciprocalType,
                            'marriage_id' => $reciprocalMarriageId,
                            'other_parent_id' => $reciprocalOtherParentId,
                            'relationship_start_date' => $marriageDate,
                            'relationship_end_date' => $divorceDate,
                            'is_current' => $isCurrent,
                        ]
                    );
                    
                    Log::info("Updated reciprocal relationship", [
                        'user_id' => $u->id,
                        'related_user_id' => $me->id,
                        'relationship_type' => $reciprocalType,
                        'marriage_id' => $reciprocalMarriageId,
                        'other_parent_id' => $reciprocalOtherParentId,
                    ]);
                    
                    // Ensure family links are updated for parent-child relationships
                    if (in_array($rel->value, ['child', 'father', 'mother', 'parent'])) {
                        $this->ensureFamilyLinks($treeId, $me->id, $u->id, $rel->value);
                    }
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
            'gender' => $u->gender?->name ?? null,
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
                'gender' => $fm->user->gender?->name ?? null,
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
                            if ($spouse->gender->name === 'Male') {
                                $parentType = 'father';
                            } else if ($spouse->gender->name === 'Female') {
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

    /**
     * Create or update a marriage record between two users
     */
    protected function createOrUpdateMarriage(string $treeId, string $spouse1Id, string $spouse2Id, array $marriageData = []): string
    {
        Log::info("Creating or updating marriage", [
            'tree_id' => $treeId,
            'spouse1_id' => $spouse1Id,
            'spouse2_id' => $spouse2Id,
            'marriage_data' => $marriageData
        ]);
        
        // Check if marriage already exists between these two users
        $existingMarriage = \App\Models\Marriage::where('family_tree_id', $treeId)
            ->where(function($q) use ($spouse1Id, $spouse2Id) {
                $q->where(function($sub) use ($spouse1Id, $spouse2Id) {
                    $sub->where('spouse1_id', $spouse1Id)
                       ->where('spouse2_id', $spouse2Id);
                })->orWhere(function($sub) use ($spouse1Id, $spouse2Id) {
                    $sub->where('spouse1_id', $spouse2Id)
                       ->where('spouse2_id', $spouse1Id);
                });
            })
            ->first();
            
        if ($existingMarriage) {
            // Update existing marriage if new data provided
            if (!empty($marriageData)) {
                $updateData = array_filter([
                    'marriage_date' => $marriageData['marriage_date'] ?? null,
                    'divorce_date' => $marriageData['divorce_date'] ?? null,
                    'is_current' => $marriageData['is_current'] ?? true,
                ]);
                
                if (!empty($updateData)) {
                    $existingMarriage->update($updateData);
                    Log::info("Updated existing marriage", ['marriage_id' => $existingMarriage->id]);
                }
            }
            
            return $existingMarriage->id;
        }
        
        // Create new marriage record
        $marriage = \App\Models\Marriage::create([
            'family_tree_id' => $treeId,
            'spouse1_id' => $spouse1Id,
            'spouse2_id' => $spouse2Id,
            'marriage_date' => $marriageData['marriage_date'] ?? null,
            'divorce_date' => $marriageData['divorce_date'] ?? null,
            'is_current' => $marriageData['is_current'] ?? true,
            'marriage_type' => 'marriage', // Could be extended for different types
        ]);
        
        Log::info("Created new marriage", ['marriage_id' => $marriage->id]);
        return $marriage->id;
    }
    
    /**
     * Get shared children between two partners in a family tree
     */
    protected function getSharedChildren(string $parent1Id, string $parent2Id, string $treeId, array &$seen): array
    {
        // Find children where parent1 has a child relationship and other_parent_id points to parent2
        $sharedChildRelationships = UserRelationship::where('family_tree_id', $treeId)
            ->where('user_id', $parent1Id)
            ->where('relationship_type', 'child')
            ->where('other_parent_id', $parent2Id)
            ->get();
        
        // Also check the reverse (parent2 -> child with other_parent_id = parent1)
        $reverseSharedChildRelationships = UserRelationship::where('family_tree_id', $treeId)
            ->where('user_id', $parent2Id)
            ->where('relationship_type', 'child')
            ->where('other_parent_id', $parent1Id)
            ->get();
        
        // Combine and get unique child IDs
        $allSharedRelationships = $sharedChildRelationships->merge($reverseSharedChildRelationships);
        $sharedChildrenIds = $allSharedRelationships->pluck('related_user_id')->unique();
        
        $sharedChildren = [];
        foreach ($sharedChildrenIds as $childId) {
            $child = User::find($childId);
            if ($child) {
                $sharedChildren[] = $this->mapNodeRecursive($child, $treeId, $seen);
            }
        }
        
        Log::info("Found shared children using other_parent_id", [
            'parent1_id' => $parent1Id,
            'parent2_id' => $parent2Id,
            'shared_count' => count($sharedChildren),
            'shared_ids' => $sharedChildrenIds->toArray(),
            'method' => 'other_parent_id lookup'
        ]);
        
        return $sharedChildren;
    }

    /**
     * Find the oldest generation user(s) in the family tree to use as root.
     * Looks for users who have no upward relationships (parents, grandparents).
     */
    protected function findOldestGenerationRoot(string $familyTreeId): ?User
    {
        // Get all family members in this tree
        $familyMembers = FamilyMember::where('family_tree_id', $familyTreeId)
            ->pluck('user_id')
            ->toArray();
        
        if (empty($familyMembers)) {
            return null;
        }
        
        // Define relationship types that indicate someone is below another generation
        $childRelationshipTypes = [
            RelationshipType::CHILD,
            RelationshipType::GRANDCHILD,
            RelationshipType::STEP_CHILD,
            RelationshipType::ADOPTIVE_CHILD,
            RelationshipType::FOSTER_CHILD,
        ];
        
        // Find users who have upward relationships (are children/grandchildren of someone)
        $usersWithParents = UserRelationship::whereIn('user_id', $familyMembers)
            ->whereIn('relationship_type', $childRelationshipTypes)
            ->pluck('user_id')
            ->unique()
            ->toArray();
        
        // The oldest generation are those who are NOT children of anyone
        $oldestGeneration = array_diff($familyMembers, $usersWithParents);
        
        if (empty($oldestGeneration)) {
            return null;
        }
        
        // Return the first user from the oldest generation
        // In the future, we could add logic to pick the most connected one
        return User::find(reset($oldestGeneration));
    }
    
    /**
     * Return a list of "view-as" options for this tree:
     * – always the creator
     * – yourself (if you're in the tree)
     * – any direct parents (father/mother)
     */
    public function getPotentialRoots(string $familyTreeId, ?string $currentUserId): array
    {
        $tree = FamilyTree::findOrFail($familyTreeId);

        $options = [];

        // 1) Creator (always)
        $creator = $tree->creator;
        $options[] = [
            'value' => $creator->id,
            'label' => "Creator: {$creator->first_name} {$creator->last_name}",
            'type'  => 'creator'
        ];

        // 2) Self (if you're a member)
        if ($currentUserId && \App\Models\FamilyMember::where('family_tree_id', $familyTreeId)
                                         ->where('user_id', $currentUserId)
                                         ->exists()) {
            $you = User::find($currentUserId);
            $options[] = [
                'value' => $you->id,
                'label' => "Self: {$you->first_name} {$you->last_name}",
                'type'  => 'self'
            ];
        }

        // 3) Direct parents - get ALL parents, not just first father/mother
        if ($currentUserId) {
            $parentRelationships = UserRelationship::where('family_tree_id', $familyTreeId)
                ->where('user_id', $currentUserId)
                ->whereIn('relationship_type', [RelationshipType::FATHER, RelationshipType::MOTHER])
                ->with('relatedUser')
                ->get();

            foreach ($parentRelationships as $rel) {
                $parent = $rel->relatedUser;
                $relationshipType = $rel->relationship_type->value;
                $options[] = [
                    'value' => $parent->id,
                    'label' => ucfirst($relationshipType) . ": {$parent->first_name} {$parent->last_name}",
                    'type'  => $relationshipType
                ];
            }
        }

        return $options;
    }
}
