import React, { useState, useRef, useEffect } from "react";
import { searchDishes } from "../utils/dishManager";

/**
 * DishAutocomplete Component
 * 
 * Suggests existing dishes from the database as the user types.
 * Shows community ratings for each suggestion.
 */
const DishAutocomplete = ({
  value,
  onChange,
  placeholder = "What did you eat?",
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const dishes = await searchDishes(query, 8);
      
      // Get stats for each dish
      const dishesWithStats = await Promise.all(
        dishes.map(async (dish) => {
          // Fetch dish stats
          const { data: stats } = await require("../utils/supabaseClient").default
            .from("dish_stats")
            .select("avg_rating, total_ratings")
            .eq("dish_id", dish.id)
            .single();

          return {
            ...dish,
            avgRating: stats?.avg_rating ? parseFloat(stats.avg_rating) : null,
            totalRatings: stats?.total_ratings || 0,
          };
        })
      );

      setSuggestions(dishesWithStats);
      setIsOpen(dishesWithStats.length > 0);
    } catch (error) {
      console.error("Error fetching dish suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    if (disabled) return;

    const inputValue = e.target.value;
    onChange(inputValue);

    // Debounce the search
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(inputValue);
    }, 300);
  };

  const handleSuggestionClick = (dish) => {
    if (disabled) return;

    onChange(dish.name);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
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
          onFocus={() =>
            !disabled && value.length >= 2 && suggestions.length > 0 && setIsOpen(true)
          }
          placeholder={placeholder}
          disabled={disabled}
          required
          className="w-full text-lg font-medium text-black border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black interaction-smooth disabled:bg-gray-50 disabled:text-gray-700 shadow-sm"
        />
        
        {/* Loading/Search Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {loading ? (
            <svg
              className="w-5 h-5 text-gray-400 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
          <div className="p-2 border-b border-gray-100">
            <p className="text-xs text-gray-500 font-light px-2">
              📊 Suggestions from community
            </p>
          </div>
          
          {suggestions.map((dish, index) => (
            <button
              key={dish.id}
              type="button"
              onClick={() => handleSuggestionClick(dish)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between border-b border-gray-50 last:border-b-0 group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black truncate group-hover:text-gray-900">
                  {dish.name}
                </p>
                {dish.cuisine_type && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {dish.cuisine_type}
                  </p>
                )}
              </div>
              
              {/* Community Rating Badge */}
              {dish.totalRatings > 0 && (
                <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-yellow-600">
                        {dish.avgRating.toFixed(1)}
                      </span>
                      <svg
                        className="w-4 h-4 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-400">
                      {dish.totalRatings} {dish.totalRatings === 1 ? 'rating' : 'ratings'}
                    </p>
                  </div>
                </div>
              )}
            </button>
          ))}
          
          <div className="p-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center font-light">
              💡 Select a dish to see community ratings, or type a new name
            </p>
          </div>
        </div>
      )}

      {/* No suggestions message */}
      {isOpen && suggestions.length === 0 && !loading && value.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
          <div className="text-center">
            <svg
              className="w-8 h-8 text-gray-300 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              />
            </svg>
            <p className="text-sm text-gray-600 font-medium mb-1">
              New dish! 🎉
            </p>
            <p className="text-xs text-gray-500 font-light">
              Be the first to rate "{value}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DishAutocomplete;
