import React, { useState, useEffect, useCallback } from 'react';
import { MapPinIcon, MapIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import useTranslation from '@/Hooks/useTranslation';
import { GoogleMap, Circle, useLoadScript, Autocomplete } from '@react-google-maps/api';
import AdvancedMarker from '@/Components/AdvancedMarker';

const libraries = ['places'];

export default function LocationPicker({ 
    role, 
    onLocationSelect,
    defaultMethod = 'zipcode',
    defaultZipCode = '',
    defaultRadius = 5 
}) {
    const { t } = useTranslation();
    const [method, setMethod] = useState(defaultMethod);
    const [zipCode, setZipCode] = useState(defaultZipCode);
    const [radius, setRadius] = useState(defaultRadius);
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Default Paris
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [autocomplete, setAutocomplete] = useState(null);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    // Dynamic title based on role
    const titles = {
        client: 'Votre zone de confort ?',
        provider: 'Votre zone d\'intervention ?',
        both: 'Votre périmètre d\'action ?',
    };

    const title = titles[role] || titles.both;

    // Helper to fetch address from coords
    const fetchAddress = useCallback((lat, lng) => {
        if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const formattedAddress = results[0].formatted_address;
                    setAddress(formattedAddress);
                    
                    // Also try to extract zip code for consistency if possible
                    const addressComponents = results[0].address_components;
                    let foundZip = '';
                    for (const component of addressComponents) {
                        if (component.types.includes('postal_code')) {
                            foundZip = component.long_name;
                            break;
                        }
                    }
                    if (foundZip) {
                         setZipCode(foundZip);
                    }
                    
                    return formattedAddress;
                }
            });
        }
    }, []);

    const handleMapClick = useCallback((event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        const loc = { lat, lng };
        setSelectedLocation(loc);
        setLocation(loc);
        
        // Reverse geocode
        fetchAddress(lat, lng);
    }, [fetchAddress]);

    // Update parent when address changes to ensure latest is sent
    useEffect(() => {
        if (location && onLocationSelect) {
            onLocationSelect({
                method,
                zip_code: method === 'zipcode' ? zipCode : null,
                location_lat: location.lat,
                location_lng: location.lng,
                discovery_radius_km: radius,
                location_address: address
            });
        }
    }, [address, location, radius, method, zipCode, onLocationSelect]);

    const handleGPSLocation = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError(t("La géolocalisation n'est pas supportée par votre navigateur."));
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const loc = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setLocation(loc);
                setSelectedLocation(loc);
                setMapCenter(loc); // Center map on user
                fetchAddress(loc.lat, loc.lng);
                setLoading(false);
            },
            (err) => {
                setError(t("Impossible d'obtenir votre position. Veuillez réessayer."));
                setLoading(false);
            }
        );
    };

    const handleZipCodeSubmit = (e) => {
        e?.preventDefault();
        
        if (!zipCode) {
            setError(t('Veuillez saisir un code postal.'));
            return;
        }

        setLoading(true);
        setError(null);

        if (window.google && window.google.maps) {
             const geocoder = new window.google.maps.Geocoder();
             geocoder.geocode({ 
                 address: zipCode,
                 componentRestrictions: { country: 'FR' }
             }, (results, status) => {
                 if (status === 'OK' && results[0]) {
                     const loc = {
                         lat: results[0].geometry.location.lat(),
                         lng: results[0].geometry.location.lng()
                     };
                     setLocation(loc);
                     setSelectedLocation(loc);
                     setMapCenter(loc);
                     setAddress(results[0].formatted_address);
                     setLoading(false);
                 } else {
                     setError(t("Impossible de trouver ce code postal."));
                     setLoading(false);
                 }
             });
        } else {
            setLoading(false);
            setError(t("Google Maps non chargé."));
        }
    };

    const onAutocompleteLoad = (autocompleteInstance) => {
        setAutocomplete(autocompleteInstance);
    };

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            if (place.geometry) {
                const loc = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                };
                setLocation(loc);
                setSelectedLocation(loc);
                setMapCenter(loc);
                setAddress(place.formatted_address || '');
                setError(null);
            } else {
                setError(t("Aucun détail disponible pour cette adresse."));
            }
        }
    };

    const mapContainerStyle = {
        width: '100%',
        height: '300px',
        borderRadius: '1.5rem',
        marginTop: '1rem'
    };

    return (
        <div className="space-y-6">
            {/* Title */}
            <h2 className="text-2xl font-black text-oflem-charcoal text-center">
                {t(title)}
            </h2>

            {/* Method Selection */}
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <button
                    type="button"
                    onClick={() => setMethod('gps')}
                    className={`
                        p-3 lg:p-4 rounded-[24px] border-2 transition-all duration-300
                        ${method === 'gps'
                            ? 'border-oflem-terracotta bg-oflem-terracotta/5 shadow-elegant-glow scale-[1.02]'
                            : 'border-gray-border/50 bg-white hover:border-oflem-terracotta/40 hover:shadow-elegant'
                        }
                    `}
                >
                    <MapPinIcon className="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2 text-oflem-terracotta" />
                    <p className="text-[10px] lg:text-sm font-bold text-oflem-charcoal">{t('GPS')}</p>
                </button>

                <button
                    type="button"
                    onClick={() => setMethod('zipcode')}
                    className={`
                        p-3 lg:p-4 rounded-[24px] border-2 transition-all duration-300
                        ${method === 'zipcode'
                            ? 'border-oflem-terracotta bg-oflem-terracotta/5 shadow-elegant-glow scale-[1.02]'
                            : 'border-gray-border/50 bg-white hover:border-oflem-terracotta/40 hover:shadow-elegant'
                        }
                    `}
                >
                    <MapIcon className="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2 text-oflem-terracotta" />
                    <p className="text-[10px] lg:text-sm font-bold text-oflem-charcoal">{t('Code postal')}</p>
                </button>
            </div>

            {/* GPS Method */}
            {method === 'gps' && (
                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={handleGPSLocation}
                        disabled={loading}
                        className="
                            w-full px-6 py-4 
                            btn-primary
                            rounded-[24px]
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-300
                        "
                    >
                        {loading ? t('Localisation...') : t('Obtenir ma position')}
                    </button>
                </div>
            )}


            {/* Zip Code Method */}
            {method === 'zipcode' && (
                <div className="space-y-4">
                    <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleZipCodeSubmit(e)}
                        placeholder={t('Ex: 75001')}
                        className="
                            w-full px-4 py-3
                            bg-input-bg border border-gray-border/50
                            rounded-[24px]
                            text-oflem-charcoal text-base
                            placeholder:text-gray-muted/60
                            focus:outline-none focus:ring-2 focus:ring-oflem-terracotta/30 focus:border-oflem-terracotta
                            transition-all duration-200
                        "
                    />
                    <button
                        type="button"
                        onClick={handleZipCodeSubmit}
                        disabled={loading || !zipCode}
                        className="
                            w-full px-6 py-4
                            btn-primary
                            rounded-[24px]
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-300
                        "
                    >
                        {loading ? t('Recherche...') : t('Valider')}
                    </button>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-[24px]">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Location Confirmed & Map */}
            {location && (
                <div className="space-y-6 elegant-capsule !bg-oflem-cream/30 !p-8 !border-oflem-terracotta/10">
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="text-sm font-black text-oflem-charcoal uppercase tracking-wider">{t('Position confirmée')}</span>
                    </div>

                    {/* Address Display */}
                    {address && (
                         <div className="w-full px-4 py-3 bg-white border border-gray-border/50 rounded-[16px] text-center">
                            <p className="text-sm text-gray-700 font-medium">{address}</p>
                        </div>
                    )}

                     {/* Map Display */}
                     <div className="rounded-[24px] overflow-hidden border border-gray-border relative">
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={selectedLocation || mapCenter}
                                zoom={12}
                                onClick={handleMapClick}
                                options={{
                                    disableDefaultUI: true,
                                    zoomControl: false,
                                    mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID", // Required for AdvancedMarker
                                    styles: [
                                        {
                                            featureType: "all",
                                            elementType: "geometry",
                                            stylers: [{ color: "#f5f5f5" }]
                                        }
                                    ]
                                }}
                            >
                                {selectedLocation && (
                                    <>
                                        <AdvancedMarker 
                                            position={selectedLocation} 
                                            draggable={true}
                                            onDragEnd={handleMapClick}
                                        />
                                        <Circle
                                            key={`circle-${radius}`}
                                            center={selectedLocation}
                                            radius={radius * 1000}
                                            options={{
                                                strokeColor: '#FF6B35',
                                                strokeOpacity: 0.8,
                                                strokeWeight: 2,
                                                fillColor: '#FF6B35',
                                                fillOpacity: 0.15,
                                                clickable: false,
                                                editable: false,
                                                draggable: false,
                                            }}
                                        />
                                    </>
                                )}
                            </GoogleMap>
                        ) : (
                            <div className="w-full h-[300px] bg-gray-100 flex items-center justify-center italic text-gray-400">
                                {loadError ? 'Error loading maps' : 'Loading map...'}
                            </div>
                        )}
                    </div>

                    {/* Radius Slider */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-oflem-charcoal">
                            {t('Rayon de découverte:')} <span className="text-oflem-terracotta">{radius} km</span>
                        </label>
                        <input
                            type="range"
                            min="5"
                            max="50"
                            value={radius}
                            onChange={(e) => setRadius(parseInt(e.target.value))}
                            className="w-full h-2 bg-zinc-100 rounded-full appearance-none cursor-pointer slider"
                            style={{
                                background: `linear-gradient(to right, #FF6B35 0%, #FF6B35 ${((radius - 5) / 45) * 100}%, #edf2f7 ${((radius - 5) / 45) * 100}%, #edf2f7 100%)`
                            }}
                        />
                        <div className="flex justify-between text-xs text-gray-muted font-medium">
                            <span>5 km</span>
                            <span>50 km</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}



