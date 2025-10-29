import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';
import OptimizedImage from './OptimizedImage';
import { useEntries } from '../context/EntriesContext';

const EntryCard = ({ entry, viewMode = 'list' }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { deleteEntry } = useEntries();
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntry(entry.id);
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry');
      }
    }
    setShowMenu(false);
  };

  const handleEdit = () => {
    navigate(`/add?edit=${entry.id}`);
    setShowMenu(false);
  };

  if (viewMode === 'grid') {
    return (
      <article className="group cursor-pointer relative">
        {/* Click outside to close menu */}
        {showMenu && (
          <div 
            className="fixed inset-0 z-5" 
            onClick={() => setShowMenu(false)}
          />
        )}
        
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50 aspect-[4/5] rounded-xl shadow-sm">
          {entry.photo_url ? (
            <OptimizedImage
              src={entry.photo_url}
              alt={entry.title}
              className="w-full h-full transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
          )}
          
          {/* Overlay Info with Glass Effect */}
          <div className="absolute inset-0 glass-image-overlay opacity-0 group-hover:opacity-100 interaction-smooth">
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white font-light text-lg mb-1 truncate drop-shadow-sm">
                {entry.title}
              </h3>
              {entry.location && (
                <p className="text-white/90 text-xs font-light truncate drop-shadow-sm">
                  {entry.location}
                </p>
              )}
            </div>
          </div>
          
          {/* Rating & Menu with Glass */}
          <div className="absolute top-3 right-3 flex items-center space-x-2">
            <div className="glass-badge px-2 py-1 rounded-full">
              <StarRating value={entry.rating} readonly size="sm" />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-7 h-7 glass-button rounded-full flex items-center justify-center interaction-smooth"
              >
                <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
              {showMenu && (
                <div className="absolute right-0 top-8 glass-panel rounded-xl py-1 z-10 min-w-[100px]">
                  <button
                    onClick={handleEdit}
                    className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-white/40 interaction-smooth flex items-center space-x-2"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50/60 interaction-smooth flex items-center space-x-2"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom Info */}
        <div className="pt-3">
          <div className="flex items-start justify-between">
            <h3 className="font-light text-black text-sm leading-tight">
              {entry.title}
            </h3>
            <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
              {formatDate(entry.created_at)}
            </span>
          </div>
          {entry.location && (
            <p className="text-xs text-gray-500 mt-1 font-light">
              {entry.location}
            </p>
          )}
        </div>
      </article>
    );
  }

  // List view (default)
  return (
    <article className="group cursor-pointer relative glass-card rounded-2xl overflow-hidden glass-panel-hover">
      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowMenu(false)}
        />
      )}
      
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 h-64">
        {entry.photo_url ? (
          <OptimizedImage
            src={entry.photo_url}
            alt={entry.title}
            className="w-full h-full transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
        )}
        
        {/* Rating & Menu with Glass */}
        <div className="absolute top-4 right-4 flex items-center space-x-3">
          <div className="glass-badge px-3 py-2 rounded-full">
            <StarRating value={entry.rating} readonly size="sm" />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-9 h-9 glass-button rounded-full flex items-center justify-center interaction-smooth"
            >
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 glass-panel rounded-2xl py-2 z-10 min-w-[120px]">
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-white/40 interaction-smooth flex items-center space-x-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50/60 interaction-smooth flex items-center space-x-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 bg-white/60">
        {/* Title & Date */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-light text-black leading-tight flex-1 pr-4">
            {entry.title}
          </h3>
          <span className="text-xs text-gray-400 flex-shrink-0 font-light tracking-wide">
            {formatDate(entry.created_at)}
          </span>
        </div>

        {/* Location */}
        {entry.location && (
          <div className="flex items-center space-x-2 mb-3">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <span className="text-sm text-gray-600 font-light">{entry.location}</span>
          </div>
        )}

        {/* Notes */}
        {entry.notes && (
          <p className="text-gray-600 text-sm font-light leading-relaxed mb-4 italic">
            "{entry.notes}"
          </p>
        )}

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {entry.tags.slice(0, 4).map((tag, index) => (
              <span key={index} className="px-3 py-1 text-xs glass-panel-light text-gray-600 rounded-full font-light">
                {tag}
              </span>
            ))}
            {entry.tags.length > 4 && (
              <span className="px-3 py-1 text-xs text-gray-400 font-light">
                +{entry.tags.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default EntryCard;
