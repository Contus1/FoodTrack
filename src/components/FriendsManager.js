import React, { useState, useEffect } from 'react';
import { useSocial } from '../context/SocialContext';
import { useNavigate } from 'react-router-dom';

const FriendSearch = () => {
  const { searchUsers, sendFriendRequest, friends } = useSocial();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sentRequests, setSentRequests] = useState(new Set());
  const navigate = useNavigate();

  // Get friend IDs for filtering
  const friendIds = new Set(friends.map(f => f.friend.id));

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await searchUsers(query);
      // Filter out existing friends
      const filteredResults = results.filter(user => !friendIds.has(user.id));
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await sendFriendRequest(userId);
      setSentRequests(prev => new Set([...prev, userId]));
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by username or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-12 pr-4 bg-gray-50 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
        />
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
        </svg>
        {searching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border border-gray-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
              <div 
                className="flex items-center space-x-3 cursor-pointer flex-1"
                onClick={() => navigate(`/profile/${user.id}`)}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user.display_name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{user.display_name}</h3>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                  {user.bio && (
                    <p className="text-sm text-gray-600 mt-1">{user.bio}</p>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => handleSendRequest(user.id)}
                disabled={sentRequests.has(user.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  sentRequests.has(user.id)
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {sentRequests.has(user.id) ? 'Sent' : 'Add Friend'}
              </button>
            </div>
          ))}
        </div>
      )}

      {searchQuery && !searching && searchResults.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No users found for "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};

const FriendRequests = () => {
  const { friendRequests, acceptFriendRequest, declineFriendRequest } = useSocial();
  const navigate = useNavigate();

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
    <div className="space-y-3">
      {friendRequests.map((request) => (
        <div key={request.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl">
          <div 
            className="flex items-center space-x-3 cursor-pointer flex-1"
            onClick={() => navigate(`/profile/${request.requester.id}`)}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {request.requester?.display_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{request.requester?.display_name}</h3>
              <p className="text-sm text-gray-500">@{request.requester?.username}</p>
              <p className="text-sm text-gray-400">Wants to be friends</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleAccept(request.id)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => handleDecline(request.id)}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Decline
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
    <div className="grid grid-cols-1 gap-3">
      {friends.map((friendship) => (
        <div 
          key={friendship.id} 
          className="flex items-center space-x-3 p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => navigate(`/profile/${friendship.friend.id}`)}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {friendship.friend?.display_name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{friendship.friend?.display_name}</h3>
            <p className="text-sm text-gray-500">@{friendship.friend?.username}</p>
            {friendship.friend?.bio && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">{friendship.friend.bio}</p>
            )}
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      ))}
    </div>
  );
};

const FriendsManager = () => {
  const [activeTab, setActiveTab] = useState('search');
  const { friendRequests } = useSocial();

  const tabs = [
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'requests', label: 'Requests', icon: '📨', badge: friendRequests.length },
    { id: 'friends', label: 'Friends', icon: '👥' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'search' && <FriendSearch />}
        {activeTab === 'requests' && <FriendRequests />}
        {activeTab === 'friends' && <FriendsList />}
      </div>
    </div>
  );
};

export default FriendsManager;