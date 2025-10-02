import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';

const SocialFeedCard = ({ entry, onLike, onSave, onComment }) => {
  const { user } = useAuth();
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
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const displayedComments = showAllComments ? entry.comments : entry.comments?.slice(0, 2);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate(`/profile/${entry.user_profile?.id}`)}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {entry.user_profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {entry.user_profile?.display_name || 'Unknown User'}
            </h3>
            <p className="text-sm text-gray-500">
              {entry.location && `📍 ${entry.location} • `}{formatTimeAgo(entry.created_at)}
            </p>
          </div>
        </div>
        
        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Image */}
      {entry.photo_url && (
        <div className="aspect-square relative overflow-hidden">
          <img
            src={entry.photo_url}
            alt={entry.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onLike(entry.id)}
              className={`flex items-center space-x-1 ${
                entry.isLiked ? 'text-red-500' : 'text-gray-700'
              } hover:text-red-500 transition-colors`}
            >
              <svg
                className={`w-6 h-6 ${entry.isLiked ? 'fill-current' : 'stroke-current fill-none'}`}
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                />
              </svg>
            </button>
            
            <button
              onClick={() => setIsCommenting(!isCommenting)}
              className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
          
          <button
            onClick={() => onSave(entry.id)}
            className={`${
              entry.isSaved ? 'text-gray-900' : 'text-gray-700'
            } hover:text-gray-900 transition-colors`}
          >
            <svg
              className={`w-6 h-6 ${entry.isSaved ? 'fill-current' : 'stroke-current fill-none'}`}
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
              />
            </svg>
          </button>
        </div>

        {/* Likes count */}
        {entry.likesCount > 0 && (
          <p className="text-sm font-medium text-gray-900 mb-2">
            {entry.likesCount} {entry.likesCount === 1 ? 'like' : 'likes'}
          </p>
        )}

        {/* Caption */}
        <div className="mb-2">
          <p className="text-gray-900">
            <span className="font-medium mr-2">{entry.user_profile?.display_name}</span>
            <span className="font-medium text-lg">{entry.title}</span>
          </p>
          
          <div className="flex items-center mt-1">
            <StarRating rating={entry.rating} readOnly size="sm" />
            <span className="text-sm text-gray-500 ml-2">({entry.rating}/5)</span>
          </div>
          
          {entry.notes && (
            <p className="text-gray-700 mt-2">{entry.notes}</p>
          )}
          
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {entry.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-blue-600 text-sm hover:underline cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Comments */}
        {entry.comments && entry.comments.length > 0 && (
          <div className="space-y-1">
            {entry.comments.length > 2 && !showAllComments && (
              <button
                onClick={() => setShowAllComments(true)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                View all {entry.comments.length} comments
              </button>
            )}
            
            {displayedComments?.map((comment) => (
              <div key={comment.id} className="text-sm">
                <span className="font-medium mr-2">
                  {comment.user_profile?.display_name || 'User'}
                </span>
                <span className="text-gray-700">{comment.content}</span>
              </div>
            ))}
            
            {showAllComments && entry.comments.length > 2 && (
              <button
                onClick={() => setShowAllComments(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Show less
              </button>
            )}
          </div>
        )}

        {/* Add comment */}
        {isCommenting && (
          <form onSubmit={handleSubmitComment} className="mt-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const SocialFeed = () => {
  const { user } = useAuth();
  const { likeEntry, unlikeEntry, saveEntry, unsaveEntry, addComment, getSocialFeed } = useSocial();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeed = async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const feedEntries = await getSocialFeed();
      setEntries(feedEntries);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadFeed();
    }
  }, [user]);

  const handleLike = async (entryId) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    // Optimistic update
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
      // Revert optimistic update
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

    // Optimistic update
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
      // Revert optimistic update
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
    <div className="max-w-md mx-auto space-y-6">
      {/* Refresh button */}
      <div className="flex justify-center">
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
          <div className="w-20 h-20 mx-auto mb-8 border border-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-light text-black mb-4">
            Your Feed is Empty
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed mb-8">
            Follow friends to see their culinary adventures here, or be the first to share a dish!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
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