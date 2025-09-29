import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEntries } from '../context/EntriesContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import EntryCard from '../components/EntryCard';

const Home = () => {
  const { user } = useAuth();
  const { entries, loading, fetchEntries } = useEntries();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchEntries();
  }, [user, navigate, fetchEntries]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Food Diary</h1>
          <button
            onClick={() => navigate('/add')}
            className="bg-primary-500 text-white px-4 py-2 rounded-full font-medium hover:bg-primary-600 transition-colors"
          >
            + Add Entry
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No entries yet!</p>
            <button
              onClick={() => navigate('/add')}
              className="bg-primary-500 text-white px-6 py-3 rounded-full font-medium hover:bg-primary-600 transition-colors"
            >
              Add Your First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
