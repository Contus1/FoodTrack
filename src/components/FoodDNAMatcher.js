import React, { useState, useEffect, useCallback } from "react";
import { useSocial } from "../context/SocialContext";
import { useEntries } from "../context/EntriesContext";

const FoodDNAMatcher = () => {
  const { friends, getSocialFeed } = useSocial();
  const { entries: userEntries } = useEntries();
  const [allEntries, setAllEntries] = useState([]);
  const [compatibilityData, setCompatibilityData] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);

  const loadAnalysisData = useCallback(async () => {
    try {
      const socialEntries = await getSocialFeed(100);
      setAllEntries(socialEntries);
    } catch (error) {
      console.error("Error loading analysis data:", error);
    }
  }, [getSocialFeed]);

  useEffect(() => {
    loadAnalysisData();
  }, [loadAnalysisData]);

  useEffect(() => {
    analyzeCompatibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friends, userEntries, allEntries]);

  const analyzeCompatibility = () => {
    const compatibility = friends.map((friendship) => {
      const friendEntries = allEntries.filter(
        (entry) => entry.user_id === friendship.friend.id,
      );
      const userFoodProfile = createFoodProfile(userEntries);
      const friendFoodProfile = createFoodProfile(friendEntries);
      const compatibility = calculateCompatibility(
        userFoodProfile,
        friendFoodProfile,
      );

      return {
        ...friendship,
        compatibility,
        sharedTastes: findSharedTastes(userFoodProfile, friendFoodProfile),
        recommendations: generateRecommendations(
          userFoodProfile,
          friendFoodProfile,
        ),
      };
    });

    setCompatibilityData(
      compatibility.sort((a, b) => b.compatibility - a.compatibility),
    );
  };

  const createFoodProfile = (entries) => {
    const profile = {
      cuisines: {},
      flavors: {},
      avgRating: 0,
      adventurous: 0,
      sweetTooth: 0,
      spiceLover: 0,
      healthConscious: 0,
    };

    entries.forEach((entry) => {
      // Cuisine analysis
      entry.tags?.forEach((tag) => {
        const cuisine = tag.toLowerCase();
        profile.cuisines[cuisine] = (profile.cuisines[cuisine] || 0) + 1;

        // Personality traits based on food choices
        if (["exotic", "fusion", "experimental"].includes(cuisine)) {
          profile.adventurous += 1;
        }
        if (["dessert", "sweet", "cake", "ice cream"].includes(cuisine)) {
          profile.sweetTooth += 1;
        }
        if (["spicy", "hot", "chili", "thai", "indian"].includes(cuisine)) {
          profile.spiceLover += 1;
        }
        if (
          ["salad", "healthy", "organic", "vegan", "vegetarian"].includes(
            cuisine,
          )
        ) {
          profile.healthConscious += 1;
        }
      });

      // Location-based analysis
      if (entry.location) {
        const location = entry.location.toLowerCase();
        if (location.includes("food truck") || location.includes("street")) {
          profile.adventurous += 0.5;
        }
        if (location.includes("fine dining") || location.includes("michelin")) {
          profile.adventurous += 1;
        }
      }
    });

    profile.avgRating =
      entries.length > 0
        ? entries.reduce((sum, entry) => sum + (entry.rating || 0), 0) /
          entries.length
        : 0;

    // Normalize traits
    const totalEntries = entries.length || 1;
    profile.adventurous = Math.min(
      (profile.adventurous / totalEntries) * 100,
      100,
    );
    profile.sweetTooth = Math.min(
      (profile.sweetTooth / totalEntries) * 100,
      100,
    );
    profile.spiceLover = Math.min(
      (profile.spiceLover / totalEntries) * 100,
      100,
    );
    profile.healthConscious = Math.min(
      (profile.healthConscious / totalEntries) * 100,
      100,
    );

    return profile;
  };

  const calculateCompatibility = (profile1, profile2) => {
    let compatibility = 0;

    // Rating similarity (30% weight)
    const ratingDiff = Math.abs(profile1.avgRating - profile2.avgRating);
    compatibility += ((5 - ratingDiff) / 5) * 30;

    // Trait similarity (70% weight)
    const traits = [
      "adventurous",
      "sweetTooth",
      "spiceLover",
      "healthConscious",
    ];
    traits.forEach((trait) => {
      const diff = Math.abs(profile1[trait] - profile2[trait]);
      compatibility += (100 - diff) * 0.175; // 70% / 4 traits = 17.5% each
    });

    return Math.round(compatibility);
  };

  const findSharedTastes = (profile1, profile2) => {
    const shared = [];
    Object.keys(profile1.cuisines).forEach((cuisine) => {
      if (profile2.cuisines[cuisine]) {
        shared.push({
          cuisine,
          userCount: profile1.cuisines[cuisine],
          friendCount: profile2.cuisines[cuisine],
        });
      }
    });
    return shared
      .sort(
        (a, b) => b.userCount + b.friendCount - (a.userCount + a.friendCount),
      )
      .slice(0, 5);
  };

  const generateRecommendations = (profile1, profile2) => {
    const recommendations = [];

    // Find cuisines the friend loves that the user hasn't tried much
    Object.entries(profile2.cuisines).forEach(([cuisine, count]) => {
      if (
        count >= 3 &&
        (!profile1.cuisines[cuisine] || profile1.cuisines[cuisine] < 2)
      ) {
        recommendations.push(`Try more ${cuisine} dishes`);
      }
    });

    return recommendations.slice(0, 3);
  };

  const getCompatibilityEmoji = (score) => {
    if (score >= 80) return "🔥";
    if (score >= 60) return "👍";
    if (score >= 40) return "🤝";
    return "🤔";
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="relative z-10">
        <div className="text-center mb-6 px-4 pt-6">
          <h2 className="text-xl font-light mb-2 text-gray-900">
            🧬 Food DNA Matcher
          </h2>
          <p className="text-gray-600 text-sm">
            Discover your culinary compatibility with friends
          </p>
        </div>

        {friends.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">👥</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Add Friends to Compare
            </h3>
            <p className="text-gray-600 text-sm mb-6 max-w-xs mx-auto">
              Connect with friends to discover shared tastes and food compatibility
            </p>
            <button
              onClick={() => (window.location.href = "/profile")}
              className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-all"
            >
              Find Friends
            </button>
          </div>
        ) : compatibilityData.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="w-16 h-16 mx-auto mb-4 border-2 border-gray-200 rounded-full animate-spin"></div>
            <p className="text-gray-500">Analyzing food DNA...</p>
          </div>
        ) : (
          <div className="space-y-3 px-4 pb-6">
            {compatibilityData.slice(0, 5).map((friendData, index) => (
              <div
                key={friendData.id}
                className="bg-gray-50 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:bg-gray-100"
                onClick={() =>
                  setSelectedFriend(
                    selectedFriend?.id === friendData.id ? null : friendData,
                  )
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                      {friendData.friend.display_name
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {friendData.friend.display_name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        @{friendData.friend.username}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-center">
                      <div className="text-2xl mb-0.5">
                        {getCompatibilityEmoji(friendData.compatibility)}
                      </div>
                      <div className="text-xs text-gray-600 font-medium leading-tight">
                        {friendData.compatibility >= 80
                          ? "Soul Food"
                          : friendData.compatibility >= 60
                            ? "Great"
                            : friendData.compatibility >= 40
                              ? "Good"
                              : "Different"}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedFriend?.id === friendData.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    {/* Shared Tastes */}
                    {friendData.sharedTastes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          🤝 Shared Tastes
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {friendData.sharedTastes.map((taste, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-white text-gray-700 text-xs rounded-full border border-gray-200"
                            >
                              {taste.cuisine} ({taste.userCount + taste.friendCount})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {friendData.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          💡 Try This
                        </h4>
                        <div className="space-y-1">
                          {friendData.recommendations.map((rec, i) => (
                            <p key={i} className="text-sm text-gray-600">
                              • {rec}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Plan Together Button */}
                    <button className="w-full py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all duration-300">
                      🍽️ Plan a Food Date
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Fun Facts */}
        {friends.length > 0 && (
          <div className="mt-6 bg-gray-50 rounded-2xl p-4 mx-4 mb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              🔬 Food Science Facts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
              <div>
                <span className="font-medium">Did you know?</span> People with
                similar food preferences often share personality traits!
              </div>
              <div>
                <span className="font-medium">Fun fact:</span> Spice tolerance is
                influenced by genetics and culture.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDNAMatcher;
