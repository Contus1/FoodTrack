import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EntriesProvider } from './context/EntriesContext';
import { SocialProvider } from './context/SocialContext';
import { NotificationProvider } from './context/NotificationContext';
import Home from './pages/Home';
import AddEntry from './pages/AddEntry';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Insights from './pages/Insights';
import RecommendationsPage from './pages/RecommendationsPage';
import AuthPage from './pages/AuthPage';
import SetupPage from './components/SetupPage';
import NotificationPrompt from './components/NotificationPrompt';
import NotificationToast from './components/NotificationToast';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  
  return supabaseUrl && 
         supabaseAnonKey && 
         supabaseUrl !== 'your-supabase-url-here' && 
         supabaseAnonKey !== 'your-supabase-anon-key-here';
};

const AppContent = () => {
  const { loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-light">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SocialProvider>
      <EntriesProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen bg-white">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/add" element={<AddEntry />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:userId" element={<UserProfile />} />
                <Route path="/login" element={<AuthPage />} />
              </Routes>
              <NotificationPrompt />
              <NotificationToast />
            </div>
          </Router>
        </NotificationProvider>
      </EntriesProvider>
    </SocialProvider>
  );
};

const App = () => {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return <SetupPage />;
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;