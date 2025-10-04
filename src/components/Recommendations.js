import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FoodRecommendationEngine } from '../utils/recommendationEngine';
import { useEntries } from '../context/EntriesContext';

const Recommendations = () => {
  const navigate = useNavigate();
  const { entries } = useEntries();
  
  const discoveryData = useMemo(() => {
    if (!entries || entries.length === 0) return null;

    // Prepare user profile for the recommendation engine
    const cuisineRatings = {};
    const tagFrequency = {};
    let totalRating = 0;

    entries.forEach(entry => {
      totalRating += entry.rating || 0;

      // Process tags
      if (entry.tags && Array.isArray(entry.tags)) {
        entry.tags.forEach(tag => {
          const lowerTag = tag.toLowerCase();
          tagFrequency[lowerTag] = (tagFrequency[lowerTag] || 0) + 1;

          // Identify cuisines
          const cuisineKeywords = ['italian', 'chinese', 'mexican', 'indian', 'japanese', 'french', 'thai', 'american', 'korean', 'vietnamese', 'mediterranean', 'greek', 'spanish', 'lebanese', 'turkish', 'moroccan', 'brazilian', 'argentinian', 'peruvian'];
          const cuisine = cuisineKeywords.find(keyword => lowerTag.includes(keyword));
          
          if (cuisine) {
            if (!cuisineRatings[cuisine]) {
              cuisineRatings[cuisine] = { total: 0, count: 0, avg: 0 };
            }
            cuisineRatings[cuisine].total += entry.rating || 0;
            cuisineRatings[cuisine].count++;
            cuisineRatings[cuisine].avg = cuisineRatings[cuisine].total / cuisineRatings[cuisine].count;
          }
        });
      }
    });

    const avgRating = totalRating / entries.length;

    const userProfile = {
      entries,
      tagFrequency,
      avgRating,
      cuisineRatings
    };

    const engine = new FoodRecommendationEngine();
    return engine.generateRecommendations(userProfile);
  }, [entries]);

  if (!entries || entries.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">🍽️</span>
          </div>
          <h3 className="text-xl font-light text-gray-900 mb-3">Start Your Culinary Journey</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Add a few food entries to get personalized recommendations based on your taste preferences!
          </p>
          <button
            onClick={() => navigate('/add')}
            className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
          >
            Add Your First Dish
          </button>
        </div>
      </div>
    );
  }

  if (!discoveryData) return null;

  return (
    <div className="space-y-6">
      {/* Cuisine Recommendations */}
      {discoveryData.cuisines && discoveryData.cuisines.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-light text-gray-900">🌍 Explore New Cuisines</h4>
            <span className="text-xs text-gray-500">Based on your preferences</span>
          </div>
          <div className="space-y-3">
            {discoveryData.cuisines.slice(0, 3).map((cuisine, index) => (
              <div key={cuisine.key || index} className="p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{cuisine.name} Cuisine</h5>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {cuisine.confidence}% match
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      index === 0 ? 'bg-green-100 text-green-700' :
                      index === 1 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {index === 0 ? 'Perfect' : index === 1 ? 'Great' : 'Good'} fit
                    </span>
                  </div>
                </div>
                {cuisine.reasons && cuisine.reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {cuisine.reasons.slice(0, 3).map((reason, idx) => (
                      <span key={idx} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                        {reason}
                      </span>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => navigate('/add')}
                  className="text-xs text-black hover:text-gray-700 font-medium group-hover:underline"
                >
                  Try this cuisine →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specific Dish Recommendations */}
      {discoveryData.dishes && discoveryData.dishes.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-light text-gray-900">🍽️ Perfect Dishes for You</h4>
            <span className="text-xs text-gray-500">Flavor matched</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {discoveryData.dishes.slice(0, 4).map((dish, index) => (
              <div key={index} className="p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-900 text-sm">{dish.name}</h5>
                  <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                    {dish.cuisine}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  {dish.reasons ? dish.reasons.join(' • ') : 'Recommended for you'}
                </p>
                <button 
                  onClick={() => navigate('/add')}
                  className="text-xs text-black hover:text-gray-700 font-medium group-hover:underline"
                >
                  Add to try list →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal Tips */}
      {discoveryData.tips && discoveryData.tips.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h4 className="text-lg font-light text-gray-900 mb-4">💡 Personal Culinary Tips</h4>
          <div className="space-y-3">
            {discoveryData.tips.slice(0, 3).map((tip, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start space-x-2">
                  <div className="text-blue-600 text-sm font-medium flex-shrink-0">Tip:</div>
                  <p className="text-blue-800 text-sm">{tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 text-center border border-gray-200">
        <div className="mb-4">
          <span className="text-2xl mb-2 block">🎯</span>
          <h4 className="text-lg font-light text-gray-900 mb-2">Ready for Your Next Adventure?</h4>
          <p className="text-gray-600 text-sm max-w-md mx-auto">
            These recommendations are tailored to expand your palate while staying true to your taste preferences.
          </p>
        </div>
        <button
          onClick={() => navigate('/add')}
          className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
        >
          Start Exploring
        </button>
      </div>

      {/* Algorithm Explanation */}
      <div className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
        <p className="text-xs text-gray-500 leading-relaxed">
          🤖 Your recommendations are powered by intelligent analysis of your {entries.length} food entries, 
          including your flavor preferences, cuisine exploration patterns, and rating history. 
          The more you track, the better your recommendations become.
        </p>
      </div>
    </div>
  );
};

export default Recommendations;