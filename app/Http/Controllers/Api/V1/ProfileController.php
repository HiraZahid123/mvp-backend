<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /**
     * Update user profile information
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'location_address' => 'sometimes|required|string|max:500',
            'location_lat' => 'sometimes|required|numeric|between:-90,90',
            'location_lng' => 'sometimes|required|numeric|between:-180,180',
            'discovery_radius_km' => 'sometimes|required|integer|min:1|max:100',
        ]);

        if ($request->has('email') && $user->email !== $request->email) {
            $user->email_verified_at = null;
        }

        $user->update($request->only([
            'name', 'email', 'location_address', 'location_lat', 'location_lng', 'discovery_radius_km'
        ]));

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
        ]);
    }

    /**
     * Update user role
     */
    public function updateRole(Request $request)
    {
        $request->validate([
            'role' => 'required|in:customer,performer,both',
        ]);

        $user = Auth::user();
        $user->update(['role_type' => $request->role]);

        return response()->json([
            'message' => 'Role updated successfully',
            'role' => $user->role_type,
        ]);
    }

    /**
     * Delete user account
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'password' => 'required|current_password',
        ]);

        $user = Auth::user();
        
        // Revoke all tokens
        $user->tokens()->delete();
        
        $user->delete();

        return response()->json([
            'message' => 'Account deleted successfully',
        ]);
    }
}
