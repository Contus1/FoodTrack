import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    {
      path: "/",
      icon: (active) => (
        <svg
          className={`w-6 h-6 ${active ? "text-black" : "text-gray-400"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2 : 1.5}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2 : 1.5}
            d="M8 5v14m8-14v14"
          />
        </svg>
      ),
      label: "Gallery",
    },
    {
      path: "/add",
      icon: (active) => (
        <svg
          className={`w-6 h-6 ${active ? "text-black" : "text-gray-400"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2 : 1.5}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      ),
      label: "Create",
    },
    {
      path: "/insights",
      icon: (active) => (
        <svg
          className={`w-6 h-6 ${active ? "text-black" : "text-gray-400"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2 : 1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      label: "Insights",
    },
    {
      path: "/recommendations",
      icon: (active) => (
        <svg
          className={`w-6 h-6 ${active ? "text-black" : "text-gray-400"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2 : 1.5}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      label: "Discover",
    },
    {
      path: "/profile",
      icon: (active) => (
        <svg
          className={`w-6 h-6 ${active ? "text-black" : "text-gray-400"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={active ? 2 : 1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      label: "Profile",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-header z-20" style={{ position: 'fixed', bottom: 0 }}>
      <div className="max-w-4xl mx-auto px-4 safe-area-bottom">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center space-y-1 py-2 px-3 interaction-smooth hover:scale-105"
              >
                {item.icon(active)}
                <span
                  className={`text-xs font-light tracking-wide ${
                    active ? "text-black" : "text-gray-400"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
