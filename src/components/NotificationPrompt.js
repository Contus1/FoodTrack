import React from "react";
import { useNotifications } from "../context/NotificationContext";

const NotificationPrompt = () => {
  // TEMPORARILY DISABLED - Notifications are turned off
  return null;
  
  /* ORIGINAL CODE - COMMENTED OUT
  const { showPrompt, requestPermission, dismissPrompt } = useNotifications();

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <span className="text-3xl">🔔</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Stay Connected!</h3>
          <p className="text-sm text-gray-600 mb-3">
            Get notified when friends post new meals or share updates
          </p>
          <div className="flex gap-2">
            <button
              onClick={requestPermission}
              className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors text-sm"
            >
              Enable Notifications
            </button>
            <button
              onClick={dismissPrompt}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
            >
              Not Now
            </button>
          </div>
        </div>
        <button
          onClick={dismissPrompt}
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
  */
};

export default NotificationPrompt;
