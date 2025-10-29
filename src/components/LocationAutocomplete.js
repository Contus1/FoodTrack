import React, { useState, useRef, useEffect } from 'react';

/**
 * LocationAutocomplete Component
 * 
 * For production use with Google Places API:
 * 1. Get API key from: https://console.cloud.google.com/
 * 2. Enable "Places API" in Google Cloud Console
 * 3. Add to .env: REACT_APP_GOOGLE_PLACES_API_KEY=your_key_here
 * 4. Load script in public/index.html:
 *    <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&libraries=places"></script>
 * 5. Use Google Places Autocomplete service in this component
 */

// Sample location suggestions - replaced with Google Places API in production
const LOCATION_SUGGESTIONS = [
  // Major Cities
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
  'Austin, TX', 'Jacksonville, FL', 'San Francisco, CA', 'Columbus, OH', 'Charlotte, NC',
  'Fort Worth, TX', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Boston, MA',
  'Washington, DC', 'Nashville, TN', 'Las Vegas, NV', 'Portland, OR', 'Detroit, MI',
  'Memphis, TN', 'Louisville, KY', 'Baltimore, MD', 'Milwaukee, WI', 'Albuquerque, NM',
  
  // Countries
  'United States', 'Canada', 'Mexico', 'United Kingdom', 'France', 'Germany', 'Italy',
  'Spain', 'Japan', 'China', 'India', 'Brazil', 'Argentina', 'Australia', 'New Zealand',
  'South Korea', 'Thailand', 'Vietnam', 'Indonesia', 'Malaysia', 'Singapore', 'Philippines',
  
  // Popular Food Destinations
  'Paris, France', 'Tokyo, Japan', 'Bangkok, Thailand', 'Istanbul, Turkey', 'Mumbai, India',
  'Hong Kong', 'Barcelona, Spain', 'Rome, Italy', 'Berlin, Germany', 'Amsterdam, Netherlands',
  'Prague, Czech Republic', 'Budapest, Hungary', 'Vienna, Austria', 'Copenhagen, Denmark',
  'Stockholm, Sweden', 'Oslo, Norway', 'Helsinki, Finland', 'Dublin, Ireland', 'Edinburgh, Scotland',
  'London, England', 'Manchester, England', 'Liverpool, England', 'Cardiff, Wales',
  'Edinburgh, Scotland', 'Glasgow, Scotland', 'Montreal, Canada', 'Toronto, Canada',
  'Vancouver, Canada', 'Quebec City, Canada', 'Sydney, Australia', 'Melbourne, Australia',
  'Auckland, New Zealand', 'Wellington, New Zealand'
];

const LocationAutocomplete = ({ value, onChange, placeholder = "Where did you eat this?", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.length > 0) {
      const filteredSuggestions = LOCATION_SUGGESTIONS
        .filter(location => 
          location.toLowerCase().includes(inputValue.toLowerCase())
        )
        .slice(0, 8); // Increased to 8 suggestions
      
      setSuggestions(filteredSuggestions);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Use reverse geocoding to get location name
          const { latitude, longitude } = position.coords;
          
          // Using OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          // Format the location nicely
          const city = data.address.city || data.address.town || data.address.village;
          const state = data.address.state;
          const country = data.address.country;
          
          let locationString = '';
          if (city && state) {
            locationString = `${city}, ${state}`;
          } else if (city && country) {
            locationString = `${city}, ${country}`;
          } else if (state && country) {
            locationString = `${state}, ${country}`;
          } else {
            locationString = country || 'Current Location';
          }
          
          onChange(locationString);
          setIsGettingLocation(false);
        } catch (error) {
          console.error('Error getting location name:', error);
          onChange(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please enter it manually.');
        setIsGettingLocation(false);
      }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length > 0 && suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-24 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black transition-colors duration-200 font-light bg-white"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isGettingLocation}
            className="p-2 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-50 disabled:opacity-50"
            title="Use current location"
          >
            {isGettingLocation ? (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
            )}
          </button>
          <div className="h-4 w-px bg-gray-200"></div>
          <div className="p-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          </div>
        </div>
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left text-black font-light hover:bg-gray-50 transition-colors duration-150 flex items-center space-x-3 border-b border-gray-50 last:border-b-0"
            >
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span className="truncate">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;