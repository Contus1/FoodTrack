import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEntries } from '../context/EntriesContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import SpiderChart from '../components/SpiderChart';

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
        spiderChartData: {}
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
      spiderChartData
    };
  }, [entries]);

  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-6 max-w-md">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
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
      <div className="min-h-screen bg-gray-50 pb-16">
        <Header />
        <div className="container mx-auto px-4 py-6 max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Food Journey</h1>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-500 mb-4">No data yet!</p>
            <p className="text-sm text-gray-400 mb-6">Add some food entries to see your insights</p>
            
            {/* Preview of empty spider chart */}
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Your Flavor Profile Preview</h3>
              <SpiderChart data={emptySpiderData} size={180} />
              <p className="text-xs text-gray-400 mt-2">This will show your taste patterns once you add entries</p>
            </div>
            
            <button
              onClick={() => navigate('/add')}
              className="bg-primary-500 text-white px-6 py-3 rounded-full font-medium hover:bg-primary-600 transition-colors"
            >
              Add Your First Entry
            </button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Food Journey</h1>
          <p className="text-gray-600 text-sm">Discover your taste patterns and explore new flavors</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-primary-600">{insights.totalDishes}</div>
            <div className="text-sm text-gray-600">Dishes Tried</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-primary-600">{insights.avgRating}</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </div>
        </div>

        {/* Cuisine Map */}
        {Object.keys(insights.cuisineMap).length > 0 && (
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Your Cuisine Map</h3>
            <div className="space-y-2">
              {Object.entries(insights.cuisineMap)
                .sort(([,a], [,b]) => b - a)
                .map(([cuisine, count]) => (
                  <div key={cuisine} className="flex justify-between items-center">
                    <span className="capitalize text-gray-700">{cuisine}</span>
                    <span className="text-primary-600 font-medium">({count})</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Rating Distribution */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Your Rating Profile</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = insights.spiceProfile[rating] || 0;
              const percentage = insights.totalDishes > 0 ? (count / insights.totalDishes) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center">
                  <div className="flex items-center w-12">
                    <span className="text-sm font-medium">{rating}</span>
                    <span className="text-yellow-400 ml-1">⭐</span>
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Flavor Profile - Spider Chart */}
        {Object.values(insights.spiderChartData).some(value => value > 0) && (
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 text-center">Your Flavor Profile</h3>
            <div className="flex justify-center mb-4">
              <SpiderChart data={insights.spiderChartData} size={220} />
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
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Cuisine Ratings</h3>
            <div className="space-y-3">
              {Object.entries(insights.cuisineRatings)
                .sort(([,a], [,b]) => b.avg - a.avg)
                .map(([cuisine, data]) => (
                  <div key={cuisine} className="flex items-center">
                    <div className="w-16 text-sm capitalize text-gray-700">{cuisine}</div>
                    <div className="flex-1 mx-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(data.avg / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{data.avg.toFixed(1)}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="text-center pt-4 pb-4">
          <button
            onClick={() => navigate('/add')}
            className="bg-primary-500 text-white px-6 py-3 rounded-full font-medium hover:bg-primary-600 transition-colors"
          >
            Add More Entries
          </button>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Insights;
