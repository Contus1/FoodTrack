import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EntriesProvider } from './context/EntriesContext';
import Home from './pages/Home';
import AddEntry from './pages/AddEntry';
import Profile from './pages/Profile';
import Login from './pages/Login';
import SetupPage from './components/SetupPage';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  
  return supabaseUrl && 
         supabaseAnonKey && 
         supabaseUrl !== 'your-supabase-url-here' && 
         supabaseAnonKey !== 'your-supabase-anon-key-here';
};

function App() {
  // Show setup page if Supabase is not configured
  if (!isSupabaseConfigured()) {
    return <SetupPage />;
  }

  return (
    <AuthProvider>
      <EntriesProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/add" element={<AddEntry />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </div>
        </Router>
      </EntriesProvider>
    </AuthProvider>
  );
}

export default App;
