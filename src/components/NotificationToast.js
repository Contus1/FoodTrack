import React from 'react';
import { useNotifications } from '../context/NotificationContext';

const NotificationToast = () => {
  const { notifications, markAsRead } = useNotifications();

  // Get the most recent unread notification
  const latestUnread = notifications.find((n) => !n.read);

  if (!latestUnread) return null;

  const handleClose = () => {
    markAsRead(latestUnread.id);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'new_post':
        return '🍽️';
      case 'friend_request':
        return '👋';
      case 'stat_update':
        return '📊';
      case 'achievement':
        return '🏆';
      default:
        return '🔔';
    }
  };

  return (
    <div className="fixed top-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 animate-slide-down">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-2xl">
          {getIcon(latestUnread.type)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 mb-1 truncate">
            {latestUnread.title}
          </h4>
          <p className="text-sm text-gray-600 line-clamp-2">
            {latestUnread.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(latestUnread.created_at).toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
