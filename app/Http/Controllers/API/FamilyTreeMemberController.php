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
            $this->trees->getFamilyMembers((int)$familyTreeId)
        );
    }

    /**
     * POST /api/family-trees/{familyTree}/members
     */
    public function store(Request $request, $familyTreeId)
    {
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

        if ($data['addMode'] === 'direct') {
            $member = $this->trees->addDirectMember((int)$familyTreeId, $data);
        } else {
            $member = $this->trees->inviteMember((int)$familyTreeId, $data);
        }

        return response()->json($member, 201);
    }

    /**
     * PUT /api/family-trees/{familyTree}/members/{member}
     */
    public function update(Request $request, $familyTreeId, $memberId)
    {
        $data = $request->validate([
            'id'                 => 'required|string',
            'firstName'         => 'required|string|max:255',
            'lastName'          => 'required|string|max:255',
            'dateOfBirth'       => 'nullable|date',
            'dateOfDeath'       => 'nullable|date',
            'isDeceased'        => 'required|boolean',
            'relationshipToUser'=> 'required|string',
        ]);

        $updated = $this->trees->updateMember(
            (int)$familyTreeId,
            $memberId,
            $data
        );

        return response()->json($updated);
    }

    /**
     * DELETE /api/family-trees/{familyTree}/members/{member}
     */
    public function destroy($familyTreeId, $memberId)
    {
        $this->trees->deleteMember((int)$familyTreeId, $memberId);
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
