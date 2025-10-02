import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import supabase from '../utils/supabaseClient';
import EntryCard from '../components/EntryCard';
import BottomNavigation from '../components/BottomNavigation';

const UserProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { friends, sendFriendRequest, userProfile } = useSocial();
  const navigate = useNavigate();
  
  const [targetUser, setTargetUser] = useState(null);
  const [userEntries, setUserEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState(null);

  useEffect(() => {
    if (userId === user?.id) {
      navigate('/profile');
      return;
    }
    
    loadUserData();
  }, [userId, user]);

  useEffect(() => {
    // Check friendship status
    const friendship = friends.find(f => f.friend.id === userId);
    setIsFollowing(!!friendship);
    setFriendshipStatus(friendship?.status);
  }, [friends, userId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error loading user profile:', profileError);
        navigate('/');
        return;
      }

      setTargetUser(profileData);

      // Load user's public entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('entries')
        .select(`
          *,
          user_profile:user_profiles(*),
          likes:entry_likes(user_id),
          saves:entry_saves(user_id),
          comments:entry_comments(
            *,
            user_profile:user_profiles(*)
          ),
          _count:entry_likes(count)
        `)
        .eq('user_id', userId)
        .eq('is_private', false)
        .order('created_at', { ascending: false });

      if (entriesError) {
        console.error('Error loading user entries:', entriesError);
      } else {
        // Process entries with interaction flags
        const processedEntries = entriesData?.map(entry => ({
          ...entry,
          isLiked: entry.likes?.some(like => like.user_id === user?.id) || false,
          isSaved: entry.saves?.some(save => save.user_id === user?.id) || false,
          likesCount: entry._count?.[0]?.count || 0
        })) || [];
        
        setUserEntries(processedEntries);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      await sendFriendRequest(userId);
      setFriendshipStatus('pending');
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-light text-black mb-2">User not found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const getButtonText = () => {
    if (friendshipStatus === 'pending') return 'Request Sent';
    if (isFollowing) return 'Friends';
    return 'Add Friend';
  };

  const getButtonClass = () => {
    if (friendshipStatus === 'pending') return 'bg-gray-100 text-gray-500 cursor-not-allowed';
    if (isFollowing) return 'bg-green-100 text-green-700';
    return 'bg-blue-600 text-white hover:bg-blue-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black rounded-full hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-light tracking-wide text-black">
                @{targetUser.username}
              </h1>
            </div>
            
            <button
              onClick={() => navigate('/friends')}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black rounded-full hover:bg-gray-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-6">
            {/* Profile Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {targetUser.display_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-2xl font-light text-black">
                  {targetUser.display_name}
                </h1>
                <button
                  onClick={handleSendFriendRequest}
                  disabled={friendshipStatus === 'pending' || isFollowing}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${getButtonClass()}`}
                >
                  {getButtonText()}
                </button>
              </div>
              
              <p className="text-gray-500 text-sm mb-2">@{targetUser.username}</p>
              
              {targetUser.bio && (
                <p className="text-gray-700 text-sm mb-4">{targetUser.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex space-x-8 text-center">
            <div>
              <div className="text-lg font-medium text-black">{userEntries.length}</div>
              <div className="text-sm text-gray-500">Dishes</div>
            </div>
            <div>
              <div className="text-lg font-medium text-black">
                {userEntries.reduce((sum, entry) => sum + (entry.rating || 0), 0) / Math.max(userEntries.length, 1) || 0}
              </div>
              <div className="text-sm text-gray-500">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {userEntries.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-8 border border-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h2 className="text-xl font-light text-black mb-4">
              No public dishes
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
              {targetUser.display_name} hasn't shared any dishes yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} viewMode="grid" />
            ))}
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default UserProfile;