import React, { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";

// Component to auto-fit bounds when locations change
const FitBounds = ({ locations }) => {
  const map = useMap();
  
  useEffect(() => {
    if (locations && locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map(loc => [loc.coordinates.lat, loc.coordinates.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [locations, map]);
  
  return null;
};

// Custom marker icon with food emoji
const createCustomIcon = (rating) => {
  const color = rating >= 8 ? '#22c55e' : rating >= 5 ? '#eab308' : '#ef4444';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 16px;
        ">🍽️</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Geocoding function using Nominatim (OpenStreetMap) - disabled during build
const geocodeLocation = async (locationName) => {
  // Skip during build process
  if (typeof window === 'undefined') return null;
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Enhanced coordinate mapping with many cities
const getLocationCoordinates = (locationName) => {
  if (!locationName) return null;

  const coords = {
    // Germany
    "berlin": { lat: 52.5200, lng: 13.4050 },
    "munich": { lat: 48.1351, lng: 11.5820 },
    "münchen": { lat: 48.1351, lng: 11.5820 },
    "hamburg": { lat: 53.5511, lng: 9.9937 },
    "frankfurt": { lat: 50.1109, lng: 8.6821 },
    "cologne": { lat: 50.9375, lng: 6.9603 },
    "köln": { lat: 50.9375, lng: 6.9603 },
    "düsseldorf": { lat: 51.2277, lng: 6.7735 },
    "stuttgart": { lat: 48.7758, lng: 9.1829 },
    
    // USA
    "new york": { lat: 40.7128, lng: -74.0060 },
    "los angeles": { lat: 34.0522, lng: -118.2437 },
    "chicago": { lat: 41.8781, lng: -87.6298 },
    "san francisco": { lat: 37.7749, lng: -122.4194 },
    "miami": { lat: 25.7617, lng: -80.1918 },
    "seattle": { lat: 47.6062, lng: -122.3321 },
    "boston": { lat: 42.3601, lng: -71.0589 },
    
    // Europe
    "london": { lat: 51.5074, lng: -0.1278 },
    "paris": { lat: 48.8566, lng: 2.3522 },
    "rome": { lat: 41.9028, lng: 12.4964 },
    "madrid": { lat: 40.4168, lng: -3.7038 },
    "barcelona": { lat: 41.3851, lng: 2.1734 },
    "amsterdam": { lat: 52.3676, lng: 4.9041 },
    "vienna": { lat: 48.2082, lng: 16.3738 },
    "wien": { lat: 48.2082, lng: 16.3738 },
    "prague": { lat: 50.0755, lng: 14.4378 },
    "budapest": { lat: 47.4979, lng: 19.0402 },
    
    // Asia
    "tokyo": { lat: 35.6762, lng: 139.6503 },
    "beijing": { lat: 39.9042, lng: 116.4074 },
    "shanghai": { lat: 31.2304, lng: 121.4737 },
    "seoul": { lat: 37.5665, lng: 126.9780 },
    "singapore": { lat: 1.3521, lng: 103.8198 },
    "bangkok": { lat: 13.7563, lng: 100.5018 },
    "dubai": { lat: 25.2048, lng: 55.2708 },
    
    // Others
    "sydney": { lat: -33.8688, lng: 151.2093 },
    "melbourne": { lat: -37.8136, lng: 144.9631 },
    "toronto": { lat: 43.6532, lng: -79.3832 },
    "mexico city": { lat: 19.4326, lng: -99.1332 },
    "são paulo": { lat: -23.5505, lng: -46.6333 },
    "rio de janeiro": { lat: -22.9068, lng: -43.1729 },
  };

  const lowerName = locationName.toLowerCase().trim();
  if (coords[lowerName]) return coords[lowerName];

  // Try partial match
  for (const [key, value] of Object.entries(coords)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      return value;
    }
  }

  return null;
};

const SimpleMap = ({ entries = [] }) => {
  const navigate = useNavigate();
  const [geocodedLocations, setGeocodedLocations] = useState({});
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component only renders client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Process entries to get locations with coordinates
  const entriesWithLocations = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    
    return entries
      .filter(entry => entry.location)
      .map(entry => {
        const cachedCoords = geocodedLocations[entry.location];
        const staticCoords = getLocationCoordinates(entry.location);
        
        return {
          ...entry,
          coordinates: cachedCoords || staticCoords,
        };
      })
      .filter(entry => entry.coordinates !== null);
  }, [entries, geocodedLocations]);

  // Geocode locations that don't have coordinates yet
  useEffect(() => {
    const locationsToGeocode = entries
      .filter(entry => entry.location)
      .map(entry => entry.location)
      .filter(location => 
        !geocodedLocations[location] && !getLocationCoordinates(location)
      );

    if (locationsToGeocode.length > 0 && !loading) {
      setLoading(true);
      
      // Geocode one location at a time with delay to respect rate limits
      const geocodeSequentially = async () => {
        for (const location of locationsToGeocode.slice(0, 5)) { // Limit to 5 at once
          const coords = await geocodeLocation(location);
          if (coords) {
            setGeocodedLocations(prev => ({
              ...prev,
              [location]: coords,
            }));
          }
          // Wait 1 second between requests (Nominatim rate limit)
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        setLoading(false);
      };
      
      geocodeSequentially();
    }
  }, [entries, geocodedLocations, loading]);

  // Calculate center point
  const centerPosition = useMemo(() => {
    if (entriesWithLocations.length === 0) {
      return [51.1657, 10.4515]; // Center of Germany as default
    }
    
    const avgLat = entriesWithLocations.reduce((sum, loc) => sum + loc.coordinates.lat, 0) / entriesWithLocations.length;
    const avgLng = entriesWithLocations.reduce((sum, loc) => sum + loc.coordinates.lng, 0) / entriesWithLocations.length;
    
    return [avgLat, avgLng];
  }, [entriesWithLocations]);

  // Don't render map during SSR/build
  if (!isMounted) {
    return (
      <div className="relative h-full w-full rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6">
          <span className="text-4xl mb-2 block">🗺️</span>
          <p className="text-sm text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="relative h-full w-full rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6">
          <span className="text-4xl mb-2 block">🗺️</span>
          <p className="text-sm text-gray-500">
            Add entries with locations to see your food journey
          </p>
        </div>
      </div>
    );
  }

  if (entriesWithLocations.length === 0) {
    return (
      <div className="relative h-full w-full rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6">
          <span className="text-4xl mb-2 block">📍</span>
          <p className="text-sm text-gray-500 mb-2">
            {loading ? 'Finding locations on map...' : 'No locations found'}
          </p>
          <p className="text-xs text-gray-400">
            Try adding city names to your entries
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        center={centerPosition}
        zoom={entriesWithLocations.length === 1 ? 12 : 5}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        <FitBounds locations={entriesWithLocations} />
        
        {entriesWithLocations.map((entry, index) => (
          <Marker
            key={`${entry.id}-${index}`}
            position={[entry.coordinates.lat, entry.coordinates.lng]}
            icon={createCustomIcon(entry.rating || 3)}
          >
            <Popup maxWidth={280} className="custom-popup">
              <div className="p-2">
                {entry.photo_url && (Array.isArray(entry.photo_url) ? entry.photo_url[0] : entry.photo_url) && (
                  <img
                    src={Array.isArray(entry.photo_url) ? entry.photo_url[0] : entry.photo_url}
                    alt={entry.title}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                )}
                <h3 className="font-medium text-gray-900 text-sm mb-1">
                  {entry.title || 'Unnamed Dish'}
                </h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">📍 {entry.location}</span>
                  <span className="text-xs font-medium text-yellow-600">
                    {entry.rating ? `${entry.rating}⭐` : 'No rating'}
                  </span>
                </div>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {entry.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => navigate(`/add?view=${entry.id}`)}
                  className="w-full mt-2 text-xs bg-black text-white py-1.5 px-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md z-10 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-gray-700">Rating 8-10</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          <span className="text-gray-700">Rating 5-7</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="text-gray-700">Rating 1-4</span>
        </div>
      </div>
      
      {/* Entry count badge */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md z-10">
        <span className="text-xs font-medium text-gray-700">
          📍 {entriesWithLocations.length} {entriesWithLocations.length === 1 ? 'location' : 'locations'}
        </span>
      </div>
    </div>
  );
};

export default SimpleMap;
