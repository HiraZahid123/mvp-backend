import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import useTranslation from '@/Hooks/useTranslation';
import { GoogleMap, useLoadScript, Autocomplete } from '@react-google-maps/api';
import AdvancedMarker from '@/Components/AdvancedMarker';

const libraries = ['places'];

export default function MissionLocationPicker({ 
    onLocationSelect,
    initialLocation = null,
    initialAddress = ''
}) {
    const { t } = useTranslation();
    const [location, setLocation] = useState(initialLocation);
    const [address, setAddress] = useState(initialAddress);
    const [mapCenter, setMapCenter] = useState(initialLocation || { lat: 46.8182, lng: 8.2275 }); // Default Switzerland
    const [autocomplete, setAutocomplete] = useState(null);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const fetchAddress = useCallback((lat, lng) => {
        if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const formattedAddress = results[0].formatted_address;
                    setAddress(formattedAddress);
                    
                    // Extract city for the 'location' field if possible
                    let city = '';
                    for (const component of results[0].address_components) {
                        if (component.types.includes('locality')) {
                            city = component.long_name;
                            break;
                        }
                    }

                    onLocationSelect({
                        lat,
                        lng,
                        address: formattedAddress,
                        city: city || formattedAddress.split(',')[0]
                    });
                }
            });
        }
    }, [onLocationSelect]);

    const handleMapClick = useCallback((event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        const loc = { lat, lng };
        setLocation(loc);
        fetchAddress(lat, lng);
    }, [fetchAddress]);

    const onLoad = (autocompleteInstance) => {
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
                setMapCenter(loc);
                setAddress(place.formatted_address);

                let city = '';
                if (place.address_components) {
                    for (const component of place.address_components) {
                        if (component.types.includes('locality')) {
                            city = component.long_name;
                            break;
                        }
                    }
                }

                onLocationSelect({
                    lat: loc.lat,
                    lng: loc.lng,
                    address: place.formatted_address,
                    city: city || place.formatted_address.split(',')[0]
                });
            }
        }
    };

    const mapContainerStyle = {
        width: '100%',
        height: '300px',
        borderRadius: '24px',
    };

    if (loadError) return <div className="p-4 bg-red-50 text-red-500 rounded-[24px]">{t('Error loading Google Maps')}</div>;
    if (!isLoaded) return <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-[24px] flex items-center justify-center text-gray-400 font-bold">{t('Loading maps...')}</div>;

    return (
        <div className="space-y-4">
            <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-muted group-focus-within:text-oflem-terracotta transition-colors">
                    <MagnifyingGlassIcon className="w-5 h-5" />
                </div>
                <Autocomplete
                    onLoad={onLoad}
                    onPlaceChanged={onPlaceChanged}
                    options={{ componentRestrictions: { country: "ch" } }}
                >
                    <input
                        type="text"
                        placeholder={t('Search for a location...')}
                        className="w-full pl-14 pr-6 py-4 bg-oflem-cream border-gray-border rounded-full text-sm font-bold focus:border-oflem-terracotta focus:ring-0 transition-all shadow-sm"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                    />
                </Autocomplete>
            </div>



            <div className="rounded-[24px] overflow-hidden border border-gray-border shadow-sm">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={location ? 15 : 8}
                    onClick={handleMapClick}
                    options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                        mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID",
                        styles: [
                            {
                                featureType: "all",
                                elementType: "geometry",
                                stylers: [{ color: "#f5f5f5" }]
                            },
                            {
                                featureType: "water",
                                elementType: "geometry",
                                stylers: [{ color: "#e9e9e9" }]
                            }
                        ]
                    }}
                >
                    {location && <AdvancedMarker position={location} />}
                </GoogleMap>
            </div>

            {location && (
                <div className="flex items-center gap-3 p-4 bg-oflem-charcoal rounded-[24px] border border-oflem-charcoal/10 shadow-elegant-glow group/address transition-all hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="w-10 h-10 rounded-full bg-oflem-terracotta/20 flex items-center justify-center flex-shrink-0 group-hover/address:bg-oflem-terracotta/30 transition-colors">
                        <MapPinIcon className="w-5 h-5 text-oflem-terracotta" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider text-oflem-terracotta mb-0.5">
                            {t('Selected Location')}
                        </p>
                        <p className="text-sm font-bold text-white truncate leading-tight">
                            {address}
                        </p>
                    </div>
                    <button 
                        onClick={() => {
                            setLocation(null);
                            setAddress('');
                            onLocationSelect({ lat: null, lng: null, address: '', city: '' });
                        }}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        title={t('Clear location')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
