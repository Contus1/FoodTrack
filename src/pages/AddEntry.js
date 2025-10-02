import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEntries } from '../context/EntriesContext';
import Header from '../components/Header';
import StarRating from '../components/StarRating';
import BottomNavigation from '../components/BottomNavigation';

const AddEntry = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addEntry, uploadImage } = useEntries();
  
  const [formData, setFormData] = useState({
    title: '',
    rating: 3,
    tags: [],
    notes: '',
    photo_url: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const commonTags = ['Spicy', 'Sweet', 'Savory', 'Vegetarian', 'Vegan', 'Healthy', 'Comfort Food', 'Asian', 'Italian', 'Mexican'];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, photo_url: previewUrl }));
    }
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      let photoUrl = '';
      
      if (selectedFile) {
        photoUrl = await uploadImage(selectedFile);
      }

      const entryData = {
        ...formData,
        photo_url: photoUrl,
      };

      const { error } = await addEntry(entryData);
      
      if (error) {
        alert('Error saving entry: ' + error.message);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Error saving entry');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Entry</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {formData.photo_url ? (
                <img
                  src={formData.photo_url}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <p className="text-gray-500">No photo selected</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors"
              >
                {formData.photo_url ? 'Change Photo' : 'Add Photo'}
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dish Name
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="What did you eat?"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <StarRating
              rating={formData.rating}
              onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {commonTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.tags.includes(tag)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="How was it? Any thoughts?"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pb-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default AddEntry;
