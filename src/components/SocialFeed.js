import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';
import { getBulkDishCommunityRatings } from '../utils/dishManager';

const SocialFeedCard = ({ entry, onLike, onSave, onComment }) => {
  const [isCommenting, setIsCommenting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const navigate = useNavigate();

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
    <div className="bg-white border border-gray-100 rounded-lg overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate(`/profile/${entry.user_profile?.id}`)}
        >
          {entry.user_profile?.avatar_url ? (
            <img
              src={entry.user_profile.avatar_url}
              alt={entry.user_profile.display_name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-light text-sm">
                {entry.user_profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900 text-sm">
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
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h2 className="font-medium text-gray-900 text-lg">{entry.title}</h2>
          <div className="ml-3 flex flex-col items-end space-y-1">
            {entry.rating && (
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500 mr-1">Personal:</span>
                <div className="bg-white rounded-lg px-2 py-1 border border-gray-100">
                  <span className="text-sm font-medium text-gray-900">{entry.rating}/10</span>
                </div>
              </div>
            )}
            {entry.communityRating && entry.communityRating.totalRatings > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-400 mr-1">Community:</span>
                <div className="bg-gray-50 rounded-lg px-2 py-1">
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

        {entry.notes && (
          <p className="text-gray-700 text-sm mb-3 leading-relaxed">{entry.notes}</p>
        )}

        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {entry.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onLike(entry.id)}
              className={`flex items-center space-x-1 transition-colors ${
                entry.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <svg 
                className="w-4 h-4" 
                fill={entry.isLiked ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-xs">{entry.isLiked ? 'Liked' : 'Like'}</span>
              {entry.likesCount > 0 && (
                <span className="text-xs">({entry.likesCount})</span>
              )}
            </button>
            
            <button 
              onClick={() => setIsCommenting(!isCommenting)}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a9.013 9.013 0 01-5.916-2.165L3 21l2.165-4.084A9.013 9.013 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
              <span className="text-xs">Comment</span>
              {entry.comments?.length > 0 && (
                <span className="text-xs">({entry.comments.length})</span>
              )}
            </button>
            
            <button 
              onClick={() => onSave(entry.id)}
              className={`flex items-center space-x-1 transition-colors ${
                entry.isSaved ? 'text-yellow-500' : 'text-gray-600 hover:text-yellow-500'
              }`}
            >
              <svg 
                className="w-4 h-4" 
                fill={entry.isSaved ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="text-xs">{entry.isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments */}
      {entry.comments && entry.comments.length > 0 && (
        <div className="px-4 pb-4">
          <div className="space-y-2">
            {displayedComments.map((comment) => (
              <div key={comment.id} className="flex space-x-2">
                {comment.user_profile?.avatar_url ? (
                  <img
                    src={comment.user_profile.avatar_url}
                    alt={comment.user_profile.display_name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-white font-light text-xs">
                      {comment.user_profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-gray-900">
                        {comment.user_profile?.display_name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {entry.comments.length > 2 && !showAllComments && (
              <button
                onClick={() => setShowAllComments(true)}
                className="text-xs text-gray-500 hover:text-gray-700 ml-8"
              >
                View all {entry.comments.length} comments
              </button>
            )}
          </div>
        </div>
      )}

      {/* Comment Input */}
      {isCommenting && (
        <div className="border-t border-gray-100 p-4">
          <form onSubmit={handleSubmitComment} className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-full text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        >
          <svg 
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-sm mb-4">Your feed is empty</p>
          <p className="text-gray-400 text-xs">Follow friends to see their dishes here</p>
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