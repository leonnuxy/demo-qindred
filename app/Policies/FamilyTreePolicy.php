<?php

namespace App\Policies;

use App\Models\FamilyTree;
use App\Models\User;

class FamilyTreePolicy
{
    /**
     * Anyone who owns or is a member of at least one tree can see the list.
     */
    public function viewAny(User $user): bool
    {
        return $user->familyTrees()->exists()
            || $user->createdFamilyTrees()->exists();
    }

    /**
     * A user may view a specific tree if they created it or are a member.
     */
    public function view(User $user, FamilyTree $familyTree): bool
    {
        return $familyTree->creator_id === $user->id
            || $familyTree->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Any authenticated user may create a new tree.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Only the creator of the tree may update its details.
     */
    public function update(User $user, FamilyTree $familyTree): bool
    {
        return $familyTree->creator_id === $user->id;
    }

    /**
     * Only the creator of the tree may delete it.
     */
    public function delete(User $user, FamilyTree $familyTree): bool
    {
        return $familyTree->creator_id === $user->id;
    }

    // If you need restore / forceDelete, you can mirror delete()
    public function restore(User $user, FamilyTree $familyTree): bool
    {
        return $this->delete($user, $familyTree);
    }

    public function forceDelete(User $user, FamilyTree $familyTree): bool
    {
        return $this->delete($user, $familyTree);
    }
}
