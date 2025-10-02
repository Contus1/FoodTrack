import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEntries } from '../context/EntriesContext';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import SpiderChart from '../components/SpiderChart';
import FoodRecommendationEngine from '../utils/recommendationEngine';

const Insights = () => {
  const { user } = useAuth();
  const { entries, loading } = useEntries();
  const navigate = useNavigate();

  // Calculate insights from entries
  const insights = useMemo(() => {
    if (!entries || entries.length === 0) {
      return {
        totalDishes: 0,
        avgRating: 0,
        cuisineMap: {},
        spiceProfile: {},
        flavorProfile: {},
        tagFrequency: {},
        cuisineRatings: {},
        spiderChartData: {},
        entries: []
      };
    }

    const totalDishes = entries.length;
    const avgRating = entries.reduce((sum, entry) => sum + entry.rating, 0) / totalDishes;

    // Cuisine mapping (extract from tags)
    const cuisineMap = {};
    const tagFrequency = {};
    const spiceProfile = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const cuisineRatings = {};

    entries.forEach(entry => {
      // Count spice levels (ratings)
      spiceProfile[entry.rating]++;

      // Process tags
      if (entry.tags && Array.isArray(entry.tags)) {
        entry.tags.forEach(tag => {
          const lowerTag = tag.toLowerCase();
          tagFrequency[lowerTag] = (tagFrequency[lowerTag] || 0) + 1;

          // Identify cuisine tags
          const cuisines = ['thai', 'korean', 'italian', 'japanese', 'chinese', 'mexican', 'indian', 'french', 'american', 'mediterranean'];
          if (cuisines.includes(lowerTag)) {
            cuisineMap[lowerTag] = (cuisineMap[lowerTag] || 0) + 1;
            
            // Track cuisine ratings
            if (!cuisineRatings[lowerTag]) {
              cuisineRatings[lowerTag] = { total: 0, count: 0 };
            }
            cuisineRatings[lowerTag].total += entry.rating;
            cuisineRatings[lowerTag].count++;
          }
        });
      }
    });

    // Calculate average ratings for cuisines
    Object.keys(cuisineRatings).forEach(cuisine => {
      cuisineRatings[cuisine].avg = cuisineRatings[cuisine].total / cuisineRatings[cuisine].count;
    });

    // Get top flavor tags (excluding cuisine names)
    const flavorTags = ['spicy', 'creamy', 'noodles', 'cheese', 'seafood', 'bbq', 'sweet', 'savory', 'vegetarian', 'healthy'];
    const flavorProfile = {};
    flavorTags.forEach(flavor => {
      if (tagFrequency[flavor]) {
        flavorProfile[flavor] = tagFrequency[flavor];
      }
    });

    // Create spider chart data for main flavors
    const spiderChartData = {
      'Spicy': tagFrequency['spicy'] || 0,
      'Creamy': tagFrequency['creamy'] || 0,
      'Noodles': tagFrequency['noodles'] || 0,
      'Cheese': tagFrequency['cheese'] || 0,
      'Seafood': tagFrequency['seafood'] || 0,
      'BBQ': tagFrequency['bbq'] || 0,
    };

    return {
      totalDishes,
      avgRating: Math.round(avgRating * 10) / 10,
      cuisineMap,
      spiceProfile,
      flavorProfile,
      tagFrequency,
      cuisineRatings,
      spiderChartData,
      entries // Add entries for recommendations
    };
  }, [entries]);

  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Cool Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-6 bg-orange-400 rounded-full"></div>
                <h1 className="text-xl font-semibold text-black">
                  Food Insights
                </h1>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500 font-medium">Analytics</span>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6 max-w-md">
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (insights.totalDishes === 0) {
    const emptySpiderData = {
      'Spicy': 0,
      'Creamy': 0,
      'Noodles': 0,
      'Cheese': 0,
      'Seafood': 0,
      'BBQ': 0,
    };

    return (
      <div className="min-h-screen bg-white pb-16">
        {/* Sophisticated Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 z-10">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-1 h-8 bg-black rounded-full"></div>
                <h1 className="text-xl font-light tracking-wide text-black">
                  Analytics
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span className="text-xs text-gray-400 font-light tracking-wider uppercase">Insights</span>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="text-center py-12">
            <div className="text-5xl mb-6 opacity-20">📊</div>
            <h2 className="text-xl font-light text-black mb-3">Your Culinary Journey Awaits</h2>
            <p className="text-gray-500 mb-8 font-light">Add food entries to unlock your taste insights</p>
            
            {/* Preview of empty spider chart */}
            <div className="bg-white border border-gray-100 rounded-xl p-8 mb-8 max-w-md mx-auto">
              <h3 className="font-light text-black mb-6">Flavor Profile Preview</h3>
              <SpiderChart data={emptySpiderData} size={180} />
              <p className="text-xs text-gray-400 mt-4 font-light italic">This will reveal your taste patterns once you add entries</p>
            </div>
            
            <button
              onClick={() => navigate('/add')}
              className="bg-black text-white px-8 py-3 rounded-lg font-light tracking-wide hover:bg-gray-800 transition-colors duration-200"
            >
              Begin Your Journey
            </button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Sophisticated Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-1 h-8 bg-black rounded-full"></div>
              <h1 className="text-xl font-light tracking-wide text-black">
                Analytics
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span className="text-xs text-gray-400 font-light tracking-wider uppercase">{insights.totalDishes} Entries</span>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-8">

        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border border-gray-100 rounded-xl p-6 text-center">
            <div className="text-4xl font-light text-black mb-2">{insights.totalDishes}</div>
            <div className="text-sm text-gray-500 font-light tracking-wide uppercase">Creations</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-6 text-center">
            <div className="text-4xl font-light text-black mb-2">{insights.avgRating.toFixed(1)}</div>
            <div className="text-sm text-gray-500 font-light tracking-wide uppercase">Avg Rating</div>
          </div>
        </div>

        {/* Location Insights & Map */}
        {(() => {
          const locationStats = entries.reduce((acc, entry) => {
            if (entry.location) {
              acc[entry.location] = (acc[entry.location] || 0) + 1;
            }
            return acc;
          }, {});
          
          const totalLocations = Object.keys(locationStats).length;
          
          return totalLocations > 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-light text-black">Culinary Geography</h3>
                <span className="text-sm text-gray-400 font-light">{totalLocations} locations</span>
              </div>
              
              {/* Map Placeholder */}
              <div className="bg-gray-50 rounded-lg h-48 mb-6 flex items-center justify-center border border-gray-100">
                <div className="text-center">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-400 font-light">Interactive map coming soon</p>
                  <p className="text-xs text-gray-300 font-light mt-1">Your culinary journey visualized</p>
                </div>
              </div>
              
              {/* Location List */}
              <div className="space-y-3">
                {Object.entries(locationStats)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([location, count]) => (
                    <div key={location} className="flex justify-between items-center py-2">
                      <div className="flex items-center space-x-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        <span className="text-black font-light">{location}</span>
                      </div>
                      <span className="text-gray-400 text-sm font-light">{count} {count === 1 ? 'visit' : 'visits'}</span>
                    </div>
                  ))}
              </div>
            </div>
          ) : null;
        })()}

        {/* Cuisine Map */}
        {Object.keys(insights.cuisineMap).length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-8">
            <h3 className="text-lg font-light text-black mb-6">Cuisine Exploration</h3>
            <div className="space-y-4">
              {Object.entries(insights.cuisineMap)
                .sort(([,a], [,b]) => b - a)
                .map(([cuisine, count]) => {
                  const percentage = (count / insights.totalDishes) * 100;
                  return (
                    <div key={cuisine} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="capitalize text-black font-light">{cuisine}</span>
                        <span className="text-gray-400 text-sm font-light">{count} dishes ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-black h-2 rounded-full transition-all duration-700"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Rating Distribution */}
        <div className="bg-white border border-gray-100 rounded-xl p-8">
          <h3 className="text-lg font-light text-black mb-6">Rating Distribution</h3>
          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = insights.spiceProfile[rating] || 0;
              const percentage = insights.totalDishes > 0 ? (count / insights.totalDishes) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center space-x-4">
                  <div className="flex items-center w-16">
                    <span className="text-sm font-light text-black">{rating}</span>
                    <svg className="w-4 h-4 text-black ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div 
                        className="bg-black h-3 rounded-full transition-all duration-700"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400 w-12 text-right font-light">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Flavor Profile - Spider Chart */}
        {Object.values(insights.spiderChartData).some(value => value > 0) && (
          <div className="bg-white border border-gray-100 rounded-xl p-8">
            <h3 className="text-lg font-light text-black mb-6 text-center">Flavor Profile</h3>
            <div className="flex justify-center mb-6">
              <SpiderChart data={insights.spiderChartData} size={240} />
            </div>
            <p className="text-center text-sm text-gray-400 font-light italic">
              Your unique taste signature based on {insights.totalDishes} culinary experiences
            </p>
          </div>
        )}
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Each axis shows how often you enjoy different flavor categories
              </p>
            </div>
          </div>
        )}

        {/* Additional Flavor Details */}
        {Object.keys(insights.flavorProfile).length > 0 && (
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Flavor Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(insights.flavorProfile)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([flavor, count]) => {
                  const percentage = (count / insights.totalDishes) * 100;
                  return (
                    <div key={flavor} className="flex items-center">
                      <div className="w-20 text-sm capitalize text-gray-700">{flavor}</div>
                      <div className="flex-1 mx-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Food Preferences (Tags) */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Your Food Preferences</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(insights.tagFrequency)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 8)
              .map(([tag, count]) => (
                <span 
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700"
                >
                  #{tag} <span className="ml-1 font-medium">({count})</span>
                </span>
              ))}
          </div>
        </div>

        {/* Cuisine Ratings */}
        {Object.keys(insights.cuisineRatings).length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-8">
            <h3 className="text-lg font-light text-black mb-6">Cuisine Ratings</h3>
            <div className="space-y-4">
              {Object.entries(insights.cuisineRatings)
                .sort(([,a], [,b]) => b.avg - a.avg)
                .map(([cuisine, data]) => (
                  <div key={cuisine} className="flex items-center space-x-4">
                    <div className="w-20 text-sm capitalize text-black font-light">{cuisine}</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div 
                          className="bg-black h-3 rounded-full transition-all duration-700"
                          style={{ width: `${(data.avg / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400 w-12 text-right font-light">{data.avg.toFixed(1)}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Quick Recommendations Preview */}
        {insights.totalDishes >= 3 && (
          <QuickRecommendations insights={insights} navigate={navigate} />
        )}

        {/* Action Button */}
        <div className="text-center pt-6">
          <button
            onClick={() => navigate('/add')}
            className="bg-black text-white px-8 py-3 rounded-lg font-light tracking-wide hover:bg-gray-800 transition-colors duration-200"
          >
            Continue Journey
          </button>
        </div>

        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );

// Quick Recommendations Component
const QuickRecommendations = ({ insights, navigate }) => {
  const recommendations = useMemo(() => {
    const engine = new FoodRecommendationEngine();
    const userProfile = {
      entries: insights.entries,
      tagFrequency: insights.tagFrequency,
      avgRating: insights.avgRating,
      cuisineRatings: insights.cuisineRatings
    };
    return engine.generateRecommendations(userProfile);
  }, [insights]);

  if (recommendations.cuisines.length === 0) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 text-center">
      <h3 className="text-lg font-light text-black mb-3">🎯 Recommended: {recommendations.cuisines[0]?.name}</h3>
      <p className="text-gray-500 text-sm mb-4 font-light">
        {recommendations.tips[0] || "Based on your taste profile, this could be your next favorite!"}
      </p>
      <button
        onClick={() => navigate('/recommendations')}
        className="bg-black text-white px-6 py-2 rounded-lg text-sm font-light tracking-wide hover:bg-gray-800 transition-colors duration-200"
      >
        Explore Recommendations
      </button>
    </div>
  );
};

export default Insights;
