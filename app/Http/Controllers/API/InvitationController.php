<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\InvitationService;
use App\Models\Invitation;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class InvitationController extends Controller
{
    public function __construct(protected InvitationService $invitations) {}

    /**
     * POST  /api/family-trees/{familyTree}/invite
     */
    public function send(Request $request, int $familyTreeId)
    {
        $data = $request->validate([
            'email'            => ['required','email','max:255'],
            'relationshipType' => ['required','string','max:255'],
        ]);

        $inv = $this->invitations
                    ->send($familyTreeId, $data['email'], $data['relationshipType']);

        return response()->json($inv, 201);
    }

    /**
     * POST  /api/invitations/{invitation}/accept
     */
    public function accept(Invitation $invitation)
    {
        $this->invitations->respond($invitation, true);

        return response()->json(['status' => 'accepted']);
    }

    /**
     * POST  /api/invitations/{invitation}/decline
     */
    public function decline(Invitation $invitation)
    {
        $this->invitations->respond($invitation, false);

        return response()->json(['status' => 'declined']);
    }
}
