import React from 'react';
import useTranslation from '@/Hooks/useTranslation';
import { Star } from 'lucide-react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';

const libraries = ['places'];

const MapMock = ({ showSocialProof = true }) => {
    const { t } = useTranslation();
    
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const mapContainerStyle = {
        width: '100%',
        height: '100%',
    };

    const center = { lat: 46.5197, lng: 6.6323 }; // Central Lausanne

    const mapOptions = {
        disableDefaultUI: true,
        zoomControl: false,
        scrollwheel: false,
        draggable: true,
        styles: [
            {
                "featureType": "all",
                "elementType": "geometry",
                "stylers": [{ "color": "#f5f5f5" }]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#616161" }]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.stroke",
                "stylers": [{ "color": "#f5f5f5" }]
            },
            {
                "featureType": "administrative.land_parcel",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#bdbdbd" }]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [{ "color": "#eeeeee" }]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#757575" }]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [{ "color": "#e5e5e5" }]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#9e9e9e" }]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [{ "color": "#ffffff" }]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#757575" }]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [{ "color": "#dadada" }]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#616161" }]
            },
            {
                "featureType": "road.local",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#9e9e9e" }]
            },
            {
                "featureType": "transit.line",
                "elementType": "geometry",
                "stylers": [{ "color": "#e5e5e5" }]
            },
            {
                "featureType": "transit.station",
                "elementType": "geometry",
                "stylers": [{ "color": "#eeeeee" }]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{ "color": "#c9c9c9" }]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#9e9e9e" }]
            }
        ]
    };

    return (
        <div className="map-mock p-6 bg-white rounded-rl shadow-sh">
            <div className="map-inner relative h-[500px] bg-zinc-100 rounded-r overflow-hidden shadow-inner isolate">
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={center}
                        zoom={13}
                        options={mapOptions}
                    >
                        {/* Interactive map is the background */}
                    </GoogleMap>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-400 font-bold bg-zinc-50 italic">
                        {loadError ? 'Map failed to load' : 'Initialisation de la carte...'}
                    </div>
                )}
                
                {/* Subtle Overlay to make markers pop */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-[0.5px] pointer-events-none z-10" />
                
                {/* Modern Radar Pulse */}
                <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-gradient-to-br from-oflem-terracotta to-oflem-terracotta-light rounded-full -translate-x-1/2 -translate-y-1/2 z-20 shadow-[0_0_0_8px_rgba(255,107,53,0.1)]" />
                <div className="radar-ring absolute top-1/2 left-1/2 w-[160px] h-[160px] border border-oflem-terracotta/40 rounded-full -translate-x-1/2 -translate-y-1/2 animate-radar z-20" />
                <div className="radar-ring absolute top-1/2 left-1/2 w-[160px] h-[160px] border border-oflem-terracotta/20 rounded-full -translate-x-1/2 -translate-y-1/2 animate-radar [animation-delay:1.5s] z-20" />
                
                {/* Center Callout */}
                <div className="map-center absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-white/95 backdrop-blur-sm p-5 rounded-rl shadow-2xl border-2 border-oflem-terracotta text-center min-w-[240px]">
                    <div className="w-10 h-1 bg-zinc-100 rounded-full mx-auto mb-3" />
                    <h4 className="text-[17px] font-black text-oflem-charcoal mb-1">{t('Votre demande')}</h4>
                    <p className="text-[13px] font-bold text-zinc-500 uppercase tracking-widest">{t('Lausanne · Rayon 15 km')}</p>
                </div>

                {/* Offer Card 1 - Best Offer */}
                <div className="map-card absolute top-[18%] left-[12%] bg-white rounded-2xl p-4 shadow-2xl min-w-[190px] border-2 border-oflem-green/30 animate-float z-30">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-black text-[11px]">LC</div>
                        <div>
                            <h5 className="text-[14px] font-black text-oflem-charcoal leading-none mb-1">Léa C.</h5>
                            {showSocialProof && (
                                <div className="flex gap-0.5">
                                    {[1,2,3,4,5].map(s => <Star key={s} size={10} className="text-[#FFD23F] fill-[#FFD23F]" />)}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-[20px] font-black text-oflem-green mb-1">CHF 20.–</div>
                    <div className="text-[10px] font-black bg-oflem-green/10 text-oflem-green px-2 py-1 rounded-md uppercase tracking-wide inline-block">Disponible</div>
                </div>

                {/* Offer Card 2 */}
                <div className="map-card absolute bottom-[20%] right-[15%] bg-white rounded-2xl p-4 shadow-2xl min-w-[180px] border-2 border-zinc-100 animate-float-delayed z-30">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-black text-[11px]">NA</div>
                        <div>
                            <h5 className="text-[14px] font-black text-oflem-charcoal leading-none mb-1">Noah A.</h5>
                            {showSocialProof && (
                                <div className="flex gap-0.5">
                                    {[1,2,3,4,5].map(s => <Star key={s} size={10} className="text-[#FFD23F] fill-[#FFD23F]" />)}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-[20px] font-black text-oflem-charcoal mb-1">CHF 25.–</div>
                    <div className="text-[10px] font-black bg-zinc-100 text-zinc-500 px-2 py-1 rounded-md uppercase tracking-wide inline-block">Dans 20 min</div>
                </div>
            </div>
            
            <div className="map-caption text-center mt-8">
                <span className="inline-block px-3 py-1 bg-zinc-100 rounded-full text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3">{t('Temps réel')}</span>
                <h3 className="text-[24px] font-black text-oflem-charcoal mb-2">{t('Les offres arrivent')}</h3>
                <p className="text-[15px] text-zinc-500 max-w-[400px] mx-auto leading-relaxed">
                    {t('Des prestataires vérifiés à proximité sont notifiés et vous répondent en quelques minutes.')}
                </p>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes radar {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; border-width: 2px; }
                    100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; border-width: 1px; }
                }
                .animate-radar {
                    animation: radar 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-12px); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-float-delayed { animation: float 6s ease-in-out infinite 3s; }
            `}} />
        </div>
    );
};

export default MapMock;
