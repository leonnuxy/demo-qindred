<?php

// path: qindred/app/Http/Controllers/InvitationController.php
namespace App\Http\Controllers;

use App\Http\Requests\SendInvitationRequest;
use App\Models\Invitation;
use App\Models\FamilyTree;
use App\Models\FamilyMember;
use App\Models\UserRelationship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class InvitationController extends Controller
{
    /**
     * Display a listing of invitations.
     */
    public function index()
    {
        $user = Auth::user();
        
        // Get invitations received by the user
        $invitations = Invitation::where('email', $user->email)
            ->with(['familyTree', 'inviter'])
            ->get();
        
        // Get pending invitations sent by the user
        $outgoingInvitations = Invitation::where('invited_by', $user->id)
            ->where('status', 'pending')
            ->with('familyTree')
            ->get();
        
        // Get family trees created by the user
        $familyTrees = $user->createdFamilyTrees()->get(['id', 'name']);
        
        // Define available relationship types
        $relationshipTypes = [
            ['value' => 'parent', 'label' => 'Parent'],
            ['value' => 'child', 'label' => 'Child'],
            ['value' => 'spouse', 'label' => 'Spouse'],
            ['value' => 'sibling', 'label' => 'Sibling'],
            ['value' => 'grandparent', 'label' => 'Grandparent'],
            ['value' => 'grandchild', 'label' => 'Grandchild'],
            ['value' => 'cousin', 'label' => 'Cousin'],
            ['value' => 'aunt-uncle', 'label' => 'Aunt/Uncle'],
            ['value' => 'niece-nephew', 'label' => 'Niece/Nephew'],
            ['value' => 'other', 'label' => 'Other'],
        ];
        
        return Inertia::render('User/InvitationsPage', [
            'invitations' => $invitations,
            'outgoingInvitations' => $outgoingInvitations,
            'familyTrees' => $familyTrees,
            'relationshipTypes' => $relationshipTypes,
        ]);
    }

    /**
     * Send a new invitation.
     */
    public function send(SendInvitationRequest $request, FamilyTree $familyTree)
    {
        // Check if user owns this family tree
        if ($familyTree->creator_id !== Auth::id()) {
            return back()->with('error', 'You can only send invitations for family trees you own.');
        }
        
        $validated = $request->validated();
        
        // Check if the user is trying to invite themselves
        if ($validated['email'] === Auth::user()->email) {
            return back()->with('error', 'You cannot invite yourself to your own family tree.');
        }
        
        // Check if the person is already a member by email
        $existingUser = User::where('email', $validated['email'])->first();
        
        if ($existingUser) {
            $isMember = FamilyMember::where('family_tree_id', $familyTree->id)
                ->where('user_id', $existingUser->id)
                ->exists();
                
            if ($isMember) {
                return back()->with('error', 'This person is already a member of this family tree.');
            }
        }
        
        // Check for existing pending invitations
        $existingInvitation = Invitation::where('family_tree_id', $familyTree->id)
            ->where('email', $validated['email'])
            ->where('status', 'pending')
            ->first();
            
        if ($existingInvitation) {
            return back()->with('error', 'An invitation has already been sent to this email address.');
        }
        
        // Create invitation
        $invitation = new Invitation();
        $invitation->fill([
            'family_tree_id' => $familyTree->id,
            'email' => $validated['email'],
            'invited_by' => Auth::id(),
            'relationship_type' => $validated['relationship_type'],
            'status' => 'pending',
        ]);
        $invitation->save();
        
        // TODO: Send email notification (create FamilyTreeInvitation notification)
        // Notification::route('mail', $invitation->email)
        //    ->notify(new FamilyTreeInvitation($invitation));
        
        return back()->with('success', 'Invitation sent successfully.');
    }

    /**
     * Accept an invitation.
     */
    public function accept(Invitation $invitation)
    {
        // Check if invitation is for the authenticated user
        if ($invitation->email !== Auth::user()->email) {
            return back()->with('error', 'This invitation was not sent to you.');
        }
        
        // Check if invitation is pending
        if ($invitation->status !== 'pending') {
            return back()->with('error', 'This invitation has already been processed.');
        }
        
        // Update invitation status
        $invitation->status = 'accepted';
        $invitation->accepted_at = now();
        $invitation->save();
        
        // Add user to family tree
        $familyTree = $invitation->familyTree;
        
        // Create a new FamilyMember record
        FamilyMember::create([
            'family_tree_id' => $familyTree->id,
            'user_id' => Auth::id(),
            'role' => 'member', // Default role
        ]);
        
        // Store the relationship type in UserRelationship table
        if ($invitation->relationship_type && $invitation->inviter) {
            UserRelationship::create([
                'user_id' => Auth::id(),
                'related_user_id' => $invitation->invited_by,
                'relationship_type' => $invitation->relationship_type
            ]);
        }
        
        return back()->with('success', 'You have joined the family tree.');
    }

    /**
     * Decline an invitation.
     */
    public function decline(Invitation $invitation)
    {
        // Check if invitation is for the authenticated user
        if ($invitation->email !== Auth::user()->email) {
            return back()->with('error', 'This invitation was not sent to you.');
        }
        
        // Check if invitation is pending
        if ($invitation->status !== 'pending') {
            return back()->with('error', 'This invitation has already been processed.');
        }
        
        // Update invitation status
        $invitation->status = 'declined';
        $invitation->save();
        
        return back()->with('success', 'Invitation declined.');
    }

    /**
     * Resend an invitation.
     */
    public function resend(Invitation $invitation)
    {
        // Check if user is the sender
        if ($invitation->invited_by !== Auth::id()) {
            return back()->with('error', 'You can only resend invitations you have sent.');
        }
        
        // Check if invitation is pending
        if ($invitation->status !== 'pending') {
            return back()->with('error', 'Only pending invitations can be resent.');
        }
        
        // TODO: Send email notification
        // Notification::route('mail', $invitation->email)
        //    ->notify(new FamilyTreeInvitation($invitation));
        
        // Update timestamp
        $invitation->touch();
        
        return back()->with('success', 'Invitation resent successfully.');
    }

    /**
     * Cancel an invitation.
     */
    public function cancel(Invitation $invitation)
    {
        // Check if user is the sender
        if ($invitation->invited_by !== Auth::id()) {
            return back()->with('error', 'You can only cancel invitations you have sent.');
        }
        
        // Check if invitation is pending
        if ($invitation->status !== 'pending') {
            return back()->with('error', 'Only pending invitations can be cancelled.');
        }
        
        // Delete the invitation
        $invitation->delete();
        
        return back()->with('success', 'Invitation cancelled successfully.');
    }
}
