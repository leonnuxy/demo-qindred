<?php

namespace App\Http\Controllers;

use App\Http\Requests\CompleteSetupRequest;
use App\Services\UserSetupService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SetupController extends Controller
{
    public function __construct(protected UserSetupService $setupService) {}

    public function index()
    {
        $user = Auth::user();
        if ($user->setup_completed) {
            return redirect()->route('dashboard');
        }
        return Inertia::render('Setup/SetupPage', [
            'user'              => $user->only('id', 'email', 'first_name', 'last_name', 'name'),
            'relationshipTypes' => $this->setupService->getRelationshipTypes(),
        ]);
    }

    public function complete(CompleteSetupRequest $request)
    {
        $this->setupService->completeUserSetup(Auth::user(), $request->validated());
        return redirect()
            ->route('dashboard')
            ->with('success', 'Welcome to Qindred! Your setup is complete.');
    }
}
