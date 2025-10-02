import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import FoodRecommendationEngine from '../utils/recommendationEngine';

const Recommendations = ({ userProfile }) => {
  const navigate = useNavigate();
  
  const recommendations = useMemo(() => {
    const engine = new FoodRecommendationEngine();
    return engine.generateRecommendations(userProfile);
  }, [userProfile]);

  if (!userProfile.entries || userProfile.entries.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">🎯 Discover New Flavors</h3>
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🌟</div>
          <p className="text-gray-500 mb-4">Add more entries to get personalized recommendations!</p>
          <button
            onClick={() => navigate('/add')}
            className="bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            Add Entry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-orange-600 rounded-lg p-6 text-white shadow-sm">
        <h3 className="font-bold text-lg mb-2">🚀 New Adventures Await</h3>
        <p className="text-primary-100 text-sm">
          Based on your taste profile, here's what we recommend
        </p>
      </div>

      {/* Cuisine Recommendations */}
      {recommendations.cuisines.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3">🌍 Try These Cuisines</h4>
          <div className="space-y-3">
            {recommendations.cuisines.map((cuisine, index) => (
              <div key={cuisine.key} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-sm">#{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-medium text-gray-900">Try {cuisine.name}</h5>
                    <span className="text-xs text-green-600 font-medium">
                      {cuisine.confidence}% match
                    </span>
                  </div>
                  {cuisine.reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {cuisine.reasons.map((reason, idx) => (
                        <span key={idx} className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dish Recommendations */}
      {recommendations.dishes.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3">🍽️ Specific Dishes to Try</h4>
          <div className="grid gap-3">
            {recommendations.dishes.map((dish, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 hover:border-primary-300 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h5 className="font-medium text-gray-900">{dish.name}</h5>
                  <span className="text-xs text-primary-600 font-medium">{dish.cuisine}</span>
                </div>
                <p className="text-xs text-gray-500">{dish.reasons.join(' • ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {recommendations.tips.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3">💡 Personal Tips</h4>
          <div className="space-y-2">
            {recommendations.tips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                <div className="text-blue-600 text-sm font-medium flex-shrink-0">Tip:</div>
                <p className="text-blue-800 text-sm">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="bg-white rounded-lg p-4 shadow-sm text-center">
        <p className="text-gray-600 text-sm mb-3">
          Found something interesting? Add it to your diary!
        </p>
        <button
          onClick={() => navigate('/add')}
          className="bg-primary-500 text-white px-6 py-3 rounded-full font-medium hover:bg-primary-600 transition-colors"
        >
          Try Something New
        </button>
      </div>

      {/* Algorithm Info */}
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-xs text-gray-500">
          🤖 Recommendations powered by intelligent analysis of your taste patterns, 
          spice preferences, and cuisine exploration history
        </p>
      </div>
    </div>
  );
};

export default Recommendations;