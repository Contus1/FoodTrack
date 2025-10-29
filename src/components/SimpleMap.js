import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Enhanced coordinate mapping with lat/lng
const getLocationCoordinates = (locationName) => {
  if (!locationName) return null;
  
  const coords = {
    'new york': { lat: 40.7128, lng: -74.0060 },
    'los angeles': { lat: 34.0522, lng: -118.2437 },
    'chicago': { lat: 41.8781, lng: -87.6298 },
    'san francisco': { lat: 37.7749, lng: -122.4194 },
    'london': { lat: 51.5074, lng: -0.1278 },
    'paris': { lat: 48.8566, lng: 2.3522 },
    'tokyo': { lat: 35.6762, lng: 139.6503 },
    'berlin': { lat: 52.5200, lng: 13.4050 },
    'rome': { lat: 41.9028, lng: 12.4964 },
    'madrid': { lat: 40.4168, lng: -3.7038 },
  };
  
  const lowerName = locationName.toLowerCase().trim();
  if (coords[lowerName]) return coords[lowerName];
  
  for (const [key, value] of Object.entries(coords)) {
    if (lowerName.includes(key) || key.includes(lowerName)) return value;
  }
  
  return null;
};

const SimpleMap = ({ locations = [] }) => {
  const validLocations = useMemo(() => {
    return locations
      .map(loc => ({ ...loc, coordinates: getLocationCoordinates(loc.name) }))
      .filter(loc => loc.coordinates !== null);
  }, [locations]);

  if (locations.length === 0) {
    return (
      <div className="relative h-full w-full rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">Add locations to your entries to see them on the map</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden border border-gray-100">
      <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {validLocations.map((location, index) => (
          <Marker key={index} position={[location.coordinates.lat, location.coordinates.lng]}>
            <Popup>{location.name} - {location.count} visits</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default SimpleMap;
