import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 max-w-md">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="text-xl font-bold text-primary-600"
          >
            🍽️ Food Diary
          </button>
          
          {user && (
            <button
              onClick={() => navigate('/profile')}
              className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-medium"
            >
              {user.email.charAt(0).toUpperCase()}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
