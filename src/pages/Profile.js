import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Sophisticated Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-1 h-8 bg-black rounded-full"></div>
              <h1 className="text-xl font-light tracking-wide text-black">
                Profile
              </h1>
            </div>
            <div className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="space-y-8">
        
        <div className="bg-white border border-gray-100 rounded-xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-light text-gray-600 uppercase tracking-wider mb-3">
              Email Address
            </label>
            <p className="text-base font-light text-black bg-gray-50 px-4 py-3 rounded-lg">
              {user.email}
            </p>
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={handleSignOut}
              className="w-full px-6 py-3 bg-black text-white font-light tracking-wide rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>        <div className="mt-6">
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Profile;
