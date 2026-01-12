import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, Marker, Circle, useLoadScript } from '@react-google-maps/api';
import useTranslation from '@/Hooks/useTranslation';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import BackButton from '@/Components/BackButton';

const libraries = ['places'];

export default function CompleteProfile() {
    const { user } = usePage().props;
    const { t } = useTranslation();
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(user?.avatar || "/default-avatar.svg");
    const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [radius, setRadius] = useState(10);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const { data, setData, post, processing, errors } = useForm({
        name: user?.name || '',
        zip_code: '',
        location_address: '',
        location_lat: null,
        location_lng: null,
        discovery_radius_km: 25,
        avatar: null,
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('avatar', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleMapClick = useCallback((event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        setSelectedLocation({ lat, lng });
        setData(prev => ({
            ...prev,
            location_lat: lat,
            location_lng: lng,
        }));

        if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const addressComponents = results[0].address_components;
                    let zipCode = '';
                    
                    for (const component of addressComponents) {
                        if (component.types.includes('postal_code')) {
                            zipCode = component.long_name;
                            break;
                        }
                    }

                    setData(prev => ({
                        ...prev,
                        location_lat: lat,
                        location_lng: lng,
                        location_address: results[0].formatted_address,
                        zip_code: zipCode || prev.zip_code
                    }));
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
        post(route('auth.complete-profile'));
    };

    const mapContainerStyle = {
        width: '100%',
        height: '240px',
        borderRadius: '1.5rem'
    };

    const circleOptions = {
        strokeColor: '#D4AF37',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#D4AF37',
        fillOpacity: 0.1,
        clickable: false,
        radius: radius * 1000,
        center: selectedLocation || mapCenter,
    };

    return (
        <AuthSplitLayout
            heroImage="/basic-profile.svg"
            heroHeading={t("Welcome")}
            heroSubtext={t("Oflem makes life easy by connecting people to hire help or earn money by completing tasks quickly and reliably.")}
            bgAccentClass="bg-cream-accent"
        >
            <Head title={t("Complete Profile")} />
            
            <div className="mb-8 lg:mb-10 text-center lg:text-left relative">
                 <BackButton 
                    href={route('auth.select-role')} 
                    className="absolute -top-12 left-0" 
                />

                <h2 className="text-lg font-medium text-primary-black mb-1">{t('Promise, this is the last thing')}</h2>
                <h1 className="text-[32px] lg:text-[40px] font-black text-primary-black tracking-tight mb-2">
                    {t('Just your area. After that, Oflem handles it.')}
                </h1>
                <div className="flex flex-col items-center w-full mt-6 mb-2">
                    <div className="relative mb-2">
                        <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-border overflow-hidden hover:bg-gold-accent transition-colors group"
                        >
                             <svg className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="text-xs font-black text-gray-muted hover:text-primary-black transition-colors"
                    >
                        {t('Edit Profile')}
                    </button>
                </div>
                </div>


            <form onSubmit={submit} className="space-y-5 pb-8">
                <div className="space-y-1.5">
                    <InputLabel htmlFor="name" value={t('Full Name')} />
                    <TextInput
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder={t('Enter Your Name')}
                        autoComplete="name"
                        required
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="space-y-1.5">
                    <InputLabel htmlFor="zip_code" value={t('ZIP Code')} />
                    <TextInput
                        id="zip_code"
                        type="text"
                        value={data.zip_code}
                        onChange={(e) => setData('zip_code', e.target.value)}
                        placeholder={t("e.g. 10001")}
                        required
                    />
                    <InputError message={errors.zip_code} />
                </div>

                <div className="space-y-1.5">
                    <InputLabel htmlFor="location_address" value={t('Location')} />
                    <TextInput
                        id="location_address"
                        type="text"
                        value={data.location_address}
                        onChange={(e) => setData('location_address', e.target.value)}
                        placeholder={t("New York City, USA")}
                        required
                    />
                    <InputError message={errors.location_address} />
                </div>

                <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center px-4">
                        <div>
                            <InputLabel value={t('Radius')} className="ml-0" />
                            <p className="text-[10px] text-gray-muted font-bold">{t('Pick a radius to make tasking easier')}</p>
                        </div>
                        <span className="text-sm font-black text-primary-black">{radius} km</span>
                    </div>
                    
                    <div className="px-4">
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={radius}
                            onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-accent"
                        />
                    </div>

                    <div className="rounded-[24px] overflow-hidden border border-gray-border relative mx-4">
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={selectedLocation || mapCenter}
                                zoom={11}
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
                                            center={selectedLocation}
                                            options={circleOptions}
                                        />
                                    </>
                                )}
                            </GoogleMap>
                        ) : (
                            <div className="w-full h-[240px] bg-gray-100 flex items-center justify-center italic text-gray-400">
                                {loadError ? 'Error loading maps' : 'Loading map...'}
                            </div>
                        )}
                    </div>
                </div>

                {errors.general && <p className="text-red-500 text-sm font-bold text-center">{errors.general}</p>}
                {errors.avatar && <p className="text-red-500 text-sm font-bold text-center">{errors.avatar}</p>}

                <div className="pt-4">
                    <PrimaryButton className="w-full" disabled={processing}>
                        {t('Complete Profile')}
                    </PrimaryButton>
                </div>
            </form>
        </AuthSplitLayout>
    );
}
