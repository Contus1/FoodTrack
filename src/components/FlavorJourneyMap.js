import React, { useState, useEffect, useCallback } from 'react';
import { useSocial } from '../context/SocialContext';
import { useEntries } from '../context/EntriesContext';

const FlavorJourneyMap = () => {
  const { getSocialFeed } = useSocial();
  const { entries } = useEntries();
  const [allEntries, setAllEntries] = useState([]);
  const [selectedCuisine, setSelectedCuisine] = useState(null);
  const [hoveredEntry, setHoveredEntry] = useState(null);

  const loadEntries = useCallback(async () => {
    try {
      const socialEntries = await getSocialFeed(50);
      const combinedEntries = [...entries, ...socialEntries];
      setAllEntries(combinedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  }, [entries, getSocialFeed]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Extract cuisine types from tags and locations
  const getCuisineTypes = () => {
    const cuisines = new Set();
    allEntries.forEach(entry => {
      entry.tags?.forEach(tag => {
        if (tag.toLowerCase().includes('cuisine') || 
            ['italian', 'chinese', 'mexican', 'indian', 'japanese', 'french', 'thai', 'korean', 'mediterranean', 'american'].includes(tag.toLowerCase())) {
          cuisines.add(tag);
        }
      });
      
      // Also extract from location if it contains cuisine hints
      if (entry.location) {
        ['pizza', 'sushi', 'taco', 'burger', 'pasta', 'curry', 'ramen', 'bbq'].forEach(keyword => {
          if (entry.location.toLowerCase().includes(keyword)) {
            cuisines.add(keyword.charAt(0).toUpperCase() + keyword.slice(1));
          }
        });
      }
    });
    return Array.from(cuisines);
  };

  // Create a flavor map based on ratings and connections (optimized)
  const getFlavorConnections = () => {
    const cuisines = getCuisineTypes().slice(0, 8); // Limit to 8 cuisines for performance
    const connections = [];
    
    cuisines.forEach((cuisine, i) => {
      const entriesForCuisine = allEntries.filter(entry => 
        entry.tags?.some(tag => tag.toLowerCase().includes(cuisine.toLowerCase())) ||
        entry.location?.toLowerCase().includes(cuisine.toLowerCase())
      );
      
      const avgRating = entriesForCuisine.length > 0 
        ? entriesForCuisine.reduce((sum, entry) => sum + (entry.rating || 0), 0) / entriesForCuisine.length 
        : 0;
      
      connections.push({
        cuisine,
        entries: entriesForCuisine,
        avgRating,
        angle: (i / cuisines.length) * 2 * Math.PI,
        radius: 80 + (avgRating * 15) // Reduced radius for better performance
      });
    });
    
    return connections;
  };

  const flavorConnections = getFlavorConnections();

  // Helper function to get cuisine colors
  // eslint-disable-next-line no-unused-vars
  const getCuisineColor = (cuisine) => {
    const colors = {
      'italian': 'from-red-400 to-green-400',
      'chinese': 'from-red-500 to-yellow-400',
      'mexican': 'from-green-400 to-red-500',
      'indian': 'from-orange-400 to-red-500',
      'japanese': 'from-pink-400 to-indigo-400',
      'french': 'from-purple-400 to-blue-400',
      'thai': 'from-green-400 to-orange-400',
      'korean': 'from-red-400 to-purple-400',
      'mediterranean': 'from-blue-400 to-green-400',
      'american': 'from-blue-500 to-red-500'
    };
    
    return colors[cuisine.toLowerCase()] || 'from-gray-400 to-gray-600';
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-3xl p-4 sm:p-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <pattern id="flavor-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#flavor-pattern)" />
        </svg>
      </div>

      <div className="relative z-10">
        <h2 className="text-xl sm:text-2xl font-light text-center mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          🌟 Flavor Journey Map
        </h2>
        <p className="text-center text-gray-600 text-xs sm:text-sm mb-6 sm:mb-8">
          Explore the constellation of cuisines in your culinary universe
        </p>

        {/* Interactive Flavor Map - Optimized for performance */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="relative">
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 300 300" 
              className="w-64 h-64 sm:w-80 sm:h-80 drop-shadow-lg"
            >
              {/* Central hub */}
              <circle
                cx={150}
                cy={150}
                r="25"
                fill="url(#centralGradient)"
                className="animate-pulse"
              />
              
              {/* Gradient definitions */}
              <defs>
                <radialGradient id="centralGradient" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </radialGradient>
                {flavorConnections.slice(0, 6).map((connection, i) => (
                  <linearGradient key={i} id={`gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                ))}
              </defs>

              {/* Connection lines - Reduced for performance */}
              {flavorConnections.slice(0, 6).map((connection, i) => {
                const x = 150 + Math.cos(connection.angle) * (connection.radius * 0.7);
                const y = 150 + Math.sin(connection.angle) * (connection.radius * 0.7);
                
                return (
                  <g key={i}>
                    <line
                      x1={150}
                      y1={150}
                      x2={x}
                      y2={y}
                      stroke="url(#centralGradient)"
                      strokeWidth={Math.max(1, connection.avgRating)}
                      opacity="0.4"
                    />
                    
                    {/* Cuisine nodes */}
                    <circle
                      cx={x}
                      cy={y}
                      r={6 + Math.min(connection.entries.length, 3)}
                      fill={`url(#gradient-${i})`}
                      className="cursor-pointer transition-transform duration-200 hover:scale-110"
                      onMouseEnter={() => setHoveredEntry(connection)}
                      onMouseLeave={() => setHoveredEntry(null)}
                      onClick={() => setSelectedCuisine(connection)}
                    />
                    
                    {/* Cuisine labels */}
                    <text
                      x={x + (Math.cos(connection.angle) * 20)}
                      y={y + (Math.sin(connection.angle) * 20)}
                      textAnchor="middle"
                      className="text-xs font-medium fill-gray-700"
                    >
                      {connection.cuisine.length > 8 ? connection.cuisine.slice(0, 8) + '...' : connection.cuisine}
                    </text>
                  </g>
                );
              })}

              {/* Central label */}
              <text
                x={150}
                y={155}
                textAnchor="middle"
                className="text-sm font-medium fill-white"
              >
                You
              </text>
            </svg>

            {/* Hover tooltip */}
            {hoveredEntry && (
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/20 min-w-[200px]">
                <h3 className="font-medium text-gray-900 mb-2">{hoveredEntry.cuisine}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Dishes: {hoveredEntry.entries.length}</div>
                  <div>Avg Rating: ⭐ {hoveredEntry.avgRating.toFixed(1)}/10</div>
                  <div className="text-xs mt-2">
                    {hoveredEntry.entries.slice(0, 3).map(entry => entry.title).join(', ')}
                    {hoveredEntry.entries.length > 3 && '...'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cuisine Detail Panel */}
        {selectedCuisine && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                🍽️ {selectedCuisine.cuisine} Journey
              </h3>
              <button
                onClick={() => setSelectedCuisine(null)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-white/50"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedCuisine.entries.slice(0, 6).map((entry, i) => (
                <div key={i} className="bg-white/50 rounded-xl p-3 border border-white/30">
                  <div className="flex items-center space-x-3">
                    {entry.photo_url ? (
                      <img
                        src={entry.photo_url}
                        alt={entry.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                        🍽️
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {entry.title}
                      </h4>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-yellow-500">
                          {'⭐'.repeat(Math.min(entry.rating || 0, 10))}
                        </span>
                        <span className="text-xs text-gray-500">
                          {entry.rating}/10
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedCuisine.entries.length > 6 && (
              <div className="text-center mt-4">
                <span className="text-sm text-gray-500">
                  +{selectedCuisine.entries.length - 6} more dishes
                </span>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex justify-center mt-6">
          <div className="bg-white/50 backdrop-blur-sm rounded-full px-6 py-3 text-xs text-gray-600 border border-white/20">
            💫 Node size = number of dishes • Line thickness = average rating
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlavorJourneyMap;