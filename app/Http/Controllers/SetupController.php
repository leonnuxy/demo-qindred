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
        // Complete the setup process
        $this->setupService->completeUserSetup(Auth::user(), $request->validated());
        
        // Get the user's first family tree to pass to the dashboard
        $user = Auth::user()->fresh(); // Get fresh instance to include any new relationships
        $tree = $user->familyTrees()->latest()->first();
        
        if ($tree) {
            // Pass the tree_id as a query parameter so the dashboard can load it
            return redirect()
                ->route('dashboard', ['tree_id' => $tree->id])
                ->with('success', 'Welcome to Qindred! Your setup is complete.');
        }
        
        // Fallback if no tree was created
        return redirect()
            ->route('dashboard')
            ->with('success', 'Welcome to Qindred! Your setup is complete.');
    }
}
