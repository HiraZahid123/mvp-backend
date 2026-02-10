import React, { useEffect, useRef } from 'react';
import { useGoogleMap } from '@react-google-maps/api';

const AdvancedMarker = ({ position, title, draggable, onDragEnd }) => {
    const map = useGoogleMap();
    const markerRef = useRef(null);

    useEffect(() => {
        if (!map) return;

        let marker = null;

        const createMarker = async () => {
            const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
            
            marker = new AdvancedMarkerElement({
                map,
                position,
                title,
                gmpDraggable: draggable,
            });

            markerRef.current = marker;

            if (draggable && onDragEnd) {
                marker.addListener('dragend', (e) => {
                    // For compatibility with previous Marker event structure
                    // The dragend event in AdvancedMarkerElement doesn't give latLng directly in the same way
                    // We construct a compatible event object
                    const newPosition = marker.position;
                    // Check if newPosition is a LatLng object or Literal
                    // AdvancedMarkerElement.position can be LatLng or LatLngLiteral. 
                    // If it's LatLng, it has lat() and lng() methods.
                    // If it's Literal, it has lat and lng properties.
                    
                    let lat, lng;
                    if (typeof newPosition.lat === 'function') {
                        lat = newPosition.lat();
                        lng = newPosition.lng();
                    } else {
                        lat = newPosition.lat;
                        lng = newPosition.lng;
                    }

                    const syntheticEvent = {
                        latLng: {
                            lat: () => lat,
                            lng: () => lng,
                        }
                    };
                    onDragEnd(syntheticEvent);
                });
            }
        };

        createMarker();

        return () => {
            if (marker) {
                marker.map = null;
            }
        };
    }, [map]); // Re-create if map changes. Use separate effect for position updates.

    // Effect to update position if it changes externally
    useEffect(() => {
        if (markerRef.current && position) {
            markerRef.current.position = position;
        }
    }, [position]);

    return null;
};

export default AdvancedMarker;
