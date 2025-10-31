import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useEntries } from "../context/EntriesContext";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import SimpleMap from "../components/SimpleMap";
import FoodDNAMatcher from "../components/FoodDNAMatcher";
import CulinaryAchievements from "../components/CulinaryAchievements";

// Compact Analytics Engine - Only what matters
const analyzeEatingPatterns = (entries) => {
  if (!entries || entries.length === 0) return null;

  const cuisineRatings = {};
  const flavorProfiles = {};
  const timeOfDay = {};
  const weekdayVsWeekend = { weekday: 0, weekend: 0 };
  const spendingPattern = { budget: 0, mid: 0, expensive: 0 };
  const socialVsSolo = { solo: 0, social: 0 };

  // Simplified categories
  const cuisines = [
    "Italian",
    "Chinese",
    "Japanese",
    "Mexican",
    "Indian",
    "Thai",
    "Korean",
    "French",
    "American",
  ];
  const flavors = ["Spicy", "Sweet", "Savory", "Fresh", "Rich", "Creamy"];

  entries.forEach((entry) => {
    const tags = entry.tags || [];
    const rating = entry.rating || 3;

    // Time analysis - useful for scheduling
    if (entry.created_at) {
      const date = new Date(entry.created_at);
      const hour = date.getHours();
      const day = date.getDay();

      let period = "Dinner";
      if (hour < 11) period = "Breakfast";
      else if (hour < 16) period = "Lunch";

      timeOfDay[period] = (timeOfDay[period] || 0) + 1;

      // Weekday vs Weekend
      if (day === 0 || day === 6) weekdayVsWeekend.weekend++;
      else weekdayVsWeekend.weekday++;
    }

    // Social context
    if (entry.tagged_friends && entry.tagged_friends.length > 0) {
      socialVsSolo.social++;
    } else {
      socialVsSolo.solo++;
    }

    // Spending analysis from occasion tags
    tags.forEach((tag) => {
      const lowerTag = tag.toLowerCase();
      if (["fine dining", "expensive", "michelin"].some((t) => lowerTag.includes(t)))
        spendingPattern.expensive++;
      else if (["casual", "street food", "food truck"].some((t) => lowerTag.includes(t)))
        spendingPattern.budget++;
      else spendingPattern.mid++;
    });

    // Cuisine & Flavor analysis
    tags.forEach((tag) => {
      const lowerTag = tag.toLowerCase();

      const cuisine = cuisines.find((c) => lowerTag.includes(c.toLowerCase()));
      if (cuisine) {
        if (!cuisineRatings[cuisine])
          cuisineRatings[cuisine] = { total: 0, count: 0, ratings: [] };
        cuisineRatings[cuisine].total += rating;
        cuisineRatings[cuisine].count++;
        cuisineRatings[cuisine].ratings.push(rating);
      }

      const flavor = flavors.find((f) => lowerTag.includes(f.toLowerCase()));
      if (flavor) {
        if (!flavorProfiles[flavor])
          flavorProfiles[flavor] = { total: 0, count: 0 };
        flavorProfiles[flavor].total += rating;
        flavorProfiles[flavor].count++;
      }
    });
  });

  // Calculate averages
  Object.keys(cuisineRatings).forEach((cuisine) => {
    cuisineRatings[cuisine].avg =
      cuisineRatings[cuisine].total / cuisineRatings[cuisine].count;
  });
  Object.keys(flavorProfiles).forEach((flavor) => {
    flavorProfiles[flavor].avg =
      flavorProfiles[flavor].total / flavorProfiles[flavor].count;
  });

  return {
    cuisineRatings,
    flavorProfiles,
    timeOfDay,
    weekdayVsWeekend,
    spendingPattern,
    socialVsSolo,
  };
};

// Generate 3-4 key actionable insights only
const generateKeyInsights = (analysis, entries) => {
  if (!analysis) return [];

  const insights = [];
  const { cuisineRatings, timeOfDay, weekdayVsWeekend, socialVsSolo } =
    analysis;

  // Top cuisine
  const topCuisine = Object.entries(cuisineRatings).sort(
    ([, a], [, b]) => b.count - a.count,
  )[0];
  if (topCuisine) {
    const [name, data] = topCuisine;
    insights.push({
      icon: "🌍",
      title: name,
      subtitle: "Go-To Cuisine",
      value: `${data.count} times`,
      rating: data.avg.toFixed(1),
    });
  }

  // Favorite time
  const favTime = Object.entries(timeOfDay).sort(([, a], [, b]) => b - a)[0];
  if (favTime) {
    const [period, count] = favTime;
    const emoji = period === "Breakfast" ? "🌅" : period === "Lunch" ? "☀️" : "🌙";
    insights.push({
      icon: emoji,
      title: period,
      subtitle: "Times you post most",
      value: `${Math.round((count / entries.length) * 100)}%`,
      rating: null,
    });
  }

  // Social pattern
  const totalSocial = socialVsSolo.social + socialVsSolo.solo;
  const socialPct = Math.round((socialVsSolo.social / totalSocial) * 100);
  if (socialPct > 0) {
    insights.push({
      icon: socialPct > 50 ? "👥" : "🧘",
      title: socialPct > 50 ? "Social Butterfly" : "Solo Explorer",
      subtitle: "Dining Style",
      value: `${socialPct}% with friends`,
      rating: null,
    });
  }

  // Weekend warrior
  const weekendPct = Math.round(
    (weekdayVsWeekend.weekend /
      (weekdayVsWeekend.weekday + weekdayVsWeekend.weekend)) *
      100,
  );
  if (weekendPct > 40) {
    insights.push({
      icon: "🎉",
      title: "Weekend Foodie",
      subtitle: "Activity Pattern",
      value: `${weekendPct}% on weekends`,
      rating: null,
    });
  }

  return insights.slice(0, 4);
};

