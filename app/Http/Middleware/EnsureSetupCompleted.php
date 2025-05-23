<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureSetupCompleted
{
    /**
     * Handle an incoming request.
     * Redirect users to the setup page if they haven't completed setup yet.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        
        // No need to check if user is not logged in
        if (!$user) {
            return $next($request);
        }
        
        // Always allow access to these paths regardless of setup status
        $allowedPaths = [
            // Static assets
            'favicon.ico', 'robots.txt', 'assets/', 'build/', 'public/assets/', 'public/build/',
            'js/', 'css/', 'fonts/', 'vendor/',
            // Images and storage
            'storage/', 'images/', 'svg/', 'img/', 'icons/',
            // Setup and authentication
            'setup', 'logout', 'login', 'register', 'password', 'reset-password',
            // User profile and basic settings
            'profile', 'email/verify', 'settings', 'account', 'preferences',
            // Public pages
            'health', 'status', 'ping', 'about', 'contact', 'terms', 'privacy',
            // Error pages
            'errors/', '404', '500', '503',
        ];
        
        // Check if the current path starts with any of the allowed paths
        $path = ltrim($request->path(), '/');
        foreach ($allowedPaths as $allowedPath) {
            if (str_starts_with($path, $allowedPath)) {
                return $next($request);
            }
        }
        
        // Skip setup check for these routes (belt and suspenders approach)
        if ($request->routeIs('setup.*') || 
            $request->routeIs('logout') || 
            $request->routeIs('login') ||
            $request->routeIs('register') ||
            $request->routeIs('password.*') ||
            $request->routeIs('verification.*') ||
            $request->routeIs('profile.*') ||
            $request->routeIs('settings.*') ||
            $request->routeIs('account.*') ||
            $request->routeIs('preferences.*')) {
            return $next($request);
        }
        
        // Skip setup check for API routes (handled by API middleware group)
        if ($request->is('api/*')) {
            return $next($request);
        }
        
        // Finally, check setup status and redirect if needed
        if (!$user->setup_completed) {
            // Allow AJAX requests to fail gracefully rather than redirect
            if ($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'message' => 'User setup not completed',
                    'redirect' => route('setup.index')
                ], 403);
            }
            
            return redirect()->route('setup.index');
        }
        
        return $next($request);
    }
}
