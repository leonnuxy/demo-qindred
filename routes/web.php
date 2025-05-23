<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\FamilyTreeController;
use App\Http\Controllers\FamilyTreeLogController;
use App\Http\Controllers\SetupController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/setup',           [SetupController::class,'index'])->name('setup.index');
    Route::post('/setup/complete', [SetupController::class,'complete'])->name('setup.complete');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        // force redirect incomplete users
        if (! Auth::user()->setup_completed) {
            return redirect()->route('setup.index');
        }

        return Inertia::render('dashboard');
    })->name('dashboard');

    // Family tree routes
    Route::resource('family-trees', FamilyTreeController::class);
    Route::post('family-trees/{familyTree}/logs', [FamilyTreeLogController::class,'store'])->name('family-trees.logs.store');
    
    // Invitation routes
    Route::get('/invitations', [InvitationController::class, 'index'])->name('invitations.index');
    Route::post('/invitations/{familyTree}/send', [InvitationController::class, 'send'])->name('invitations.send');
    Route::post('/invitations/{invitation}/accept', [InvitationController::class, 'accept'])->name('invitations.accept');
    Route::post('/invitations/{invitation}/decline', [InvitationController::class, 'decline'])->name('invitations.decline');
    Route::post('/invitations/{invitation}/resend', [InvitationController::class, 'resend'])->name('invitations.resend');
    Route::post('/invitations/{invitation}/cancel', [InvitationController::class, 'cancel'])->name('invitations.cancel');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
