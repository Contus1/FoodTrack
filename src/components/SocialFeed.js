import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';
import { getBulkDishCommunityRatings } from '../utils/dishManager';
import supabase from '../utils/supabaseClient';

const SocialFeedCard = ({ entry, onLike, onSave, onComment }) => {
  const [isCommenting, setIsCommenting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [taggedFriendNames, setTaggedFriendNames] = useState([]);
  const navigate = useNavigate();

  // Fetch tagged friend names
  useEffect(() => {
    const fetchTaggedFriends = async () => {
      if (!entry.tagged_friends || entry.tagged_friends.length === 0) return;
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, display_name, username')
          .in('id', entry.tagged_friends);
        
        if (!error && data) {
          setTaggedFriendNames(data);
        }
      } catch (error) {
        console.error('Error fetching tagged friends:', error);
      }
    };
    
    fetchTaggedFriends();
  }, [entry.tagged_friends]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await onComment(entry.id, newComment.trim());
      setNewComment('');
      setIsCommenting(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    
    // Parse the UTC timestamp from Supabase
    const date = new Date(dateString);
    
    // Ensure the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Get current time in UTC
    const now = new Date();
    
    // Calculate difference in milliseconds
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    // Format date in local timezone
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const displayedComments = showAllComments ? entry.comments : entry.comments?.slice(0, 2);

  return (
    <div className="glass-card rounded-2xl overflow-hidden mb-6 glass-panel-hover">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/40">
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => navigate(`/profile/${entry.user_profile?.id}`)}
        >
          {entry.user_profile?.avatar_url ? (
            <img
              src={entry.user_profile.avatar_url}
              alt={entry.user_profile.display_name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50 shadow-sm group-hover:ring-white/80 interaction-smooth"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center ring-2 ring-white/50 shadow-sm group-hover:ring-white/80 interaction-smooth">
              <span className="text-white font-light text-sm">
                {entry.user_profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900 text-sm group-hover:text-black interaction-smooth">
              {entry.user_profile?.display_name || 'Unknown User'}
            </h3>
            <p className="text-xs text-gray-500">
              {entry.location && `${entry.location} • `}{formatTimeAgo(entry.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Image */}
      {entry.photo_url && (
        <div className="relative">
          <img
            src={entry.photo_url}
            alt={entry.title}
            className="w-full h-64 object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 bg-white/60">
        <div className="flex items-start justify-between mb-2">
          <h2 className="font-medium text-gray-900 text-lg">{entry.title}</h2>
          <div className="ml-3 flex flex-col items-end space-y-1.5">
            {entry.rating && (
              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-gray-500 font-light">Personal:</span>
                <div className="glass-badge rounded-lg px-2.5 py-1.5">
                  <span className="text-sm font-medium text-gray-900">{entry.rating}/10</span>
                </div>
              </div>
            )}
            {entry.communityRating && entry.communityRating.totalRatings > 0 && (
              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-gray-400 font-light">Community:</span>
                <div className="glass-panel-light rounded-lg px-2.5 py-1.5">
                  <span className="text-xs font-medium text-gray-600">
                    {entry.communityRating.avgRating.toFixed(1)}/10
                  </span>
                  <span className="text-xs text-gray-400 ml-1">
                    ({entry.communityRating.totalRatings})
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tagged Friends */}
        {taggedFriendNames && taggedFriendNames.length > 0 && (
          <div className="mb-3 glass-panel-light rounded-xl px-3 py-2">
            <p className="text-sm text-gray-600">
              <span className="text-gray-900 font-medium">
                {entry.user_profile?.display_name || 'User'}
              </span>
              {' '}was here with{' '}
              <span className="text-gray-900 font-medium">
                {taggedFriendNames.map((friend, index) => {
                  const name = friend.display_name || `@${friend.username}`;
                  if (index === 0) return name;
                  if (index === taggedFriendNames.length - 1) return ` and ${name}`;
                  return `, ${name}`;
                }).join('')}
              </span>
            </p>
          </div>
        )}

        {entry.notes && (
          <p className="text-gray-700 text-sm mb-3 leading-relaxed">{entry.notes}</p>
        )}

        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {entry.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2.5 py-1 glass-panel-light text-gray-600 text-xs rounded-full font-light"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions - iOS Control Center Style */}
        <div className="flex items-center justify-between pt-3 mt-3">
          <div className="flex items-center space-x-2.5">
            {/* Like Button - Glass Circle */}
            <button 
              onClick={() => onLike(entry.id)}
              className={`group relative w-11 h-11 rounded-full flex items-center justify-center interaction-smooth backdrop-blur-xl ${
                entry.isLiked 
                  ? 'glass-panel shadow-[0_8px_32px_rgba(239,68,68,0.25)]' 
                  : 'glass-panel shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_rgba(239,68,68,0.15)]'
              }`}
            >
              <svg 
                className={`w-5 h-5 interaction-smooth ${
                  entry.isLiked 
                    ? 'text-red-500 scale-110' 
                    : 'text-gray-600 group-hover:text-red-500 group-hover:scale-110'
                }`}
                fill={entry.isLiked ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {entry.likesCount > 0 && (
                <span className={`absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-medium rounded-full glass-badge shadow-sm ${
                  entry.isLiked ? 'text-red-500' : 'text-gray-600'
                }`}>
                  {entry.likesCount}
                </span>
              )}
            </button>
            
            {/* Comment Button - Glass Circle */}
            <button 
              onClick={() => setIsCommenting(!isCommenting)}
              className={`group relative w-11 h-11 rounded-full flex items-center justify-center interaction-smooth backdrop-blur-xl ${
                isCommenting
                  ? 'glass-panel shadow-[0_8px_32px_rgba(59,130,246,0.25)]'
                  : 'glass-panel shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_rgba(59,130,246,0.15)]'
              }`}
            >
              <svg 
                className={`w-5 h-5 interaction-smooth ${
                  isCommenting 
                    ? 'text-blue-500 scale-110' 
                    : 'text-gray-600 group-hover:text-blue-500 group-hover:scale-110'
                }`}
                fill="none" 
                stroke="currentColor" 
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              {entry.comments?.length > 0 && (
                <span className={`absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-medium rounded-full glass-badge shadow-sm ${
                  isCommenting ? 'text-blue-500' : 'text-gray-600'
                }`}>
                  {entry.comments.length}
                </span>
              )}
            </button>
            
            {/* Save Button - Glass Circle */}
            <button 
              onClick={() => onSave(entry.id)}
              className={`group w-11 h-11 rounded-full flex items-center justify-center interaction-smooth backdrop-blur-xl ${
                entry.isSaved 
                  ? 'glass-panel shadow-[0_8px_32px_rgba(217,119,6,0.25)]' 
                  : 'glass-panel shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_rgba(217,119,6,0.15)]'
              }`}
            >
              <svg 
                className={`w-5 h-5 interaction-smooth ${
                  entry.isSaved 
                    ? 'text-amber-600 scale-110' 
                    : 'text-gray-600 group-hover:text-amber-600 group-hover:scale-110'
                }`}
                fill={entry.isSaved ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Comments */}
      {entry.comments && entry.comments.length > 0 && (
        <div className="px-4 pb-4 bg-white/60">
          <div className="space-y-2">
            {displayedComments.map((comment) => (
              <div key={comment.id} className="flex space-x-2.5">
                {comment.user_profile?.avatar_url ? (
                  <img
                    src={comment.user_profile.avatar_url}
                    alt={comment.user_profile.display_name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-white/50 shadow-sm"
                  />
                ) : (
                  <div className="w-7 h-7 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center ring-1 ring-white/50 shadow-sm">
                    <span className="text-white font-light text-xs">
                      {comment.user_profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="glass-panel-light rounded-xl px-3 py-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-gray-900">
                        {comment.user_profile?.display_name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-400 font-light">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {entry.comments.length > 2 && !showAllComments && (
              <button
                onClick={() => setShowAllComments(true)}
                className="text-xs text-gray-500 hover:text-gray-700 ml-9 font-light interaction-smooth"
              >
                View all {entry.comments.length} comments
              </button>
            )}
          </div>
        </div>
      )}

      {/* Comment Input */}
      {isCommenting && (
        <div className="p-4 bg-white/40">
          <form onSubmit={handleSubmitComment} className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black shadow-sm interaction-smooth glass-panel-light"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-5 py-2.5 bg-black text-white text-sm rounded-full hover:bg-gray-800 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed interaction-smooth shadow-md"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const SocialFeed = () => {
  const { user } = useAuth();
  const { likeEntry, unlikeEntry, saveEntry, unsaveEntry, addComment, getSocialFeed } = useSocial();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeed = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const feedEntries = await getSocialFeed();
      
      // Get community ratings for all dishes
      const dishIds = feedEntries
        .filter(entry => entry.dish_id)
        .map(entry => entry.dish_id);
      
      if (dishIds.length > 0) {
        const communityRatings = await getBulkDishCommunityRatings(dishIds);
        
        // Add community ratings to entries
        const entriesWithRatings = feedEntries.map(entry => ({
          ...entry,
          communityRating: entry.dish_id ? communityRatings.get(entry.dish_id) : null
        }));
        
        setEntries(entriesWithRatings);
      } else {
        setEntries(feedEntries);
      }
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getSocialFeed]);

  useEffect(() => {
    if (user) {
      loadFeed();
    }
  }, [user, loadFeed]);

  const handleLike = async (entryId) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    setEntries(prev => prev.map(e => 
      e.id === entryId 
        ? { 
            ...e, 
            isLiked: !e.isLiked,
            likesCount: e.isLiked ? e.likesCount - 1 : e.likesCount + 1
          }
        : e
    ));

    try {
      if (entry.isLiked) {
        await unlikeEntry(entryId);
      } else {
        await likeEntry(entryId);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      setEntries(prev => prev.map(e => 
        e.id === entryId 
          ? { 
              ...e, 
              isLiked: entry.isLiked,
              likesCount: entry.likesCount
            }
          : e
      ));
    }
  };

  const handleSave = async (entryId) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    setEntries(prev => prev.map(e => 
      e.id === entryId ? { ...e, isSaved: !e.isSaved } : e
    ));

    try {
      if (entry.isSaved) {
        await unsaveEntry(entryId);
      } else {
        await saveEntry(entryId);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      setEntries(prev => prev.map(e => 
        e.id === entryId ? { ...e, isSaved: entry.isSaved } : e
      ));
    }
  };

  const handleComment = async (entryId, content) => {
    try {
      const newComment = await addComment(entryId, content);
      setEntries(prev => prev.map(e => 
        e.id === entryId 
          ? { 
              ...e, 
              comments: [...(e.comments || []), newComment]
            }
          : e
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Refresh button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => loadFeed(true)}
          disabled={refreshing}
          className="flex items-center space-x-2 px-5 py-2.5 glass-button rounded-full text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 interaction-smooth"
        >
          <svg 
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="font-light">{refreshing ? 'Refreshing...' : 'Refresh Feed'}</span>
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20">
          <div className="glass-panel rounded-2xl p-8 mx-4">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-gray-500 text-sm mb-2 font-light">Your feed is empty</p>
            <p className="text-gray-400 text-xs font-light">Follow friends to see their dishes here</p>
          </div>
        </div>
      ) : (
        <div>
          {entries.map((entry) => (
            <SocialFeedCard
              key={entry.id}
              entry={entry}
              onLike={handleLike}
              onSave={handleSave}
              onComment={handleComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialFeed;