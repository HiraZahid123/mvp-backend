<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ?string $role = null): Response
    {
        \Illuminate\Support\Facades\Log::info('AdminMiddleware check', [
            'auth_check' => Auth::check(),
            'user_id' => Auth::id(),
            'is_admin' => Auth::check() ? Auth::user()->isAdmin() : 'N/A',
            'path' => $request->path()
        ]);

        if (!Auth::check() || !Auth::user()->isAdmin()) {
            \Illuminate\Support\Facades\Log::info('AdminMiddleware failed - redirecting to login');
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            return redirect()->route('login');
        }

        // 2FA Verification Check removed as per request


        if ($role && Auth::user()->admin_role !== $role && !Auth::user()->isSuperAdmin()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized role'], 403);
            }
            abort(403);
        }

        return $next($request);
    }
}
