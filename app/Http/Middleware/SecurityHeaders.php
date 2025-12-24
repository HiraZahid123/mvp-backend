<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
   // app/Http/Middleware/SecurityHeaders.php

   public function handle(Request $request, Closure $next): Response
   {
       $response = $next($request);
   
       $response->headers->set('X-Content-Type-Options', 'nosniff');
       $response->headers->set('X-Frame-Options', 'DENY');
       $response->headers->set('X-XSS-Protection', '1; mode=block');
       
       // DELETE OR COMMENT OUT THE LINE BELOW:
       // $response->headers->set('Content-Security-Policy', "..."); 
   
       return $response;
   }
   

}
