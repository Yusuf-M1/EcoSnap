"use client";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useEffect, useRef, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import "leaflet-defaulticon-compatibility";

export default function ReportMap({ setCoordinates, coordinates }) {
    const markerRef = useRef(null);

    // 1. Logic to handle "Drag to Pinpoint"
    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const { lat, lng } = marker.getLatLng();
                    setCoordinates({ lat, lng });
                }
            },
        }),
        [setCoordinates],
    );

    // 2. Logic to handle "Click to Pinpoint"
    const MapClick = () => {
        useMapEvents({
            click(e) {
                setCoordinates(e.latlng);
            },
        });
        return null;
    };

    return (
        <MapContainer
            center={[coordinates.lat, coordinates.lng]} // Default center
            zoom={15}
            scrollWheelZoom={true} // ENABLE MOUSE ZOOM
            style={{ height: "100%", width: "100%", borderRadius: "1.5rem" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
                draggable={true}
                eventHandlers={eventHandlers}
                position={coordinates}
                ref={markerRef}
            />
            <MapClick />
        </MapContainer>
    );
}