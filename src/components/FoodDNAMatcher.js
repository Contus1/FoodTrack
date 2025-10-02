import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useEntries } from '../context/EntriesContext';

const FoodDNAMatcher = () => {
  const { user } = useAuth();
  const { friends, getSocialFeed } = useSocial();
  const { entries: userEntries } = useEntries();
  const [allEntries, setAllEntries] = useState([]);
  const [compatibilityData, setCompatibilityData] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    loadAnalysisData();
    // Animation sequence
    const timer = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(timer);
  }, [friends, userEntries]);

  const loadAnalysisData = async () => {
    try {
      const socialEntries = await getSocialFeed(100);
      setAllEntries(socialEntries);
      analyzeCompatibility();
    } catch (error) {
      console.error('Error loading analysis data:', error);
    }
  };

  const analyzeCompatibility = () => {
    const compatibility = friends.map(friendship => {
      const friendEntries = allEntries.filter(entry => entry.user_id === friendship.friend.id);
      const userFoodProfile = createFoodProfile(userEntries);
      const friendFoodProfile = createFoodProfile(friendEntries);
      const compatibility = calculateCompatibility(userFoodProfile, friendFoodProfile);
      
      return {
        ...friendship,
        compatibility,
        sharedTastes: findSharedTastes(userFoodProfile, friendFoodProfile),
        recommendations: generateRecommendations(userFoodProfile, friendFoodProfile)
      };
    });
    
    setCompatibilityData(compatibility.sort((a, b) => b.compatibility - a.compatibility));
  };

  const createFoodProfile = (entries) => {
    const profile = {
      cuisines: {},
      flavors: {},
      avgRating: 0,
      adventurous: 0,
      sweetTooth: 0,
      spiceLover: 0,
      healthConscious: 0
    };

    entries.forEach(entry => {
      // Cuisine analysis
      entry.tags?.forEach(tag => {
        const cuisine = tag.toLowerCase();
        profile.cuisines[cuisine] = (profile.cuisines[cuisine] || 0) + 1;
        
        // Personality traits based on food choices
        if (['exotic', 'fusion', 'experimental'].includes(cuisine)) {
          profile.adventurous += 1;
        }
        if (['dessert', 'sweet', 'cake', 'ice cream'].includes(cuisine)) {
          profile.sweetTooth += 1;
        }
        if (['spicy', 'hot', 'chili', 'thai', 'indian'].includes(cuisine)) {
          profile.spiceLover += 1;
        }
        if (['salad', 'healthy', 'organic', 'vegan', 'vegetarian'].includes(cuisine)) {
          profile.healthConscious += 1;
        }
      });

      // Location-based analysis
      if (entry.location) {
        const location = entry.location.toLowerCase();
        if (location.includes('food truck') || location.includes('street')) {
          profile.adventurous += 0.5;
        }
        if (location.includes('fine dining') || location.includes('michelin')) {
          profile.adventurous += 1;
        }
      }
    });

    profile.avgRating = entries.length > 0 
      ? entries.reduce((sum, entry) => sum + (entry.rating || 0), 0) / entries.length 
      : 0;

    // Normalize traits
    const totalEntries = entries.length || 1;
    profile.adventurous = Math.min(profile.adventurous / totalEntries * 100, 100);
    profile.sweetTooth = Math.min(profile.sweetTooth / totalEntries * 100, 100);
    profile.spiceLover = Math.min(profile.spiceLover / totalEntries * 100, 100);
    profile.healthConscious = Math.min(profile.healthConscious / totalEntries * 100, 100);

    return profile;
  };

  const calculateCompatibility = (profile1, profile2) => {
    let compatibility = 0;
    let factors = 0;

    // Rating similarity (30% weight)
    const ratingDiff = Math.abs(profile1.avgRating - profile2.avgRating);
    compatibility += (5 - ratingDiff) / 5 * 30;
    factors += 30;

    // Trait similarity (70% weight)
    const traits = ['adventurous', 'sweetTooth', 'spiceLover', 'healthConscious'];
    traits.forEach(trait => {
      const diff = Math.abs(profile1[trait] - profile2[trait]);
      compatibility += (100 - diff) * 0.175; // 70% / 4 traits = 17.5% each
      factors += 17.5;
    });

    return Math.round(compatibility);
  };

  const findSharedTastes = (profile1, profile2) => {
    const shared = [];
    Object.keys(profile1.cuisines).forEach(cuisine => {
      if (profile2.cuisines[cuisine]) {
        shared.push({
          cuisine,
          userCount: profile1.cuisines[cuisine],
          friendCount: profile2.cuisines[cuisine]
        });
      }
    });
    return shared.sort((a, b) => (b.userCount + b.friendCount) - (a.userCount + a.friendCount)).slice(0, 5);
  };

  const generateRecommendations = (profile1, profile2) => {
    const recommendations = [];
    
    // Find cuisines the friend loves that the user hasn't tried much
    Object.entries(profile2.cuisines).forEach(([cuisine, count]) => {
      if (count >= 3 && (!profile1.cuisines[cuisine] || profile1.cuisines[cuisine] < 2)) {
        recommendations.push(`Try more ${cuisine} dishes`);
      }
    });

    return recommendations.slice(0, 3);
  };

  const getCompatibilityColor = (score) => {
    if (score >= 80) return 'from-green-400 to-emerald-500';
    if (score >= 60) return 'from-yellow-400 to-orange-400';
    if (score >= 40) return 'from-orange-400 to-red-400';
    return 'from-red-400 to-red-500';
  };

  const getCompatibilityEmoji = (score) => {
    if (score >= 80) return '🔥';
    if (score >= 60) return '👍';
    if (score >= 40) return '🤝';
    return '🤔';
  };

  const DNAHelix = ({ compatibility, animate }) => (
    <div className="relative w-16 h-20">
      <svg viewBox="0 0 60 80" className="w-full h-full">
        <defs>
          <linearGradient id="dna-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        
        {/* DNA strands */}
        <path
          d="M15 10 Q30 20 15 30 Q30 40 15 50 Q30 60 15 70"
          stroke="url(#dna-gradient)"
          strokeWidth="3"
          fill="none"
          className={animate ? 'animate-pulse' : ''}
        />
        <path
          d="M45 10 Q30 20 45 30 Q30 40 45 50 Q30 60 45 70"
          stroke="url(#dna-gradient)"
          strokeWidth="3"
          fill="none"
          className={animate ? 'animate-pulse' : ''}
        />
        
        {/* Connection lines */}
        {[20, 40, 60].map((y, i) => (
          <line
            key={i}
            x1="15"
            y1={y}
            x2="45"
            y2={y}
            stroke="url(#dna-gradient)"
            strokeWidth="2"
            opacity={compatibility > (i + 1) * 25 ? 1 : 0.3}
            className={animate ? 'animate-pulse' : ''}
          />
        ))}
      </svg>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white">
          {compatibility}%
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded-3xl p-6 relative overflow-hidden">
      {/* Animated DNA background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-4 h-4 bg-purple-300 rounded-full animate-ping`}
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + (i % 3) * 30}%`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-light mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🧬 Food DNA Matcher
          </h2>
          <p className="text-gray-600 text-sm">
            Discover your culinary compatibility with friends
          </p>
        </div>

        {compatibilityData.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
            <p className="text-gray-500">Analyzing food DNA...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {compatibilityData.slice(0, 5).map((friendData, index) => (
              <div
                key={friendData.id}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 cursor-pointer transition-all duration-300 hover:bg-white/80 hover:scale-[1.02]"
                onClick={() => setSelectedFriend(selectedFriend?.id === friendData.id ? null : friendData)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                      {friendData.friend.display_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {friendData.friend.display_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        @{friendData.friend.username}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <DNAHelix 
                      compatibility={friendData.compatibility} 
                      animate={animationStep === index % 4}
                    />
                    <div className="text-center">
                      <div className="text-2xl">
                        {getCompatibilityEmoji(friendData.compatibility)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {friendData.compatibility >= 80 ? 'Soul Food' :
                         friendData.compatibility >= 60 ? 'Great Match' :
                         friendData.compatibility >= 40 ? 'Good Vibes' : 'Different Tastes'}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedFriend?.id === friendData.id && (
                  <div className="mt-4 pt-4 border-t border-white/30 space-y-4">
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
                              className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full border border-purple-200"
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
                    <button className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                      🍽️ Plan a Food Date
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Fun Facts */}
        <div className="mt-6 bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <h3 className="text-sm font-medium text-gray-900 mb-2">🔬 Food Science Facts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
            <div>
              <span className="font-medium">Did you know?</span> People with similar food preferences often share personality traits!
            </div>
            <div>
              <span className="font-medium">Fun fact:</span> Spice tolerance is influenced by genetics and culture.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDNAMatcher;