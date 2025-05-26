<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\FamilyTreeResource;
use App\Models\FamilyTree;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class FamilyTreeController extends Controller
{
    /**
     * Get family trees with members for the authenticated user
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTreesWithMembers(Request $request)
    {
        try {
            // Get current user
            $user = Auth::user();
            
            // If no authenticated user (API might be accessible without auth in development)
            // Use the first user in the database as a fallback
            if (!$user && config('app.env') !== 'production') {
                Log::warning('No authenticated user when accessing family trees API. Using fallback user.');
                $user = \App\Models\User::first();
            }
            
            // Ensure we have a user
            if (!$user) {
                return response()->json([
                    'error' => 'Authentication required',
                    'message' => 'Please log in to access family trees.'
                ], 401);
            }
            
            // Query family trees that the user has access to
            $query = FamilyTree::query()
                ->where(function($query) use ($user) {
                    // Trees created by the user
                    $query->where('creator_id', $user->id)
                          // Or public trees
                          ->orWhere('privacy', 'public')
                          // Or trees where user is a member
                          ->orWhereHas('members', function($q) use ($user) {
                              $q->where('user_id', $user->id);
                          });
                })
                ->with(['creator:id,name,email,profile_photo_path', 'members.user:id,name,email,profile_photo_path'])
                ->withCount('members');
            
            // Apply optional filters
            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }
            
            if ($request->has('privacy')) {
                $query->where('privacy', $request->input('privacy'));
            }
            
            // Apply sorting
            $sortBy = $request->input('sort_by', 'created_at');
            $sortDir = $request->input('sort_dir', 'desc');
            $allowedSortFields = ['name', 'created_at', 'updated_at', 'privacy'];
            
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
            } else {
                $query->orderBy('created_at', 'desc');
            }
            
            // Paginate results
            $perPage = $request->input('per_page', 10);
            $trees = $query->paginate(min($perPage, 50)); // Limit to 50 max
            
            return FamilyTreeResource::collection($trees)
                ->additional([
                    'meta' => [
                        'current_page' => $trees->currentPage(),
                        'last_page' => $trees->lastPage(),
                        'per_page' => $trees->perPage(),
                        'total' => $trees->total(),
                    ],
                ]);
                
        } catch (\Exception $e) {
            Log::error('Error retrieving family trees with members', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to retrieve family trees',
                'message' => 'An error occurred while retrieving family trees.',
                'details' => app()->environment('local') ? $e->getMessage() : null
            ], 500);
        }
    }
}
