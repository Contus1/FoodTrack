import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEntries } from '../context/EntriesContext';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import Recommendations from '../components/Recommendations';

const RecommendationsPage = () => {
  const { user } = useAuth();
  const { entries, loading } = useEntries();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

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
                <span className="text-xs text-gray-400 font-light tracking-wider uppercase">Loading</span>
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
    cuisineRatings: {}
  };

  if (entries.length > 0) {
    // Calculate tag frequency
    entries.forEach(entry => {
      if (entry.tags && Array.isArray(entry.tags)) {
        entry.tags.forEach(tag => {
          const lowerTag = tag.toLowerCase();
          userProfile.tagFrequency[lowerTag] = (userProfile.tagFrequency[lowerTag] || 0) + 1;
        });
      }
    });

    // Calculate average rating
    userProfile.avgRating = entries.reduce((sum, entry) => sum + entry.rating, 0) / entries.length;

    // Calculate cuisine ratings
    const cuisines = ['thai', 'korean', 'italian', 'japanese', 'chinese', 'mexican', 'indian', 'french', 'american', 'mediterranean'];
    entries.forEach(entry => {
      if (entry.tags && Array.isArray(entry.tags)) {
        entry.tags.forEach(tag => {
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
    Object.keys(userProfile.cuisineRatings).forEach(cuisine => {
      userProfile.cuisineRatings[cuisine].avg = userProfile.cuisineRatings[cuisine].total / userProfile.cuisineRatings[cuisine].count;
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
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
              <span className="text-xs text-gray-400 font-light tracking-wider uppercase">AI Powered</span>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-light text-black mb-2">Recommendations</h1>
          <p className="text-gray-500 text-sm font-light">Discover your next favorite dish</p>
        </div>

        <Recommendations userProfile={userProfile} />
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default RecommendationsPage;