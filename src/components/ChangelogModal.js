import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const CHANGELOG_VERSION = "v1.5.0"; // Update this when you add new features
const CHANGELOG_DATE = "2025-11-02"; // Today's date

const ChangelogModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Check if user has seen this changelog version
    const lastSeenVersion = localStorage.getItem(`changelog_seen_${user.id}`);
    const lastSeenDate = localStorage.getItem(`changelog_date_${user.id}`);

    // Show if:
    // 1. Never seen any changelog OR
    // 2. Haven't seen this version OR
    // 3. Last seen date is more than 14 days ago
    const shouldShow = !lastSeenVersion || 
                       lastSeenVersion !== CHANGELOG_VERSION ||
                       (lastSeenDate && isWithinFourteenDays(lastSeenDate));

    if (shouldShow) {
      // Small delay for better UX
      setTimeout(() => setIsOpen(true), 800);
    }
  }, [user]);

  const isWithinFourteenDays = (dateString) => {
    const lastDate = new Date(dateString);
    const today = new Date(CHANGELOG_DATE);
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 14;
  };

  const handleClose = () => {
    if (user) {
      // Mark as seen for this user
      localStorage.setItem(`changelog_seen_${user.id}`, CHANGELOG_VERSION);
      localStorage.setItem(`changelog_date_${user.id}`, CHANGELOG_DATE);
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const features = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      title: "Interactive Map",
      description: "See all your food adventures on a beautiful map"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Location Search",
      description: "Easily find and tag exact restaurant locations"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      title: "Flavor Profiles",
      description: "Discover your unique taste preferences"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: "Smart Suggestions",
      description: "Get personalized dish recommendations"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: "Find Taste Twins",
      description: "Connect with people who love what you love"
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
        <div 
          className="glass-panel rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] sm:max-h-[80vh] overflow-hidden pointer-events-auto animate-slide-up shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-xl z-10 p-6 sm:p-8 pb-5 border-b border-gray-200/50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-3xl sm:text-4xl font-light text-black mb-2 tracking-tight">What's New</h2>
                <p className="text-sm text-gray-500 font-light">
                  {CHANGELOG_VERSION} • November 2025
                </p>
              </div>
              <button
                onClick={handleClose}
                className="flex-shrink-0 w-10 h-10 rounded-full glass-button flex items-center justify-center interaction-smooth hover:bg-gray-100/50 active:scale-95"
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-4" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-2xl glass-panel-light hover:bg-white/70 interaction-smooth"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-700 shadow-sm">
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="text-base sm:text-lg font-medium text-black mb-1 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 font-light leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl p-6 sm:p-8 pt-5 border-t border-gray-200/50">
            <button
              onClick={handleClose}
              className="w-full py-3.5 sm:py-4 px-4 bg-black text-white rounded-2xl font-medium text-base hover:bg-gray-800 interaction-smooth active:scale-98 shadow-lg"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangelogModal;
