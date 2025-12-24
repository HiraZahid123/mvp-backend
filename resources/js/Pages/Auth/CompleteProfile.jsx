import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { GoogleMap, Marker, Circle, useLoadScript } from '@react-google-maps/api';

const libraries = ['places'];

export default function CompleteProfile() {
    const { user } = usePage().props;
    const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to NYC
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [radius, setRadius] = useState(10); // Default 10km

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const { data, setData, post, processing, errors } = useForm({
        name: user?.name || '',
        location_address: '',
        location_lat: null,
        location_lng: null,
        discovery_radius_km: 10,
    });

    const handleMapClick = useCallback((event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        setSelectedLocation({ lat, lng });
        setData('location_lat', lat);
        setData('location_lng', lng);

        // Reverse geocode to get address
        if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    setData('location_address', results[0].formatted_address);
                }
            });
        }
    }, [setData]);

    const handleRadiusChange = (newRadius) => {
        setRadius(newRadius);
        setData('discovery_radius_km', newRadius);
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('auth.complete-profile'), {
            onSuccess: () => {
                // Redirect will be handled by controller
            },
        });
    };

    const mapContainerStyle = {
        width: '100%',
        height: '300px',
    };

    const circleOptions = {
        strokeColor: '#3B82F6',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#3B82F6',
        fillOpacity: 0.1,
        clickable: false,
        draggable: false,
        editable: false,
        visible: true,
        radius: radius * 1000, // Convert km to meters
        center: selectedLocation || mapCenter,
    };

    if (loadError) {
        return <div>Error loading maps</div>;
    }

    return (
        <>
            <Head title="Complete Your Profile" />

            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                    <div className="w-full max-w-2xl space-y-8">
                        {/* Header */}
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Complete Your Profile
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Set your location and discovery preferences
                            </p>
                        </div>

                        {/* Profile Form */}
                        <form onSubmit={submit} className="space-y-6">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Display Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                        placeholder="How should we call you?"
                                    />
                                </div>
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Location Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Set Your Location
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Click on the map to set your location and adjust the discovery radius
                                </p>

                                {/* Map */}
                                <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                                    {isLoaded ? (
                                        <GoogleMap
                                            mapContainerStyle={mapContainerStyle}
                                            center={mapCenter}
                                            zoom={10}
                                            onClick={handleMapClick}
                                        >
                                            {selectedLocation && (
                                                <>
                                                    <Marker position={selectedLocation} />
                                                    <Circle
                                                        center={selectedLocation}
                                                        options={circleOptions}
                                                    />
                                                </>
                                            )}
                                        </GoogleMap>
                                    ) : (
                                        <div className="w-full h-[300px] bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                            <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
                                        </div>
                                    )}
                                </div>

                                {/* Address Display */}
                                {data.location_address && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Selected Address
                                        </label>
                                        <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                                            <p className="text-sm text-gray-900 dark:text-white">
                                                {data.location_address}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Radius Slider */}
                                <div>
                                    <label htmlFor="radius" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Discovery Radius: {radius} km
                                    </label>
                                    <div className="mt-2">
                                        <input
                                            id="radius"
                                            name="radius"
                                            type="range"
                                            min="1"
                                            max="50"
                                            value={radius}
                                            onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        This determines how far you'll discover performers or customers from your location
                                    </p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="text-center">
                                <button
                                    type="submit"
                                    disabled={processing || !selectedLocation}
                                    className="inline-flex items-center px-8 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Saving...' : 'Complete Profile'}
                                </button>
                            </div>

                            {/* General Error */}
                            {errors.general && (
                                <div className="text-center text-red-600 text-sm">
                                    {errors.general}
                                </div>
                            )}
                        </form>

                        {/* Footer */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                You can change these settings later in your profile
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
