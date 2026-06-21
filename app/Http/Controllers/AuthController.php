<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Admin;
use App\Product;
use App\Coverage;

class AuthController extends Controller
{
    /**
     * Authenticate an admin and return a token.
     */
    public function login(Request $request)
    {
        $this->validate($request, [
            'username' => 'required',
            'password' => 'required',
        ]);

        $username = $request->input('username');
        $password = $request->input('password');

        // Hash using MD5 to match the original database structure
        $hashedPassword = md5($password);

        $admin = Admin::where('username', $username)
                      ->where('password', $hashedPassword)
                      ->first();

        if (!$admin) {
            return response()->json(['message' => 'Username atau password salah'], 401);
        }

        // Generate dynamic token
        $token = str_random(60);
        
        // Temporarily bypass timestamps protection for this action or save directly
        $admin->api_token = $token;
        $admin->save();

        return response()->json([
            'username' => $admin->username,
            'token' => $token,
        ]);
    }

    /**
     * Log out an admin by clearing their token.
     */
    public function logout(Request $request)
    {
        $admin = $request->get('current_admin');
        
        if ($admin) {
            $admin->api_token = null;
            $admin->save();
        }

        return response()->json(['message' => 'Logout sukses']);
    }

    /**
     * Return current admin details if authenticated.
     */
    public function me(Request $request)
    {
        $admin = $request->get('current_admin');
        return response()->json([
            'username' => $admin->username,
        ]);
    }

    /**
     * Return statistics for dashboard.
     */
    public function stats()
    {
        $totalProducts = Product::count();
        $totalCoverages = Coverage::count();
        $availableCoverages = Coverage::where('status', 'Tersedia')->count();

        return response()->json([
            'total_products' => $totalProducts,
            'total_coverages' => $totalCoverages,
            'available_coverages' => $availableCoverages,
        ]);
    }
}
