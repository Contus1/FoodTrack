import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEntries } from '../context/EntriesContext';
import BottomNavigation from '../components/BottomNavigation';
import StarRating from '../components/StarRating';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { compressImage, shouldCompress } from '../utils/imageOptimization';
import { getOrCreateDish } from '../utils/dishManager';

const AddEntry = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addEntry, updateEntry, uploadImage, entries, deleteEntry } = useEntries();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;
  
  const [formData, setFormData] = useState({
    title: '',
    rating: 10,
    tags: [],
    notes: '',
    location: '',
    photo_url: '',
    is_private: false, // Default to public posts
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);

  // Load entry data for editing
  useEffect(() => {
    console.log('Edit effect triggered:', { isEditing, editId, entriesLength: entries.length });
    if (isEditing && entries.length > 0) {
      const entryToEdit = entries.find(entry => entry.id === editId);
      console.log('Entry to edit:', entryToEdit);
      if (entryToEdit) {
        setFormData({
          title: entryToEdit.title || '',
          rating: entryToEdit.rating || 10,
          tags: entryToEdit.tags || [],
          notes: entryToEdit.notes || '',
          location: entryToEdit.location || '',
          photo_url: entryToEdit.photo_url || '',
          is_private: entryToEdit.is_private || false,
        });
        console.log('Form data set for editing');
      } else {
        console.log('Entry not found with ID:', editId);
      }
    }
  }, [isEditing, editId, entries]);

  const commonTags = ['Spicy', 'Sweet', 'Savory', 'Vegetarian', 'Vegan', 'Healthy', 'Comfort Food', 'Asian', 'Italian', 'Mexican'];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompressing(true);
      try {
        // Compress image if it's larger than 1MB
        const fileToUse = shouldCompress(file) 
          ? await compressImage(file, {
              maxWidth: 1200,
              maxHeight: 1200,
              quality: 0.85
            })
          : file;
        
        setSelectedFile(fileToUse);
        // Create preview URL
        const previewUrl = URL.createObjectURL(fileToUse);
        setFormData(prev => ({ ...prev, photo_url: previewUrl }));
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fall back to original file
        setSelectedFile(file);
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, photo_url: previewUrl }));
      } finally {
        setCompressing(false);
      }
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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteEntry(editId);
      if (result.error) {
        console.error('Delete entry error:', result.error);
        alert('Error deleting entry: ' + result.error.message);
      } else {
        console.log('Entry deleted successfully');
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Error deleting entry');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    console.log('HandleSubmit called:', { isEditing, editId, formData });
    setLoading(true);
    try {
      let photoUrl = formData.photo_url;
      
      // Only upload new image if file was selected
      if (selectedFile) {
        photoUrl = await uploadImage(selectedFile);
      }

      // Get or create dish based on title
      let dishId = null;
      if (formData.title && formData.title.trim()) {
        try {
          const dish = await getOrCreateDish(formData.title);
          dishId = dish.id;
          console.log('Dish created/found:', dish);
        } catch (dishError) {
          console.error('Error managing dish:', dishError);
          // Continue without dish linkage if there's an error
        }
      }

      const entryData = {
        ...formData,
        photo_url: photoUrl,
        dish_id: dishId,
      };

      let result;
      if (isEditing) {
        console.log('Attempting to update entry with data:', entryData);
        result = await updateEntry(editId, entryData);
        console.log('Update entry result:', result);
      } else {
        console.log('Attempting to add new entry with data:', entryData);
        result = await addEntry(entryData);
        console.log('Add entry result:', result);
      }
      
      if (result.error) {
        console.error('Entry operation error:', result.error);
        alert(`Error ${isEditing ? 'updating' : 'saving'} entry: ` + result.error.message);
      } else {
        console.log('Entry operation successful, navigating to home');
        navigate('/');
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'saving'} entry:`, error);
      alert(`Error ${isEditing ? 'updating' : 'saving'} entry`);
    } finally {
      setLoading(false);
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
            <button
              onClick={() => navigate('/')}
              className="w-11 h-11 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-50 rounded-full transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-1 h-8 bg-black rounded-full"></div>
              <h1 className="text-xl font-light tracking-wide text-black">
                {isEditing ? 'Edit Entry' : 'New Creation'}
              </h1>
            </div>
            <div className="w-11"></div>
          </div>
        </div>
      </div>
      
      <main className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Photo Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-light text-gray-600 uppercase tracking-wider">
              Visual Documentation
            </label>
            <div className="relative group">
              {formData.photo_url ? (
                <div className="relative">
                  <img
                    src={formData.photo_url}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center rounded-lg">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="photo-upload"
                    />
                    <span className="opacity-0 group-hover:opacity-100 text-white font-medium text-sm transition-all duration-200">
                      Change Photo
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center group cursor-pointer hover:border-gray-400 transition-colors relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="photo-upload-empty"
                    disabled={compressing}
                  />
                  {compressing ? (
                    <div className="text-center">
                      <div className="w-10 h-10 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-gray-500 text-sm">Compressing image...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="w-10 h-10 text-gray-400 mx-auto mb-3 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500 group-hover:text-gray-700 transition-colors">
                        Click to add photo
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Dish Name
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full text-lg font-medium text-black border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              placeholder="What did you eat?"
            />
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Rating
            </label>
            <StarRating
              value={formData.rating}
              onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {commonTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    formData.tags.includes(tag)
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <label className="block text-sm font-light text-gray-600 uppercase tracking-wider">
              Location
            </label>
            <LocationAutocomplete
              value={formData.location}
              onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
              placeholder="Where did you enjoy this?"
              className="w-full"
            />
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full text-gray-700 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
              placeholder="How was it? Any notes?"
            />
          </div>

          {/* Submit Buttons */}
          <div className="space-y-3 pt-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
            
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="w-full py-3 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors font-medium"
              >
                {loading ? 'Deleting...' : 'Delete Entry'}
              </button>
            )}
          </div>
        </form>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default AddEntry;
