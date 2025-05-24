<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\FamilyTreeMemberController;
use App\Http\Controllers\API\InvitationController as APIInvitationController;
use App\Http\Controllers\HealthController;

// Health check endpoint - no authentication required
Route::get('/health', HealthController::class);

// For development, we'll allow access without authentication
// TODO: Add proper API authentication in production
// Option 1: Route::middleware('auth:sanctum')->group(function () {
// Option 2: Route::middleware('auth:web')->group(function () {
Route::group([], function () {
    // Family-tree members
    // Route::get   ('family-trees/{family_tree}/members',       [FamilyTreeMemberController::class, 'index']);
    // Route::post  ('family-trees/{family_tree}/members',       [FamilyTreeMemberController::class, 'store']);
    // Route::put   ('family-trees/{family_tree}/members/{member}', [FamilyTreeMemberController::class, 'update']);
    // Route::delete('family-trees/{family_tree}/members/{member}', [FamilyTreeMemberController::class, 'destroy']);
    // Route::get   ('relationship-types', [FamilyTreeMemberController::class, 'relationshipTypes']);
    Route::apiResource('family-trees.members', FamilyTreeMemberController::class)
        ->parameters(['family-trees' => 'family_tree', 'members'=>'member']);
    Route::get('relationship-types', [FamilyTreeMemberController::class,'relationshipTypes']);

    // Invitations
    Route::post('family-trees/{family_tree}/invite', [APIInvitationController::class, 'send']);
    Route::post('invitations/{invitation}/accept', [APIInvitationController::class, 'accept']);
    Route::post('invitations/{invitation}/decline',[APIInvitationController::class, 'decline']);
});

