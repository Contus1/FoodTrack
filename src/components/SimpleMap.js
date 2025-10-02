import React, { useEffect, useRef } from 'react';

const SimpleMap = ({ locations = [] }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || locations.length === 0) return;

    // Simple map implementation using basic HTML5 canvas or SVG
    // For a really simple solution, we'll create a world map with markers
    
    const canvas = mapRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw simple world outline
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw simple continents (very basic shapes)
    ctx.fillStyle = '#e9ecef';
    
    // North America (rough shape)
    ctx.beginPath();
    ctx.ellipse(120, 80, 60, 40, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Europe/Asia
    ctx.beginPath();
    ctx.ellipse(280, 70, 80, 35, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // South America
    ctx.beginPath();
    ctx.ellipse(140, 150, 25, 50, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Africa
    ctx.beginPath();
    ctx.ellipse(220, 120, 30, 45, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Australia
    ctx.beginPath();
    ctx.ellipse(320, 160, 25, 15, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add location markers
    ctx.fillStyle = '#000000';
    locations.forEach((location, index) => {
      const coords = getLocationCoordinates(location.name);
      if (coords) {
        // Draw marker
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add count badge
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(coords.x + 8, coords.y - 8, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(location.count.toString(), coords.x + 8, coords.y - 4);
        ctx.fillStyle = '#000000';
      }
    });
    
  }, [locations]);

  // Simple coordinate mapping for common locations
  const getLocationCoordinates = (locationName) => {
    const coords = {
      // North America
      'canada': { x: 100, y: 60 },
      'united states': { x: 120, y: 80 },
      'new york': { x: 140, y: 75 },
      'los angeles': { x: 90, y: 85 },
      'chicago': { x: 125, y: 75 },
      'toronto': { x: 135, y: 65 },
      'vancouver': { x: 85, y: 60 },
      'mexico': { x: 105, y: 100 },
      
      // Europe
      'united kingdom': { x: 250, y: 65 },
      'france': { x: 260, y: 70 },
      'germany': { x: 270, y: 65 },
      'italy': { x: 275, y: 75 },
      'spain': { x: 255, y: 75 },
      'london': { x: 250, y: 65 },
      'paris': { x: 260, y: 70 },
      'rome': { x: 275, y: 75 },
      'berlin': { x: 270, y: 65 },
      'amsterdam': { x: 265, y: 65 },
      
      // Asia
      'japan': { x: 350, y: 80 },
      'china': { x: 320, y: 80 },
      'south korea': { x: 340, y: 80 },
      'thailand': { x: 310, y: 95 },
      'india': { x: 300, y: 90 },
      'tokyo': { x: 350, y: 80 },
      'beijing': { x: 320, y: 75 },
      'seoul': { x: 340, y: 80 },
      'bangkok': { x: 310, y: 95 },
      'mumbai': { x: 295, y: 90 },
      
      // Australia/Oceania
      'australia': { x: 330, y: 160 },
      'new zealand': { x: 360, y: 170 },
      'sydney': { x: 340, y: 160 },
      'melbourne': { x: 335, y: 165 },
      
      // South America
      'brazil': { x: 150, y: 140 },
      'argentina': { x: 145, y: 170 },
      'chile': { x: 140, y: 170 },
      
      // Africa
      'south africa': { x: 230, y: 160 },
      'egypt': { x: 230, y: 100 },
      'morocco': { x: 210, y: 95 },
    };
    
    const lowerName = locationName.toLowerCase();
    
    // Try exact match first
    if (coords[lowerName]) {
      return coords[lowerName];
    }
    
    // Try partial matches
    for (const [key, value] of Object.entries(coords)) {
      if (lowerName.includes(key) || key.includes(lowerName)) {
        return value;
      }
    }
    
    // Default position if location not found
    return { x: 200, y: 100 };
  };

  return (
    <div className="relative">
      <canvas
        ref={mapRef}
        width={400}
        height={200}
        className="w-full h-48 rounded-lg border border-gray-100"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      
      {/* Legend */}
      <div className="mt-3 text-center">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <span>Food locations</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-white border border-black rounded-full flex items-center justify-center text-xs">
              <span className="text-black font-light">N</span>
            </div>
            <span>Visit count</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleMap;