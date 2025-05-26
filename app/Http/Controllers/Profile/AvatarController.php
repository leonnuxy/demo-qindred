<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AvatarController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'avatar' => ['required','image','max:2048']
        ]);

        $user = $request->user();

        // Delete previous avatar if it exists
        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        // Store the new avatar
        $path = $request->file('avatar')->store('profile-photos', 'public');
        
        // Update user record
        $user->avatar_path = $path;
        $user->save();

        return back()->with('success', 'Avatar updated successfully');
    }
}
