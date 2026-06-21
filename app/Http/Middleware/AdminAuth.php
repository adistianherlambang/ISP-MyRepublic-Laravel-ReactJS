<?php

namespace App\Http\Middleware;

use Closure;
use App\Admin;

class AdminAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $token = $request->header('Authorization');
        
        if (strpos($token, 'Bearer ') === 0) {
            $token = substr($token, 7);
        } else {
            $token = $request->input('token');
        }

        if (empty($token)) {
            return response()->json(['message' => 'Unauthorized: Token missing'], 401);
        }

        $admin = Admin::where('api_token', $token)->first();

        if (!$admin) {
            return response()->json(['message' => 'Unauthorized: Invalid token'], 401);
        }

        // Attach admin to request
        $request->merge(['current_admin' => $admin]);

        return $next($request);
    }
}
