<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class RateLimitOTPRequests
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $identifier = $request->input('identifier') ?: $request->input('email') ?: $request->input('phone');

        if (!$identifier) {
            return $next($request);
        }

        $key = 'otp-requests:' . $identifier;

        if (RateLimiter::tooManyAttempts($key, 5)) { // 5 requests per hour
            $seconds = RateLimiter::availableIn($key);

            return response()->json([
                'message' => 'Too many OTP requests. Please try again later.',
                'retry_after' => $seconds,
            ], 429);
        }

        RateLimiter::hit($key, 3600); // 1 hour window

        return $next($request);
    }
}
