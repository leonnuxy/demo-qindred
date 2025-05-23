<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\FamilyTreeMemberController;
use App\Http\Controllers\API\InvitationController as APIInvitationController;

Route::middleware('auth:sanctum')->group(function () {
    // Family-tree members
    // Route::get   ('family-trees/{familyTree}/members',       [FamilyTreeMemberController::class, 'index']);
    // Route::post  ('family-trees/{familyTree}/members',       [FamilyTreeMemberController::class, 'store']);
    // Route::put   ('family-trees/{familyTree}/members/{member}', [FamilyTreeMemberController::class, 'update']);
    // Route::delete('family-trees/{familyTree}/members/{member}', [FamilyTreeMemberController::class, 'destroy']);
    // Route::get   ('relationship-types', [FamilyTreeMemberController::class, 'relationshipTypes']);
    Route::apiResource('family-trees.members', FamilyTreeMemberController::class)->parameters(['members'=>'member']);
    Route::get('relationship-types', [FamilyTreeMemberController::class,'relationshipTypes']);

    // Invitations
    Route::post('family-trees/{familyTree}/invite', [APIInvitationController::class, 'send']);
    Route::post('invitations/{invitation}/accept', [APIInvitationController::class, 'accept']);
    Route::post('invitations/{invitation}/decline',[APIInvitationController::class, 'decline']);
});

