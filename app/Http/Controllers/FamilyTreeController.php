<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFamilyTreeRequest;
use App\Http\Requests\UpdateFamilyTreeRequest;
use App\Models\FamilyTree;
use App\Models\FamilyMember;
use App\Services\FamilyTreeService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class FamilyTreeController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected FamilyTreeService $trees) {}

    /** Show list of trees (web) */
    public function index()
    {
        $user = Auth::user();

        $familyTrees = $user->familyTrees()
            ->withCount([
                'members',
                'invitations as pending_invitations_count' => fn($q) => $q->where('status','pending'),
            ])
            ->orderBy('name')
            ->get()
            ->map(fn($t) => [
                'id'                         => $t->id,
                'name'                       => $t->name,
                'description'                => $t->description,
                'member_count'               => $t->members_count,
                'pending_invitations_count'  => $t->pending_invitations_count,
                'created_at'                 => $t->created_at->toFormattedDateString(),
                'user_role_in_tree'          => $t->pivot->role ?? null,
                'is_creator'                 => $t->creator_id === $user->id,
            ]);

        return Inertia::render('FamilyTrees/Index', [
            'familyTrees' => $familyTrees,
        ]);
    }

    /** Show form to create */
    public function create()
    {
        return Inertia::render('FamilyTrees/Create');
    }

    /** Persist new tree */
    public function store(StoreFamilyTreeRequest $request)
    {
        try {
            $tree = $this->trees->createFamilyTree(
                $request->validated(),
                Auth::id()
            );

            return redirect()
                ->route('family-trees.show', ['family_tree' => $tree->id])
                ->with('success', 'Family tree created successfully!');
        } catch (\Exception $e) {
            Log::error("Creating tree failed: {$e->getMessage()}");
            return back()->with('error', $e->getMessage());
        }
    }

    /** View a single tree */
    public function show(FamilyTree $familyTree)
    {
        $this->authorize('view', $familyTree);

        $userId = Auth::id();

        $hierarchicalTreeData = $this->trees
            ->getTreeForDisplay($familyTree->id, $userId);

        // prepare member list for web view
        $membersList = $familyTree->members()
            ->with('user:id,first_name,last_name,email,avatar_path')
            ->get()
            ->map(fn($m) => [
                'family_member_id' => $m->id,
                'user_id'          => $m->user->id,
                'name'             => $m->user->name,
                'email'            => $m->user->email,
                'avatar'           => $m->user->avatar_url,
                'role_in_tree'     => $m->role,
            ])->filter()->values();

        // prepare logs
        $familyTreeLogs = $familyTree->logs()
            ->with('author:id,first_name,last_name,avatar_path')
            ->latest()
            ->take(20)
            ->get()
            ->map(fn($log) => [
                'id'        => $log->id,
                'content'   => $log->action,
                'timestamp' => $log->created_at->diffForHumans(),
                'author'    => $log->author
                    ? ['name'=>$log->author->name,'avatar'=>$log->author->avatar_url]
                    : ['name'=>'System','avatar'=>'/assets/avatar-placeholder.png'],
                'likes'     => 0,
            ]);

        return Inertia::render('FamilyTrees/Show', [
            'familyTree' => [
                'id'              => $familyTree->id,
                'name'            => $familyTree->name,
                'description'     => $familyTree->description,
                'privacy'         => $familyTree->privacy,
                'is_creator'      => $familyTree->creator_id === $userId,
                'user_role_in_tree'=> FamilyMember::where('family_tree_id',$familyTree->id)
                                        ->where('user_id',$userId)
                                        ->first()?->role,
                'created_at'      => $familyTree->created_at->toFormattedDateString(),
            ],
            'hierarchicalTreeData' => $hierarchicalTreeData,
            'membersList'          => $membersList,
            'familyTreeLogs'       => $familyTreeLogs,
            
            // Enhanced data structure for frontend transformation
            'tree_metadata' => [
                'id'              => $familyTree->id,
                'name'            => $familyTree->name,
                'description'     => $familyTree->description,
                'privacy'         => $familyTree->privacy,
                'is_creator'      => $familyTree->creator_id === $userId,
                'created_at'      => $familyTree->created_at->toDateTimeString(),
                'updated_at'      => $familyTree->updated_at->toDateTimeString(),
            ],
            'members' => $familyTree->members()
                ->with('user')
                ->get()
                ->map(fn($m) => [
                    'id'            => $m->id,
                    'user_id'       => $m->user_id,
                    'first_name'    => $m->user->first_name,
                    'last_name'     => $m->user->last_name,
                    'email'         => $m->user->email,
                    'gender'        => $m->user->gender?->value,
                    'date_of_birth' => $m->user->date_of_birth?->toDateString(),
                    'date_of_death' => $m->user->date_of_death?->toDateString(),
                    'role_in_tree'  => $m->role,
                    'is_creator'    => $m->user_id === $familyTree->creator_id,
                    'profile_photo' => $m->user->avatar_url,
                ]),
            'relationships' => \App\Models\UserRelationship::where('family_tree_id', $familyTree->id)
                ->with(['user', 'relatedUser'])
                ->get()
                ->map(fn($r) => [
                    'id'               => $r->id,
                    'user_id'          => $r->user_id,
                    'related_user_id'  => $r->related_user_id,
                    'relationship_type'=> $r->relationship_type->value,
                ]),
        ]);
    }

    /** Show edit form */
    public function edit(FamilyTree $familyTree)
    {
        $this->authorize('update', $familyTree);

        return Inertia::render('FamilyTrees/Edit', [
            'familyTree' => $familyTree->only('id','name','description','privacy'),
        ]);
    }

    /** Persist edits */
    public function update(UpdateFamilyTreeRequest $request, FamilyTree $familyTree)
    {
        $this->authorize('update', $familyTree);

        try {
            $familyTree->update($request->validated());

            $familyTree->logs()->create([
                'user_id' => Auth::id(),
                'action'  => 'Updated tree details',
            ]);

            return redirect()
                ->route('family-trees.show', ['family_tree' => $familyTree->id])
                ->with('success','Family tree updated!');
        } catch (\Exception $e) {
            Log::error("Updating tree failed: {$e->getMessage()}");
            return back()->with('error',$e->getMessage());
        }
    }

    /** Delete tree */
    public function destroy(FamilyTree $familyTree)
    {
        $this->authorize('delete',$familyTree);

        $familyTree->delete();

        return redirect()
            ->route('family-trees.index')
            ->with('success','Family tree deleted.');
    }
}
