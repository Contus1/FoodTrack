import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSocial } from '../context/SocialContext';
import { useNavigate } from 'react-router-dom';

const FriendSearch = () => {
  const { searchUsers, sendFriendRequest, friends, sentRequests } = useSocial();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [localSentRequests, setLocalSentRequests] = useState(new Set());
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteQuery, setInviteQuery] = useState('');
  const navigate = useNavigate();

  // Get friend IDs for filtering (memoized to avoid recreating Set on every render)
  const friendIds = useMemo(() => new Set(friends.map(f => f.friend.id)), [friends]);
  
  // Get sent request IDs for filtering (memoized to avoid recreating Set on every render)
  const sentRequestIds = useMemo(() => new Set(sentRequests.map(r => r.addressee_id)), [sentRequests]);

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await searchUsers(query);
      // Filter out existing friends and users with pending requests
      const filteredResults = results.filter(user => 
        !friendIds.has(user.id) && !sentRequestIds.has(user.id)
      );
      setSearchResults(filteredResults);
      
      // If no results found, prepare for invite option
      if (filteredResults.length === 0) {
        setInviteQuery(query);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  }, [searchUsers, friendIds, sentRequestIds]);

  const handleSendRequest = async (userId) => {
    console.log('Handle send request called for user:', userId);
    try {
      const result = await sendFriendRequest(userId);
      console.log('Send friend request result:', result);
      setLocalSentRequests(prev => new Set([...prev, userId]));
    } catch (error) {
      console.error('Error sending friend request:', error);
      if (error.message.includes('already sent') || error.message.includes('already friends')) {
        alert('Friend request already sent or you are already friends with this user.');
      } else {
        alert('Failed to send friend request. Please try again.');
      }
    }
  };

  const handleInvite = () => {
    setShowInviteModal(true);
  };

  const generateInviteMessage = (username) => {
    const appUrl = window.location.origin;
    return `Hey ${username}! 🍽️

I'm using FoodTrack to share and discover amazing food experiences, and I'd love to connect with you!

FoodTrack lets you:
🌟 Share your culinary adventures with photos and ratings
🗺️ Discover new restaurants and cuisines
👥 Connect with friends and see their food discoveries
🏆 Unlock achievements for your food journey

Join me on FoodTrack: ${appUrl}

Hope to see you there! 😊`;
  };

  const copyInviteMessage = () => {
    const message = generateInviteMessage(inviteQuery);
    navigator.clipboard.writeText(message);
    alert('Invite message copied to clipboard!');
    setShowInviteModal(false);
  };

  const shareViaWhatsApp = () => {
    const message = generateInviteMessage(inviteQuery);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowInviteModal(false);
  };

  const shareViaEmail = () => {
    const message = generateInviteMessage(inviteQuery);
    const subject = `Join me on FoodTrack! 🍽️`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.open(emailUrl);
    setShowInviteModal(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by username or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 md:h-12 pl-11 md:pl-12 pr-4 bg-gray-50 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
        />
        <svg className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
        </svg>
        {searching && (
          <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2">
            <div className="w-3 h-3 md:w-4 md:h-4 border border-gray-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 md:p-4 bg-white border border-gray-100 rounded-xl">
              <div 
                className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                onClick={() => navigate(`/profile/${user.id}`)}
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-sm md:text-base">
                      {user.display_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm md:text-base truncate">{user.display_name}</h3>
                  <p className="text-xs md:text-sm text-gray-500 truncate">@{user.username}</p>
                  {user.bio && (
                    <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-1">{user.bio}</p>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => handleSendRequest(user.id)}
                disabled={localSentRequests.has(user.id) || sentRequestIds.has(user.id)}
                className={`px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-lg transition-colors flex-shrink-0 ml-2 ${
                  localSentRequests.has(user.id) || sentRequestIds.has(user.id)
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {localSentRequests.has(user.id) || sentRequestIds.has(user.id) ? 'Sent' : 'Add'}
              </button>
            </div>
          ))}
        </div>
      )}

      {searchQuery && !searching && searchResults.length === 0 && (
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📧</span>
            </div>
            <p className="text-gray-500 mb-2">No users found for "{searchQuery}"</p>
            <p className="text-sm text-gray-400 mb-6">
              Maybe they haven't joined FoodTrack yet?
            </p>
          </div>
          
          <button
            onClick={handleInvite}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            📨 Invite "{searchQuery}" to FoodTrack
          </button>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              ✕
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">🍽️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Invite "{inviteQuery}" to FoodTrack!
              </h3>
              <p className="text-gray-600 text-sm">
                Share the joy of food discovery with your friend
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={copyInviteMessage}
                className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center space-x-3 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  📋
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">Copy Invite Message</div>
                  <div className="text-sm text-gray-500">Copy to clipboard</div>
                </div>
              </button>

              <button
                onClick={shareViaWhatsApp}
                className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-xl flex items-center space-x-3 transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  💬
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">Share via WhatsApp</div>
                  <div className="text-sm text-gray-500">Send directly to WhatsApp</div>
                </div>
              </button>

              <button
                onClick={shareViaEmail}
                className="w-full p-4 bg-orange-50 hover:bg-orange-100 rounded-xl flex items-center space-x-3 transition-colors"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  📧
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">Share via Email</div>
                  <div className="text-sm text-gray-500">Send an email invitation</div>
                </div>
              </button>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-800 mb-2">Invite Preview:</h4>
              <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border max-h-32 overflow-y-auto">
                {generateInviteMessage(inviteQuery)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FriendRequests = () => {
  const { friendRequests, acceptFriendRequest, declineFriendRequest, loadFriends } = useSocial();
  const navigate = useNavigate();

  // Refresh friend requests when component mounts
  useEffect(() => {
    console.log('FriendRequests component mounted, reloading friends...');
    loadFriends();
  }, [loadFriends]);

  const handleAccept = async (requestId) => {
    try {
      await acceptFriendRequest(requestId);
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await declineFriendRequest(requestId);
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  console.log('Current friend requests:', friendRequests);

  if (friendRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 border border-gray-200 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-gray-500">No friend requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 md:space-y-3">
      {friendRequests.map((request) => (
        <div key={request.id} className="flex items-center justify-between p-3 md:p-4 bg-white border border-gray-100 rounded-xl">
          <div 
            className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
            onClick={() => navigate(`/profile/${request.requester.id}`)}
          >
            {request.requester?.avatar_url ? (
              <img
                src={request.requester.avatar_url}
                alt={request.requester.display_name}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium text-sm md:text-base">
                  {request.requester?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm md:text-base truncate">{request.requester?.display_name}</h3>
              <p className="text-xs md:text-sm text-gray-500 truncate">@{request.requester?.username}</p>
              <p className="text-xs md:text-sm text-gray-400 truncate">Wants to be friends</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-1 md:space-y-0 md:space-x-2 flex-shrink-0 ml-2">
            <button
              onClick={() => handleAccept(request.id)}
              className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white text-xs md:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => handleDecline(request.id)}
              className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-100 text-gray-700 text-xs md:text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const SentRequests = () => {
  const { sentRequests, cancelFriendRequest } = useSocial();
  const navigate = useNavigate();

  const handleCancel = async (requestId) => {
    try {
      await cancelFriendRequest(requestId);
    } catch (error) {
      console.error('Error canceling friend request:', error);
      alert('Failed to cancel friend request. Please try again.');
    }
  };

  if (sentRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 border border-gray-200 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <p className="text-gray-500">No sent requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 md:space-y-3">
      {sentRequests.map((request) => (
        <div key={request.id} className="flex items-center justify-between p-3 md:p-4 bg-white border border-gray-100 rounded-xl">
          <div 
            className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
            onClick={() => navigate(`/profile/${request.addressee.id}`)}
          >
            {request.addressee?.avatar_url ? (
              <img
                src={request.addressee.avatar_url}
                alt={request.addressee.display_name}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium text-sm md:text-base">
                  {request.addressee?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm md:text-base truncate">{request.addressee?.display_name}</h3>
              <p className="text-xs md:text-sm text-gray-500 truncate">@{request.addressee?.username}</p>
              <p className="text-xs md:text-sm text-gray-400 truncate">Request sent</p>
            </div>
          </div>
          
          <div className="flex-shrink-0 ml-2">
            <button
              onClick={() => handleCancel(request.id)}
              className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-100 text-gray-700 text-xs md:text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const FriendsList = () => {
  const { friends } = useSocial();
  const navigate = useNavigate();

  if (friends.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 border border-gray-200 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-gray-500">No friends yet</p>
        <p className="text-sm text-gray-400 mt-1">Start by searching for people to connect with</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 md:space-y-3">
      {friends.map((friendship) => (
        <div 
          key={friendship.id} 
          className="flex items-center space-x-3 p-3 md:p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => navigate(`/profile/${friendship.friend.id}`)}
        >
          {friendship.friend?.avatar_url ? (
            <img
              src={friendship.friend.avatar_url}
              alt={friendship.friend.display_name}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-sm md:text-base">
                {friendship.friend?.display_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm md:text-base truncate">{friendship.friend?.display_name}</h3>
            <p className="text-xs md:text-sm text-gray-500 truncate">@{friendship.friend?.username}</p>
            {friendship.friend?.bio && (
              <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-1">{friendship.friend.bio}</p>
            )}
          </div>
          <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      ))}
    </div>
  );
};

const FriendsManager = () => {
  const [activeTab, setActiveTab] = useState('search');
  const { friendRequests, sentRequests } = useSocial();

  const tabs = [
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'requests', label: 'Requests', icon: '📨', badge: friendRequests.length },
    { id: 'sent', label: 'Sent', icon: '📤', badge: sentRequests.length },
    { id: 'friends', label: 'Friends', icon: '👥' }
  ];

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-4 md:mb-6 -mx-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 py-2 md:py-3 px-1 md:px-4 text-xs md:text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-sm md:text-base">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden text-xs">{tab.label}</span>
            {tab.badge > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[16px] md:min-w-[20px] text-center leading-none">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4 md:space-y-6">
        {activeTab === 'search' && <FriendSearch />}
        {activeTab === 'requests' && <FriendRequests />}
        {activeTab === 'sent' && <SentRequests />}
        {activeTab === 'friends' && <FriendsList />}
      </div>
    </div>
  );
};

export default FriendsManager;