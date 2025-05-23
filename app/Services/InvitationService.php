<?php

namespace App\Services;

use App\Models\Invitation;
use App\Models\FamilyMember;
use App\Models\FamilyTree;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class InvitationService
{
    /**
     * Send a new invitation to join a family tree.
     *
     * @throws AuthorizationException|\Exception
     */
    public function send(int $familyTreeId, string $email, string $relationshipType): Invitation
    {
        $user = Auth::user();
        $tree = FamilyTree::findOrFail($familyTreeId);

        if ($tree->creator_id !== $user->id) {
            throw new AuthorizationException("You do not own this tree.");
        }

        if ($email === $user->email) {
            throw new \Exception("You cannot invite yourself.");
        }

        // Prevent inviting existing members
        if ($existing = User::where('email', $email)->first()) {
            if (FamilyMember::where('family_tree_id', $familyTreeId)
                             ->where('user_id', $existing->id)
                             ->exists()) {
                throw new \Exception("That user is already a member.");
            }
        }

        // Prevent duplicate pending invites
        if (Invitation::where('family_tree_id', $familyTreeId)
                      ->where('email', $email)
                      ->where('status', 'pending')
                      ->exists()) {
            throw new \Exception("An invitation is already pending for that email.");
        }

        Log::info("Inviting {$email} to tree {$familyTreeId} as {$relationshipType}");

        return Invitation::create([
            'family_tree_id'   => $familyTreeId,
            'email'            => $email,
            'invited_by'       => $user->id,
            'relationship_type'=> $relationshipType,
            'status'           => 'pending',
        ]);
    }

    /**
     * Accept or decline an invitation.
     *
     * @param  Invitation  $invitation
     * @param  bool  $accept
     * @return Invitation
     * @throws \Exception
     */
    public function respond(Invitation $invitation, bool $accept): Invitation
    {
        $user = Auth::user();

        if ($invitation->email !== $user->email) {
            throw new \Exception("This invitation was not sent to you.");
        }

        if ($invitation->status !== 'pending') {
            throw new \Exception("Invitation has already been processed.");
        }

        $invitation->status = $accept ? 'accepted' : 'declined';
        if ($accept) {
            $invitation->accepted_at = now();
        }
        $invitation->save();

        if ($accept) {
            $invitation->familyTree->members()
                ->attach($user->id, ['role' => 'member']);
        }

        return $invitation;
    }
}