const Insights = () => {
  const { user } = useAuth();
  const { entries, loading } = useEntries();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("snapshot");

  // Compact analytics
  const analysis = useMemo(() => analyzeEatingPatterns(entries), [entries]);
  const keyInsights = useMemo(
    () => generateKeyInsights(analysis, entries),
    [analysis, entries],
  );

  // Basic stats
  const stats = useMemo(() => {
    if (!entries || entries.length === 0) return null;

    const totalDishes = entries.length;
    const avgRating =
      entries.reduce((sum, e) => sum + (e.rating || 3), 0) / totalDishes;

    return {
      totalDishes,
      avgRating,
      cuisineCount: analysis
        ? Object.keys(analysis.cuisineRatings).length
        : 0,
      topCuisine: analysis
        ? Object.entries(analysis.cuisineRatings).sort(
            ([, a], [, b]) => b.count - a.count,
          )[0]?.[0] || "None"
        : "None",
    };
  }, [entries, analysis]);

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
    { id: "snapshot", label: "Snapshot", icon: "" },
    { id: "social", label: "DNA Match", icon: "" },
    { id: "achievements", label: "Wins", icon: "" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      {/* Compact Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-light tracking-wide text-black">
              Insights
            </h1>
            <button
              onClick={() => navigate("/")}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-5 h-5"
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

          {/* Compact Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-full p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-3 rounded-full text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Snapshot Tab */}
        {activeTab === "snapshot" && (
          <div className="space-y-6">
            {entries.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <h2 className="text-lg font-light text-black mb-2">
                  No Insights Yet
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Start adding meals to see your food story
                </p>
                <button
                  onClick={() => navigate("/add")}
                  className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-sm"
                >
                  Add First Entry
                </button>
              </div>
            ) : (
              <>
                {/* Compact Key Insights */}
                <div>
                  <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 px-1">
                    Your Food Profile
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {keyInsights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-2xl">{insight.icon}</span>
                          {insight.rating && (
                            <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                              {insight.rating}⭐
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-medium text-black mb-0.5">
                          {insight.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-1">
                          {insight.subtitle}
                        </p>
                        <p className="text-sm font-medium text-gray-700">
                          {insight.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats Bar */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="grid grid-cols-3 divide-x divide-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-light text-black">
                        {stats.totalDishes}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Entries</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-light text-black">
                        {stats.avgRating.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Avg Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-light text-black">
                        {stats.cuisineCount}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Cuisines</div>
                    </div>
                  </div>
                </div>

                {/* Top Cuisines - Compact */}
                {analysis && Object.keys(analysis.cuisineRatings).length > 0 && (
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 px-1">
                      Cuisine Breakdown
                    </h2>
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                      {Object.entries(analysis.cuisineRatings)
                        .sort(([, a], [, b]) => b.count - a.count)
                        .slice(0, 5)
                        .map(([cuisine, data]) => (
                          <div key={cuisine}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {cuisine}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">
                                  {data.count}×
                                </span>
                                <span className="text-xs font-medium text-yellow-600">
                                  {data.avg.toFixed(1)}⭐
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                                style={{
                                  width: `${(data.count / stats.totalDishes) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Flavor Profile - Simplified */}
                {analysis && Object.keys(analysis.flavorProfiles).length > 0 && (
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 px-1">
                      Flavor DNA
                    </h2>
                    <div className="bg-white border border-gray-200 rounded-2xl p-4">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(analysis.flavorProfiles)
                          .sort(([, a], [, b]) => b.count - a.count)
                          .slice(0, 6)
                          .map(([flavor, data]) => (
                            <div
                              key={flavor}
                              className="flex items-center space-x-2 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-full px-3 py-1.5"
                            >
                              <span className="text-sm font-medium text-gray-900">
                                {flavor}
                              </span>
                              <span className="text-xs text-gray-500">
                                {data.count}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Location Map - Interactive Food Journey */}
                {entries.filter(e => e.location).length > 0 && (
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 px-1">
                      Food Journey Map
                    </h2>
                    <div className="bg-white border border-gray-200 rounded-2xl p-4">
                      <div className="h-96">
                        <SimpleMap entries={entries} />
                      </div>
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        Click on markers to see details • {entries.filter(e => e.location).length} locations tracked
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* DNA Match Tab */}
        {activeTab === "social" && (
          <div>
            <FoodDNAMatcher />
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div>
            <CulinaryAchievements />
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Insights;
