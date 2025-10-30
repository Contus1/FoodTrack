import React, { useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useEntries } from "../context/EntriesContext";
import { useNavigate } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation";
import Recommendations from "../components/Recommendations";

const RecommendationsPage = () => {
  const { user } = useAuth();
  const { entries, loading } = useEntries();
  const navigate = useNavigate();

  // Check if user has enough entries to unlock
  const isUnlocked = useMemo(() => entries.length >= 5, [entries]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  // Show locked state if less than 5 entries
  if (!isUnlocked) {
    const remaining = 5 - entries.length;
    return (
      <div className="min-h-screen bg-white pb-16">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 z-10">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-1 h-8 bg-black rounded-full"></div>
                <h1 className="text-xl font-light tracking-wide text-black">
                  Discover
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-xs text-gray-400 font-light tracking-wider uppercase">
                  Locked
                </span>
              </div>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-6 py-16 max-w-2xl">
          <div className="text-center">
            {/* Lock Icon */}
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center relative">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {remaining}
              </div>
            </div>

            <h2 className="text-2xl font-light text-black mb-3">
              Almost There!
            </h2>
            <p className="text-gray-600 mb-2">
              Add <span className="font-medium text-black">{remaining} more {remaining === 1 ? 'dish' : 'dishes'}</span> to unlock personalized recommendations
            </p>
            <p className="text-sm text-gray-500 mb-8">
              We need to understand your taste profile first
            </p>

            {/* Progress Bar */}
            <div className="max-w-xs mx-auto mb-8">
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(entries.length / 5) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{entries.length}/5 entries</span>
                <span>{Math.round((entries.length / 5) * 100)}%</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/add")}
              className="px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
            >
              Add More Dishes
            </button>
          </div>
        </main>

        <BottomNavigation />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-16">
        {/* Sophisticated Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 z-10">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-1 h-8 bg-black rounded-full"></div>
                <h1 className="text-xl font-light tracking-wide text-black">
                  Discover
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400 font-light tracking-wider uppercase">
                  Loading
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // Prepare user profile for recommendations
  const userProfile = {
    entries,
    tagFrequency: {},
    avgRating: 0,
    cuisineRatings: {},
  };

  if (entries.length > 0) {
    // Calculate tag frequency
    entries.forEach((entry) => {
      if (entry.tags && Array.isArray(entry.tags)) {
        entry.tags.forEach((tag) => {
          const lowerTag = tag.toLowerCase();
          userProfile.tagFrequency[lowerTag] =
            (userProfile.tagFrequency[lowerTag] || 0) + 1;
        });
      }
    });

    // Calculate average rating
    userProfile.avgRating =
      entries.reduce((sum, entry) => sum + entry.rating, 0) / entries.length;

    // Calculate cuisine ratings
    const cuisines = [
      "thai",
      "korean",
      "italian",
      "japanese",
      "chinese",
      "mexican",
      "indian",
      "french",
      "american",
      "mediterranean",
    ];
    entries.forEach((entry) => {
      if (entry.tags && Array.isArray(entry.tags)) {
        entry.tags.forEach((tag) => {
          const lowerTag = tag.toLowerCase();
          if (cuisines.includes(lowerTag)) {
            if (!userProfile.cuisineRatings[lowerTag]) {
              userProfile.cuisineRatings[lowerTag] = { total: 0, count: 0 };
            }
            userProfile.cuisineRatings[lowerTag].total += entry.rating;
            userProfile.cuisineRatings[lowerTag].count++;
          }
        });
      }
    });

    // Calculate average ratings for cuisines
    Object.keys(userProfile.cuisineRatings).forEach((cuisine) => {
      userProfile.cuisineRatings[cuisine].avg =
        userProfile.cuisineRatings[cuisine].total /
        userProfile.cuisineRatings[cuisine].count;
    });
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
                Discover
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                />
              </svg>
              <span className="text-xs text-gray-400 font-light tracking-wider uppercase">
                AI Powered
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-light text-black mb-2">
            Recommendations
          </h1>
          <p className="text-gray-500 text-sm font-light">
            Discover your next favorite dish
          </p>
        </div>

        <Recommendations userProfile={userProfile} />
      </main>

      <BottomNavigation />
    </div>
  );
};

export default RecommendationsPage;
