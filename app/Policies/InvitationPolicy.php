<?php

namespace App\Policies;

use App\Models\Invitation;
use App\Models\User;

class InvitationPolicy
{
    /**
     * A user may view an invitation if they are the invitee (email)
     * or they sent it.
     */
    public function view(User $user, Invitation $invitation): bool
    {
        return $user->email === $invitation->email
            || $user->id    === $invitation->invited_by;
    }

    /**
     * You don’t typically "create" an invitation model directly;
     * you invite on a tree you own. For simplicity:
     */
    public function create(User $user): bool
    {
        return $user !== null;
    }

    /**
     * Accepting/declining is an “update” on the invitation,
     * only the email recipient may do that.
     */
    public function update(User $user, Invitation $invitation): bool
    {
        return $user->email === $invitation->email;
    }

    /**
     * Resend/cancel (delete) is only for the sender.
     */
    public function delete(User $user, Invitation $invitation): bool
    {
        return $user->id === $invitation->invited_by;
    }

    // Optional:
    public function restore(User $user, Invitation $invitation): bool
    {
        return $this->delete($user, $invitation);
    }

    public function forceDelete(User $user, Invitation $invitation): bool
    {
        return $this->delete($user, $invitation);
    }
}
