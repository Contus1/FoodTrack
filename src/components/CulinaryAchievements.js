import React, { useState, useEffect, useCallback } from 'react';
import { useEntries } from '../context/EntriesContext';
import { useSocial } from '../context/SocialContext';

const CulinaryAchievements = () => {
  const { entries } = useEntries();
  const { friends } = useSocial();
  const [achievements, setAchievements] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [celebrationAchievement, setCelebrationAchievement] = useState(null);

  useEffect(() => {
    calculateAchievements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, friends]);

  const achievementDefinitions = [
    // Explorer Achievements
    {
      id: 'first_bite',
      title: 'First Bite',
      description: 'Share your first culinary experience',
      category: 'explorer',
      icon: '🌱',
      rarity: 'common',
      condition: (stats) => stats.totalEntries >= 1,
      points: 10
    },
    {
      id: 'globe_trotter',
      title: 'Globe Trotter',
      description: 'Try cuisines from 5 different countries',
      category: 'explorer',
      icon: '🌍',
      rarity: 'rare',
      condition: (stats) => stats.uniqueCountries >= 5,
      points: 50
    },
    {
      id: 'street_food_legend',
      title: 'Street Food Legend',
      description: 'Experience 10 street food vendors',
      category: 'explorer',
      icon: '🚚',
      rarity: 'epic',
      condition: (stats) => stats.streetFoodCount >= 10,
      points: 75
    },
    
    // Connoisseur Achievements
    {
      id: 'five_star_critic',
      title: 'Five Star Critic',
      description: 'Rate 20 dishes with 5 stars',
      category: 'connoisseur',
      icon: '⭐',
      rarity: 'rare',
      condition: (stats) => stats.fiveStarRatings >= 20,
      points: 40
    },
    {
      id: 'balanced_palate',
      title: 'Balanced Palate',
      description: 'Have an average rating between 3-4 stars across 30+ entries',
      category: 'connoisseur',
      icon: '⚖️',
      rarity: 'epic',
      condition: (stats) => stats.totalEntries >= 30 && stats.avgRating >= 3 && stats.avgRating <= 4,
      points: 60
    },
    {
      id: 'fine_dining_expert',
      title: 'Fine Dining Expert',
      description: 'Visit 5 Michelin-starred restaurants',
      category: 'connoisseur',
      icon: '🍾',
      rarity: 'legendary',
      condition: (stats) => stats.michelinCount >= 5,
      points: 100
    },
    
    // Social Achievements
    {
      id: 'social_butterfly',
      title: 'Social Butterfly',
      description: 'Connect with 10 fellow food lovers',
      category: 'social',
      icon: '🦋',
      rarity: 'rare',
      condition: (stats) => stats.friendsCount >= 10,
      points: 30
    },
    {
      id: 'tastemaker',
      title: 'Tastemaker',
      description: 'Receive 100 likes on your food posts',
      category: 'social',
      icon: '❤️',
      rarity: 'epic',
      condition: (stats) => stats.totalLikes >= 100,
      points: 70
    },
    {
      id: 'food_influencer',
      title: 'Food Influencer',
      description: 'Get 500 saves on your culinary discoveries',
      category: 'social',
      icon: '📸',
      rarity: 'legendary',
      condition: (stats) => stats.totalSaves >= 500,
      points: 150
    },

    // Adventurer Achievements
    {
      id: 'spice_master',
      title: 'Spice Master',
      description: 'Conquer 15 spicy dishes',
      category: 'adventurer',
      icon: '🌶️',
      rarity: 'rare',
      condition: (stats) => stats.spicyDishes >= 15,
      points: 45
    },
    {
      id: 'dessert_devotee',
      title: 'Dessert Devotee',
      description: 'Indulge in 25 sweet treats',
      category: 'adventurer',
      icon: '🍰',
      rarity: 'epic',
      condition: (stats) => stats.dessertCount >= 25,
      points: 55
    },
    {
      id: 'fusion_pioneer',
      title: 'Fusion Pioneer',
      description: 'Try 10 fusion cuisine dishes',
      category: 'adventurer',
      icon: '🌟',
      rarity: 'legendary',
      condition: (stats) => stats.fusionCount >= 10,
      points: 80
    },

    // Special Achievements
    {
      id: 'midnight_muncher',
      title: 'Midnight Muncher',
      description: 'Log 5 late-night food adventures',
      category: 'special',
      icon: '🌙',
      rarity: 'rare',
      condition: (stats) => stats.lateNightEntries >= 5,
      points: 35
    },
    {
      id: 'weekend_warrior',
      title: 'Weekend Warrior',
      description: 'Document 20 weekend food experiences',
      category: 'special',
      icon: '🎉',
      rarity: 'epic',
      condition: (stats) => stats.weekendEntries >= 20,
      points: 50
    },
    {
      id: 'culinary_completionist',
      title: 'Culinary Completionist',
      description: 'Achieve 1000 total points',
      category: 'special',
      icon: '👑',
      rarity: 'legendary',
      condition: (stats) => stats.totalPoints >= 1000,
      points: 200
    }
  ];

  const calculateStats = () => {
    const stats = {
      totalEntries: entries.length,
      uniqueCountries: new Set(),
      streetFoodCount: 0,
      fiveStarRatings: 0,
      avgRating: 0,
      michelinCount: 0,
      friendsCount: friends.length,
      totalLikes: 0, // Would need to fetch from database
      totalSaves: 0, // Would need to fetch from database
      spicyDishes: 0,
      dessertCount: 0,
      fusionCount: 0,
      lateNightEntries: 0,
      weekendEntries: 0,
      totalPoints: 0
    };

    entries.forEach(entry => {
      // Rating analysis
      if (entry.rating === 5) stats.fiveStarRatings++;
      stats.avgRating += entry.rating || 0;

      // Tag analysis
      entry.tags?.forEach(tag => {
        const tagLower = tag.toLowerCase();
        
        // Country detection
        const countries = ['italian', 'chinese', 'mexican', 'indian', 'japanese', 'french', 'thai', 'korean', 'greek', 'spanish'];
        countries.forEach(country => {
          if (tagLower.includes(country)) {
            stats.uniqueCountries.add(country);
          }
        });

        // Special dish types
        if (['spicy', 'hot', 'chili'].some(spice => tagLower.includes(spice))) {
          stats.spicyDishes++;
        }
        if (['dessert', 'sweet', 'cake', 'ice cream', 'chocolate'].some(dessert => tagLower.includes(dessert))) {
          stats.dessertCount++;
        }
        if (tagLower.includes('fusion')) {
          stats.fusionCount++;
        }
      });

      // Location analysis
      if (entry.location) {
        const locationLower = entry.location.toLowerCase();
        if (locationLower.includes('street') || locationLower.includes('food truck') || locationLower.includes('vendor')) {
          stats.streetFoodCount++;
        }
        if (locationLower.includes('michelin') || locationLower.includes('fine dining')) {
          stats.michelinCount++;
        }
      }

      // Time analysis
      const entryDate = new Date(entry.created_at);
      const hour = entryDate.getHours();
      const dayOfWeek = entryDate.getDay();

      if (hour >= 22 || hour <= 2) {
        stats.lateNightEntries++;
      }
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        stats.weekendEntries++;
      }
    });

    stats.avgRating = stats.totalEntries > 0 ? stats.avgRating / stats.totalEntries : 0;
    stats.uniqueCountries = stats.uniqueCountries.size;

    return stats;
  };

  const calculateAchievements = useCallback(() => {
    const stats = calculateStats();
    const earnedAchievements = [];
    let totalPoints = 0;

    achievementDefinitions.forEach(achievement => {
      const isEarned = achievement.condition(stats);
      if (isEarned) {
        totalPoints += achievement.points;
      }
      
      earnedAchievements.push({
        ...achievement,
        earned: isEarned,
        progress: calculateProgress(achievement, stats)
      });
    });

    // Update total points for completionist achievement
    stats.totalPoints = totalPoints;
    earnedAchievements.forEach(achievement => {
      if (achievement.id === 'culinary_completionist') {
        achievement.earned = achievement.condition(stats);
      }
    });

    setAchievements(earnedAchievements);

    // Check for new achievements to celebrate
    const newAchievements = earnedAchievements.filter(a => a.earned && !localStorage.getItem(`achievement_${a.id}`));
    if (newAchievements.length > 0) {
      const latestAchievement = newAchievements[0];
      setCelebrationAchievement(latestAchievement);
      localStorage.setItem(`achievement_${latestAchievement.id}`, 'true');
      
      setTimeout(() => setCelebrationAchievement(null), 5000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, friends]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    calculateAchievements();
  }, [calculateAchievements]);

  const calculateProgress = (achievement, stats) => {
    // Simple progress calculation for demonstration
    if (achievement.id === 'first_bite') return Math.min(stats.totalEntries, 1) * 100;
    if (achievement.id === 'globe_trotter') return Math.min(stats.uniqueCountries / 5, 1) * 100;
    if (achievement.id === 'five_star_critic') return Math.min(stats.fiveStarRatings / 20, 1) * 100;
    if (achievement.id === 'social_butterfly') return Math.min(stats.friendsCount / 10, 1) * 100;
    return achievement.earned ? 100 : 0;
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-500';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const categories = [
    { id: 'all', label: 'All', icon: '🏆' },
    { id: 'explorer', label: 'Explorer', icon: '🧭' },
    { id: 'connoisseur', label: 'Connoisseur', icon: '🎯' },
    { id: 'social', label: 'Social', icon: '👥' },
    { id: 'adventurer', label: 'Adventurer', icon: '⚡' },
    { id: 'special', label: 'Special', icon: '✨' }
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalPoints = achievements.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="glass-card rounded-2xl p-6 text-center">
        <h2 className="text-2xl font-light mb-3 flex items-center justify-center space-x-2">
          <span>🏆</span>
          <span>Culinary Achievements</span>
        </h2>
        <div className="flex justify-center items-center space-x-8 text-sm">
          <div className="flex flex-col">
            <span className="text-2xl font-light text-orange-600">{earnedCount}/{achievements.length}</span>
            <span className="text-gray-600 text-xs">unlocked</span>
          </div>
          <div className="w-px h-12 bg-gray-200"></div>
          <div className="flex flex-col">
            <span className="text-2xl font-light text-amber-600">{totalPoints}</span>
            <span className="text-gray-600 text-xs">points</span>
          </div>
        </div>
      </div>

      {/* Celebration Modal */}
      {celebrationAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
          <div className="glass-card rounded-3xl p-8 text-center max-w-sm transform animate-bounce shadow-2xl">
            <div className="text-7xl mb-4">{celebrationAchievement.icon}</div>
            <div className="text-sm font-medium text-orange-600 mb-2 uppercase tracking-wider">
              Achievement Unlocked!
            </div>
            <h4 className="text-xl font-light text-gray-900 mb-2">{celebrationAchievement.title}</h4>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">{celebrationAchievement.description}</p>
            <div className={`inline-block px-6 py-2 rounded-full text-white text-sm font-medium bg-gradient-to-r ${getRarityColor(celebrationAchievement.rarity)} shadow-lg`}>
              +{celebrationAchievement.points} points
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="glass-card rounded-xl p-3">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'glass-button hover:scale-105'
              }`}
            >
              <span className="text-base">{category.icon}</span>
              <span>{category.label}</span>
            </button>
              ))}
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map(achievement => (
              <div
                key={achievement.id}
                className={`glass-card rounded-xl p-5 border transition-all duration-300 ${
                  achievement.earned 
                    ? 'border-orange-200 shadow-lg glass-panel-hover' 
                    : 'border-gray-100 opacity-70 hover:opacity-90'
                }`}
              >
                {/* Rarity Badge & Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`text-4xl ${achievement.earned ? 'scale-110' : 'grayscale'} transition-all`}>
                    {achievement.icon}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getRarityColor(achievement.rarity)} shadow-sm`}>
                    {achievement.rarity}
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="font-medium text-gray-900 mb-2 text-base">{achievement.title}</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed min-h-[40px]">{achievement.description}</p>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Progress</span>
                    <span className="font-medium">{Math.round(achievement.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)} transition-all duration-500 ease-out`}
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500 capitalize font-medium">{achievement.category}</span>
                  <span className={`text-sm font-semibold ${achievement.earned ? 'text-orange-600' : 'text-gray-400'}`}>
                    {achievement.earned && '+'}{achievement.points} pts
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Next Achievement Section */}
          {filteredAchievements.length > 0 && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <span>🎯</span>
                <span>Up Next</span>
              </h3>
              {(() => {
                const nextAchievement = filteredAchievements
                  .filter(a => !a.earned)
                  .sort((a, b) => b.progress - a.progress)[0];
                
                return nextAchievement ? (
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                    <span className="text-4xl">{nextAchievement.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{nextAchievement.title}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{nextAchievement.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-orange-600">{nextAchievement.points} pts</div>
                      <div className="text-xs text-gray-500 mt-1">{Math.round(nextAchievement.progress)}% complete</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm text-center py-4">
                    🎉 All achievements in this category completed!
                  </p>
                );
              })()}
            </div>
          )}
    </div>
  );
};

export default CulinaryAchievements;