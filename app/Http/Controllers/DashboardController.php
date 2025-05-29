<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\FamilyMember;
use App\Models\Invitation;
use App\Models\UserRelationship;
use App\Models\FamilyTreeLog;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Force redirect incomplete users
        if (!$user->setup_completed) {
            return redirect()->route('setup.index');
        }

        // Get user's family trees and related statistics
        $familyTrees = $user->familyTrees()->with(['members', 'invitations'])->get();
        
        // Calculate statistics
        $totalFamilyMembers = $familyTrees->sum(function ($tree) {
            return $tree->members->count();
        });
        
        $totalConnections = UserRelationship::whereHas('familyTree', function ($query) use ($user) {
            $query->whereHas('members', function ($memberQuery) use ($user) {
                $memberQuery->where('user_id', $user->id);
            });
        })->count();
        
        $pendingInvitations = Invitation::where(function ($query) use ($user) {
            $query->where('invited_by', $user->id)
                  ->orWhere('email', $user->email);
        })->where('status', 'pending')->count();
        
        $sentInvitations = Invitation::where('invited_by', $user->id)->count();
        
        // Get recent activity
        $recentActivity = FamilyTreeLog::whereHas('familyTree', function ($query) use ($user) {
            $query->whereHas('members', function ($memberQuery) use ($user) {
                $memberQuery->where('user_id', $user->id);
            });
        })->with(['user', 'familyTree'])->latest()->take(5)->get();
        
        // Calculate profile completion percentage
        $profileFields = [
            'first_name', 'last_name', 'email', 'date_of_birth', 
            'gender_id', 'bio', 'phone', 'city', 'state', 'country'
        ];
        
        $completedFields = 0;
        foreach ($profileFields as $field) {
            if (!empty($user->$field)) {
                $completedFields++;
            }
        }
        
        $profileCompletion = round(($completedFields / count($profileFields)) * 100);

        return Inertia::render('dashboard', [
            'dashboardData' => [
                'user' => [
                    'first_name' => $user->first_name,
                    'name' => $user->name,
                    'avatar_url' => $user->avatar_url,
                    'profile_completion' => $profileCompletion,
                    'setup_completed' => $user->setup_completed,
                ],
                'statistics' => [
                    'family_trees_count' => $familyTrees->count(),
                    'total_family_members' => $totalFamilyMembers,
                    'connections_made' => $totalConnections,
                    'pending_invitations' => $pendingInvitations,
                    'sent_invitations' => $sentInvitations,
                ],
                'recent_activity' => $recentActivity,
                'family_trees' => $familyTrees,
            ]
        ]);
    }
}
