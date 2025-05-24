<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\FamilyMember;
use App\Models\FamilyTree;
use App\Models\UserRelationship;
use App\Services\FamilyTreeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FamilyTreeMemberController extends Controller
{
    public function __construct(protected FamilyTreeService $trees) {}

    /**
     * GET /api/family-trees/{familyTree}/members
     */
    public function index($familyTreeId)
    {
        return response()->json(
            $this->trees->getFamilyMembers($familyTreeId)
        );
    }

    /**
     * POST /api/family-trees/{familyTree}/members
     */
    public function store(Request $request, $familyTreeId)
    {
        // Log the parameters for debugging
        \Log::info('Store member request', [
            'familyTreeId' => $familyTreeId,
            'requestData' => $request->all()
        ]);
        
        try {
            $data = $request->validate([
                'firstName'         => 'required|string|max:255',
                'lastName'          => 'required|string|max:255',
                'dateOfBirth'       => 'nullable|date',
                'dateOfDeath'       => 'nullable|date',
                'isDeceased'        => 'required|boolean',
                'relationshipToUser'=> 'required|string',
                'addMode'           => 'required|in:direct,invite',
                'email'             => 'nullable|email',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed', [
                'errors' => $e->errors(),
                'data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        try {
            // Check if we have an authenticated user for direct member addition
            if ($data['addMode'] === 'direct' && !auth()->check()) {
                \Log::warning('Attempted to add direct member without authentication', [
                    'tree_id' => $familyTreeId
                ]);
                // Continue anyway - our updated service will handle this case
            }
            
            if ($data['addMode'] === 'direct') {
                $member = $this->trees->addDirectMember((string)$familyTreeId, $data);
            } else {
                $member = $this->trees->inviteMember((string)$familyTreeId, $data);
            }
            
            return response()->json($member, 201);
        } catch (\Exception $e) {
            \Log::error('Failed to add member', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return a more user-friendly error message
            return response()->json(
                [
                    'error' => 'Failed to add family member', 
                    'message' => 'There was a problem adding the family member.',
                    'details' => app()->environment('local') ? $e->getMessage() : null
                ], 
                500
            );
        }
    }

    /**
     * PUT /api/family-trees/{familyTree}/members/{member}
     */
    public function update(Request $request, $familyTreeId, $memberId)
    {
        // Log the parameters for debugging
        \Log::info('Update member request', [
            'familyTreeId' => $familyTreeId,
            'memberId' => $memberId,
            'requestData' => $request->all()
        ]);
        
        try {
            $data = $request->validate([
                'id'                => 'required|string',
                'firstName'         => 'required|string|max:255',
                'lastName'          => 'required|string|max:255',
                'dateOfBirth'       => 'nullable|date',
                'dateOfDeath'       => 'nullable|date',
                'isDeceased'        => 'required|boolean',
                'relationshipToUser'=> 'required|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed', [
                'errors' => $e->errors(),
                'data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        try {
            $updated = $this->trees->updateMember(
                (string)$familyTreeId,
                (string)$memberId,
                $data
            );
            
            return response()->json($updated);
        } catch (\Exception $e) {
            \Log::error('Failed to update member', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(
                ['error' => 'Failed to update member: ' . $e->getMessage()], 
                500
            );
        }
    }

    /**
     * DELETE /api/family-trees/{familyTree}/members/{member}
     */
    public function destroy($familyTreeId, $memberId)
    {
        $this->trees->deleteMember($familyTreeId, $memberId);
        return response()->noContent();
    }

    /**
     * GET /api/relationship-types
     */
    public function relationshipTypes()
    {
        return response()->json($this->trees->getRelationshipTypes());
    }
}
