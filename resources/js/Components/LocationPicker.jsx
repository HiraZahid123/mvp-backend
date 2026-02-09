import React, { useState, useEffect, useCallback } from 'react';
import { MapPinIcon, MapIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import useTranslation from '@/Hooks/useTranslation';
import { GoogleMap, Marker, Circle, useLoadScript, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];

export default function LocationPicker({ 
    role, 
    onLocationSelect,
    defaultMethod = 'zipcode',
    defaultZipCode = '',
    defaultRadius = 10 
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
        customer: 'Votre zone de confort ?',
        performer: 'Votre zone d\'intervention ?',
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
            <h2 className="text-2xl font-black text-primary-black text-center">
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
                            ? 'border-gold-accent bg-gold-accent/10'
                            : 'border-gray-border/50 bg-white hover:border-gold-accent/50'
                        }
                    `}
                >
                    <MapPinIcon className="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2 text-gold-accent" />
                    <p className="text-[10px] lg:text-sm font-bold text-primary-black">{t('GPS')}</p>
                </button>

                <button
                    type="button"
                    onClick={() => setMethod('zipcode')}
                    className={`
                        p-3 lg:p-4 rounded-[24px] border-2 transition-all duration-300
                        ${method === 'zipcode'
                            ? 'border-gold-accent bg-gold-accent/10'
                            : 'border-gray-border/50 bg-white hover:border-gold-accent/50'
                        }
                    `}
                >
                    <MapIcon className="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2 text-gold-accent" />
                    <p className="text-[10px] lg:text-sm font-bold text-primary-black">{t('Code postal')}</p>
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
                            bg-gold-accent text-white
                            rounded-[24px]
                            font-bold text-base
                            hover:bg-gold-accent/90
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
                            text-primary-black text-base
                            placeholder:text-gray-muted/60
                            focus:outline-none focus:ring-2 focus:ring-gold-accent/30 focus:border-gold-accent
                            transition-all duration-200
                        "
                    />
                    <button
                        type="button"
                        onClick={handleZipCodeSubmit}
                        disabled={loading || !zipCode}
                        className="
                            w-full px-6 py-4
                            bg-gold-accent text-white
                            rounded-[24px]
                            font-bold text-base
                            hover:bg-gold-accent/90
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
                <div className="space-y-4 p-6 bg-gold-accent/5 rounded-[24px] border border-gold-accent/30">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-bold">{t('Position confirmée')}</span>
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
                                        <Marker 
                                            position={selectedLocation} 
                                            draggable={true}
                                            onDragEnd={handleMapClick}
                                        />
                                        <Circle
                                            key={`circle-${radius}`}
                                            center={selectedLocation}
                                            radius={radius * 1000}
                                            options={{
                                                strokeColor: '#C57B67',
                                                strokeOpacity: 1,
                                                strokeWeight: 3,
                                                fillColor: '#C57B67',
                                                fillOpacity: 0.2,
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
                        <label className="block text-sm font-bold text-primary-black">
                            {t('Rayon de découverte:')} <span className="text-gold-accent">{radius} km</span>
                        </label>
                        <input
                            type="range"
                            min="5"
                            max="50"
                            value={radius}
                            onChange={(e) => setRadius(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                            style={{
                                background: `linear-gradient(to right, #C57B67 0%, #C57B67 ${((radius - 5) / 45) * 100}%, #E5E5E5 ${((radius - 5) / 45) * 100}%, #E5E5E5 100%)`
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



