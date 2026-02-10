<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeocodingService
{
    protected $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.google.maps_api_key');
    }

    /**
     * Geocode an address or zip code to lat/lng.
     */
    public function geocode(string $address): ?array
    {
        if (!$this->apiKey) {
            Log::warning('Google Maps API Key missing.');
            return null;
        }

        try {
            $response = Http::timeout(5)->get('https://maps.googleapis.com/maps/api/geocode/json', [
                'address' => $address . ', Switzerland',
                'key' => $this->apiKey,
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
            
            Log::info('Geocoding result status: ' . $data['status']);
        } catch (\Exception $e) {
            Log::error('Geocoding failed: ' . $e->getMessage());
        }

        return null;
    }
}
