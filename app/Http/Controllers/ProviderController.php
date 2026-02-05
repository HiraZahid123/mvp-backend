<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProviderController extends Controller
{
    /**
     * Display a listing of service providers.
     */
    public function index(Request $request)
    {
        $query = User::query()
            ->whereIn('role_type', ['performer', 'both'])
            ->with(['providerProfile', 'skills'])
            ->withCount('reviewsReceived');

        // Search by name or email
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('skills', function($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by rating (example)
        if ($request->filled('min_rating')) {
            $query->having('average_rating', '>=', $request->input('min_rating'));
        }

        $providers = $query->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'profile_photo_url' => $user->profile_photo_url,
                'average_rating' => $user->average_rating,
                'total_reviews' => $user->reviews_received_count,
                'hourly_rate' => $user->providerProfile?->hourly_rate,
                'skills' => $user->skills->pluck('name'),
                'location' => $user->location_address,
                'verified' => $user->email_verified_at !== null,
            ]);

        return Inertia::render('Providers/Index', [
            'providers' => $providers,
            'filters' => $request->only(['search', 'min_rating']),
        ]);
    }
}
