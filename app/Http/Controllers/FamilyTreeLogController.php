<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFamilyTreeLogRequest;
use App\Models\FamilyTree;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class FamilyTreeLogController extends Controller
{
    public function store(StoreFamilyTreeLogRequest $request, FamilyTree $familyTree)
    {
        $this->authorize('update',$familyTree);

        try {
            $familyTree->logs()->create([
                'user_id'=>Auth::id(),
                'action'=> $request->input('content'),
            ]);

            return redirect()
                ->route('family-trees.show', ['family_tree' => $familyTree->id])
                ->with('success','Log added');
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return back()->with('error',$e->getMessage());
        }
    }
}
