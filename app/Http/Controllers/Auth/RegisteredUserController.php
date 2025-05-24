<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
{
    $request->validate([
        'first_name'            => ['required','string','max:255'],
        'last_name'             => ['required','string','max:255'],
        'email'                 => ['required','string','email','max:255', Rule::unique(User::class),],
        'password'              => ['required','confirmed', Rules\Password::defaults()],
        'terms'                 => ['accepted'],
    ]);

    $user = User::create([
        'first_name'  => $request->first_name,
        'last_name'   => $request->last_name,
        'email'       => $request->email,
        'password'    => Hash::make($request->password),
        'role'        => 'user',
        'status'      => 'active',
        'email_verified_at' => now(), // Automatically verify the user
    ]);

    event(new Registered($user));

    // If you require email verification:
    // return to_route('verification.notice');

    // Otherwise, log in immediately and redirect to setup:
    Auth::guard('web')->login($user);

    $request->session()->regenerate();

    return redirect('/setup');
}

}
