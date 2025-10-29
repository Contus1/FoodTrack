import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SocialFeed from '../components/SocialFeed';
import FriendsManager from '../components/FriendsManager';
import BottomNavigation from '../components/BottomNavigation';

const Home = () => {
  const { user } = useAuth();
  const { userProfile, friendRequests } = useSocial();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('feed');
  const [showNotificationBadge, setShowNotificationBadge] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    setShowNotificationBadge(friendRequests.length > 0);
  }, [friendRequests]);

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && (tab === 'friends' || tab === 'feed')) {
      setActiveTab(tab);
      // Clear the URL parameter after setting the tab
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-16">
      {/* Header with Liquid Glass */}
      <div className="sticky top-0 glass-header z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-1 h-6 md:h-8 bg-gradient-to-b from-gray-900 to-black rounded-full shadow-sm"></div>
              <div>
                <h1 className="text-xl md:text-2xl font-light tracking-wide text-black">
                  FoodTrack
                </h1>
                <p className="text-[9px] text-gray-400 mt-0.5 tracking-wide">
                  Made with love in Korea
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 md:space-x-4">
              {/* Add Entry Button - iOS Control Center Style */}
              <button
                onClick={() => navigate('/add')}
                className="w-11 h-11 md:w-12 md:h-12 glass-panel rounded-full flex items-center justify-center hover:bg-white/90 interaction-smooth shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.18)] backdrop-blur-xl"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
              
              {/* Profile Avatar with Glass Ring */}
              <button
                onClick={() => navigate('/profile')}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white/50 shadow-sm hover:ring-white/80 interaction-smooth"
              >
                {userProfile?.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt={userProfile.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-black text-white flex items-center justify-center text-xs md:text-sm font-light">
                    {userProfile?.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex mt-3 md:mt-4 space-x-6 md:space-x-8">
            <button
              onClick={() => setActiveTab('feed')}
              className={`relative py-2 px-1 text-sm font-medium interaction-smooth ${
                activeTab === 'feed'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`relative py-2 px-1 text-sm font-medium interaction-smooth ${
                activeTab === 'friends'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Friends
              {showNotificationBadge && (
                <span className="absolute -top-1 -right-2 w-3 h-3 bg-red-500 rounded-full shadow-sm animate-float-gentle"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
        {activeTab === 'feed' && <SocialFeed />}
        {activeTab === 'friends' && <FriendsManager />}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Home;