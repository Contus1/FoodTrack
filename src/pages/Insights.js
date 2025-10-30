import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useEntries } from "../context/EntriesContext";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import SpiderChart from "../components/SpiderChart";
import SimpleMap from "../components/SimpleMap";
import FlavorJourneyMap from "../components/FlavorJourneyMap";
import FoodDNAMatcher from "../components/FoodDNAMatcher";
import CulinaryAchievements from "../components/CulinaryAchievements";
import { FoodRecommendationEngine } from "../utils/recommendationEngine";

// Component to properly use the FoodRecommendationEngine class
const FoodRecommendations = ({ entries }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateRecommendations = () => {
      try {
        if (!entries || entries.length === 0) {
          setRecommendations(null);
          setLoading(false);
          return;
        }

        const engine = new FoodRecommendationEngine();
        const analysis = engine.analyzePreferences(entries);
        const cuisineRecs = engine.recommendCuisines(analysis);
        const dishRecs = engine.recommendDishes(analysis, cuisineRecs);
        const tips = engine.generateTips(analysis);

        setRecommendations({
          analysis,
          cuisines: cuisineRecs.slice(0, 3),
          dishes: dishRecs,
          tips,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error generating recommendations:", error);
        setRecommendations(null);
        setLoading(false);
      }
    };

    generateRecommendations();
  }, [entries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">
          Add more food entries to get personalized recommendations!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cuisine Recommendations */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          🌍 Try These Cuisines
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {recommendations.cuisines.map((cuisine, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900">{cuisine.name}</h5>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {cuisine.score}% match
                </span>
              </div>
              <div className="space-y-1">
                {cuisine.reasons.map((reason, idx) => (
                  <p key={idx} className="text-xs text-gray-600">
                    • {reason}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dish Recommendations */}
      {recommendations.dishes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            🍽️ Recommended Dishes
          </h4>
          <div className="space-y-3">
            {recommendations.dishes.map((dish, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-gray-900">{dish.name}</h5>
                  <span className="text-xs text-gray-500">{dish.cuisine}</span>
                </div>
                <div className="mt-1">
                  {dish.reasons.map((reason, idx) => (
                    <p key={idx} className="text-xs text-gray-600">
                      • {reason}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {recommendations.tips.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            💡 Personalized Tips
          </h4>
          <div className="space-y-2">
            {recommendations.tips.map((tip, index) => (
              <div
                key={index}
                className="bg-blue-50 border border-blue-100 rounded-lg p-3"
              >
                <p className="text-sm text-blue-800">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Insights = () => {
  const { user } = useAuth();
  const { entries, loading } = useEntries();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("classic");

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
        entries: [],
      };
    }

    const totalDishes = entries.length;
    const avgRating =
      entries.reduce((sum, entry) => sum + entry.rating, 0) / totalDishes;

    const cuisineMap = {};
    const tagFrequency = {};
    const spiceProfile = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const cuisineRatings = {};

    entries.forEach((entry) => {
      // Count spice levels (ratings)
      spiceProfile[entry.rating]++;

      // Process tags
      if (entry.tags && Array.isArray(entry.tags)) {
        entry.tags.forEach((tag) => {
          const lowerTag = tag.toLowerCase();
          tagFrequency[lowerTag] = (tagFrequency[lowerTag] || 0) + 1;

          // Identify cuisine tags
          const cuisineKeywords = [
            "italian",
            "chinese",
            "mexican",
            "indian",
            "japanese",
            "french",
            "thai",
            "american",
          ];
          const cuisine = cuisineKeywords.find((keyword) =>
            lowerTag.includes(keyword),
          );

          if (cuisine) {
            cuisineMap[cuisine] = (cuisineMap[cuisine] || 0) + 1;

            if (!cuisineRatings[cuisine]) {
              cuisineRatings[cuisine] = { total: 0, count: 0, avg: 0 };
            }

            cuisineRatings[cuisine].total += entry.rating;
            cuisineRatings[cuisine].count++;
            cuisineRatings[cuisine].avg =
              cuisineRatings[cuisine].total / cuisineRatings[cuisine].count;
          }
        });
      }
    });

    const spiderChartData = {
      Spicy: tagFrequency.spicy || 0,
      Sweet: tagFrequency.sweet || 0,
      Creamy: tagFrequency.creamy || 0,
      Noodles: tagFrequency.noodles || 0,
      Cheese: tagFrequency.cheese || 0,
      Seafood: tagFrequency.seafood || 0,
    };

    return {
      totalDishes,
      avgRating,
      cuisineMap,
      spiceProfile,
      flavorProfile: tagFrequency,
      tagFrequency,
      cuisineRatings,
      spiderChartData,
      entries,
    };
  }, [entries]);

  if (!user) {
    navigate("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "classic", label: "Classic Analytics", icon: "📊" },
    { id: "social", label: "Social Insights", icon: "👥" },
    { id: "achievements", label: "Achievements", icon: "🏆" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="sticky top-0 bg-white backdrop-blur-xl border-b border-gray-100 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-1 h-6 sm:h-8 bg-black rounded-full" />
              <h1 className="text-lg sm:text-2xl font-light tracking-wide text-black">
                Culinary Insights
              </h1>
            </div>

            <button
              onClick={() => navigate("/")}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black rounded-full hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-2 px-1 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-black border-b-2 border-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="mr-1 sm:mr-2">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content area with proper padding to account for sticky header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pt-8 sm:pt-12">
        {/* Social Insights Tab */}
        {activeTab === "social" && (
          <div className="space-y-8">
            <FlavorJourneyMap />
            <FoodDNAMatcher />
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div className="space-y-8">
            <CulinaryAchievements />
          </div>
        )}

        {/* Classic Analytics Tab */}
        {activeTab === "classic" && (
          <div className="space-y-8">
            {entries.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-8 border border-gray-200 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={0.8}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>

                <h2 className="text-xl font-light text-black mb-4">
                  No Data to Analyze
                </h2>

                <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed mb-8">
                  Start documenting your culinary experiences to unlock
                  personalized insights and trends
                </p>

                <button
                  onClick={() => navigate("/add")}
                  className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 text-sm font-light tracking-wide"
                >
                  Add Your First Entry
                </button>
              </div>
            ) : (
              <>
                {/* Overview Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  <div className="bg-white border border-gray-100 rounded-xl p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-light text-gray-600 uppercase tracking-wider mb-1">
                          Total Dishes
                        </p>
                        <p className="text-lg sm:text-2xl font-light text-black">
                          {insights.totalDishes}
                        </p>
                      </div>

                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-50 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-xl p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-light text-gray-600 uppercase tracking-wider mb-1">
                          Avg Rating
                        </p>
                        <p className="text-lg sm:text-2xl font-light text-black">
                          {insights.avgRating.toFixed(1)}
                        </p>
                      </div>

                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-xl p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-light text-gray-600 uppercase tracking-wider mb-1">
                          Cuisines Tried
                        </p>
                        <p className="text-lg sm:text-2xl font-light text-black">
                          {Object.keys(insights.cuisineMap).length}
                        </p>
                      </div>

                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-50 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 sm:w-6 sm:h-6 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-xl p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-light text-gray-600 uppercase tracking-wider mb-1">
                          Favorite Cuisine
                        </p>
                        <p className="text-sm sm:text-lg font-light text-black capitalize">
                          {Object.keys(insights.cuisineMap).length > 0
                            ? Object.entries(insights.cuisineMap).sort(
                                ([, a], [, b]) => b - a,
                              )[0][0]
                            : "None yet"}
                        </p>
                      </div>

                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-50 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                  {/* Flavor Profile */}
                  <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-light text-black mb-4 sm:mb-6 flex items-center">
                      <span className="w-1 h-4 sm:h-6 bg-black rounded-full mr-2 sm:mr-3" />
                      Flavor Profile
                    </h3>

                    <div className="h-48 sm:h-64 flex items-center justify-center">
                      <SpiderChart data={insights.spiderChartData} />
                    </div>
                  </div>

                  {/* Rating Distribution */}
                  <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-light text-black mb-4 sm:mb-6 flex items-center">
                      <span className="w-1 h-4 sm:h-6 bg-black rounded-full mr-2 sm:mr-3" />
                      Rating Distribution
                    </h3>

                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = insights.spiceProfile[rating] || 0;
                        const percentage =
                          insights.totalDishes > 0
                            ? (count / insights.totalDishes) * 100
                            : 0;

                        return (
                          <div
                            key={rating}
                            className="flex items-center space-x-3"
                          >
                            <div className="flex items-center space-x-1 w-12">
                              {[...Array(rating)].map((_, i) => (
                                <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>

                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>

                            <span className="text-sm text-gray-600 w-8">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Location Map */}
                <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-light text-black mb-4 sm:mb-6 flex items-center">
                    <span className="w-1 h-4 sm:h-6 bg-black rounded-full mr-2 sm:mr-3" />
                    Culinary Journey Map
                  </h3>

                  <div className="h-64 sm:h-96">
                    <SimpleMap
                      locations={Object.entries(
                        insights.entries.reduce((acc, entry) => {
                          if (entry.location)
                            acc[entry.location] =
                              (acc[entry.location] || 0) + 1;
                          return acc;
                        }, {}),
                      ).map(([name, count]) => ({ name, count }))}
                    />
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-light text-black mb-4 sm:mb-6 flex items-center">
                    <span className="w-1 h-4 sm:h-6 bg-black rounded-full mr-2 sm:mr-3" />
                    Personalized Recommendations
                  </h3>

                  <FoodRecommendations entries={insights.entries} />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Insights;
