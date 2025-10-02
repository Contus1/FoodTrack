import React, { useState, useRef, useEffect } from 'react';

// Sample location suggestions - in a real app, this would come from an API
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
        .slice(0, 6); // Limit to 6 suggestions
      
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
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black transition-colors duration-200 font-light bg-white"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
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