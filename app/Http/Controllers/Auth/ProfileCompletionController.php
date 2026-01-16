<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class ProfileCompletionController extends Controller
{
    /**
     * Show the Identity & Profile form (username, photo)
     */
    public function createIdentity()
    {
        $user = Auth::user();

        if (!$user || !$user->role_type) {
            return redirect()->route('auth.select-role');
        }

        return Inertia::render('Auth/CompleteIdentity', [
            'user' => $user,
        ]);
    }

    /**
     * Store identity information (username, photo)
     */
    public function storeIdentity(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255',
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = Auth::user();

        if (!$user) {
            return redirect()->route('auth.select-role');
        }

        $photoPath = null;
        if ($request->hasFile('profile_photo')) {
            $photoPath = $request->file('profile_photo')->store('profile-photos', 'public');
        }

        $user->update([
            'username' => $request->username,
            'profile_photo' => $photoPath,
        ]);

        return redirect()->route('auth.complete-location');
    }

    /**
     * Show the Location Setup form (GPS or zip code + radius)
     */
    public function createLocation()
    {
        $user = Auth::user();

        if (!$user || !$user->role_type || !$user->username) {
            return redirect()->route('auth.select-role');
        }

        return Inertia::render('Auth/CompleteLocation', [
            'user' => $user,
            'role' => $user->role_type,
        ]);
    }

    /**
     * Store location information
     */
    public function storeLocation(Request $request)
    {
        $request->validate([
            'method' => 'required|in:gps,zipcode',
            'location_lat' => 'required_if:method,gps|nullable|numeric|between:-90,90',
            'location_lng' => 'required_if:method,gps|nullable|numeric|between:-180,180',
            'zip_code' => 'required_if:method,zipcode|nullable|string|max:10',
            'location_address' => 'nullable|string|max:500',
            'discovery_radius_km' => 'required|integer|min:5|max:20',
        ]);

        $user = Auth::user();

        if (!$user) {
            return redirect()->route('auth.select-role');
        }

        $lat = $request->location_lat;
        $lng = $request->location_lng;
        $address = $request->location_address;

        // If using zip code, geocode it
        if ($request->method === 'zipcode' && $request->zip_code) {
            $geocoded = $this->geocodeZipCode($request->zip_code);
            if ($geocoded) {
                $lat = $geocoded['lat'];
                $lng = $geocoded['lng'];
                $address = $geocoded['address'] ?? $request->zip_code;
            }
        }

        $user->update([
            'location_lat' => $lat,
            'location_lng' => $lng,
            'location_address' => $address,
            'zip_code' => $request->method === 'zipcode' ? $request->zip_code : null,
            'discovery_radius_km' => $request->discovery_radius_km,
        ]);

        return redirect()->route('auth.registration-success');
    }

    /**
     * Geocode zip code to lat/lng using Google Maps API
     */
    private function geocodeZipCode(string $zipCode): ?array
    {
        $apiKey = config('services.google.maps_api_key');
        
        if (!$apiKey) {
            return null;
        }

        try {
            $response = Http::get('https://maps.googleapis.com/maps/api/geocode/json', [
                'address' => $zipCode . ', Switzerland',
                'key' => $apiKey,
            ]);

            $data = $response->json();

            if ($data['status'] === 'OK' && isset($data['results'][0])) {
                $location = $data['results'][0]['geometry']['location'];
                return [
                    'lat' => $location['lat'],
                    'lng' => $location['lng'],
                    'address' => $data['results'][0]['formatted_address'],
                ];
            }
        } catch (\Exception $e) {
            logger()->error('Geocoding failed: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Show the old profile completion form (legacy - for backward compatibility)
     */
    public function create()
    {
        return $this->createLocation();
    }

    /**
     * Store the old profile completion (legacy - for backward compatibility)
     */
    public function store(Request $request)
    {
        return $this->storeLocation($request);
    }
}
