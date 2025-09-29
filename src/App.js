import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EntriesProvider } from './context/EntriesContext';
import Home from './pages/Home';
import AddEntry from './pages/AddEntry';
import Profile from './pages/Profile';
import Login from './pages/Login';

function App() {
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
