import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useNavigate, useParams } from 'react-router-dom';
import supabase from '../utils/supabaseClient';
import BottomNavigation from '../components/BottomNavigation';

const ProfileHeader = ({ profile, isOwnProfile, isFollowing, onFollow, onUnfollow, onEditProfile, onAvatarClick, navigate }) => {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-6">
          {/* Profile Avatar */}
          <div className="relative">
            <div 
              className={`w-20 h-20 rounded-full overflow-hidden bg-gray-100 ${isOwnProfile ? 'cursor-pointer' : ''}`}
              onClick={isOwnProfile ? onAvatarClick : undefined}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-black text-white flex items-center justify-center text-2xl font-light">
                  {profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-light text-black mb-1">
              {profile?.display_name || 'User'}
            </h1>
            <p className="text-gray-500 text-sm mb-3">
              @{profile?.username || 'username'}
            </p>
            {isOwnProfile && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={onEditProfile}
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => navigate('/?tab=friends')}
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  Add Friends
                </button>
              </div>
            )}
          </div>
        </div>
        
        {profile?.bio && (
          <p className="text-gray-700 mt-6 text-sm leading-relaxed">
            {profile.bio}
          </p>
        )}
      </div>
    </div>
  );
};

const ProfileStats = ({ entries, friends }) => {

  return (
    <div className="bg-gray-50 border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-center space-x-12">
          <div className="text-center">
            <div className="text-xl font-light text-black">{entries?.length || 0}</div>
            <div className="text-gray-500 text-xs uppercase tracking-wide">Dishes</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-light text-black">{friends?.length || 0}</div>
            <div className="text-gray-500 text-xs uppercase tracking-wide">Friends</div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

const EditProfileModal = ({ profile, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    is_private: profile?.is_private || false
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        is_private: profile.is_private || false
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      // Don't close modal if there was an error
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium">Edit Profile</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => {
                  const username = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                  setFormData(prev => ({ ...prev, username }));
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="username (letters, numbers, underscore only)"
                minLength={3}
                maxLength={20}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                3-20 characters, letters, numbers and underscore only
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell people about yourself..."
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_private"
                checked={formData.is_private}
                onChange={(e) => setFormData(prev => ({ ...prev, is_private: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_private" className="text-sm text-gray-700">
                Private Account
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const { user, signOut } = useAuth();
  const { userProfile, updateUserProfile, friends, getSavedEntries } = useSocial();
  const navigate = useNavigate();
  const { userId } = useParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [userEntries, setUserEntries] = useState([]);
  const [savedEntries, setSavedEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fileInputRef = useRef(null);

  const isOwnProfile = !userId || userId === user?.id;
  const currentProfile = isOwnProfile ? userProfile : null;
  const currentUserId = isOwnProfile ? user?.id : userId;

  // Fetch saved entries when on saved tab
  useEffect(() => {
    const fetchSavedEntries = async () => {
      if (!isOwnProfile || activeTab !== 'saved' || !getSavedEntries) return;
      
      setLoading(true);
      try {
        const saved = await getSavedEntries();
        setSavedEntries(saved || []);
      } catch (error) {
        console.error('Error fetching saved entries:', error);
        setSavedEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedEntries();
  }, [activeTab, isOwnProfile, getSavedEntries]);

  // Fetch entries for the current user
  useEffect(() => {
    const fetchUserEntries = async () => {
      if (!currentUserId) return;
      
      setLoading(true);
      try {
        console.log('Fetching entries for user:', currentUserId);
        
        const { data, error } = await supabase
          .from('entries')
          .select('*')
          .eq('user_id', currentUserId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching user entries:', error);
          setUserEntries([]);
        } else {
          console.log('Fetched entries:', data?.length || 0, 'entries');
          if (data && data.length > 0) {
            console.log('Sample entry:', data[0]);
          }
          setUserEntries(data || []);
        }
      } catch (error) {
        console.error('Error fetching entries:', error);
        setUserEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserEntries();
    
    // Also refresh when window regains focus (user comes back to tab)
    const handleFocus = () => {
      console.log('Window focused, refreshing entries...');
      fetchUserEntries();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentUserId]);

  // Filter entries based on search query
  const filteredEntries = userEntries.filter(entry => {
    if (!searchQuery) return true;
    
    return (
      entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSaveProfile = async (profileData) => {
    try {
      await updateUserProfile(profileData);
      // Optionally show success message
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      // Show the specific error message from the database/validation
      const errorMessage = error.message || 'Failed to update profile. Please try again.';
      alert(errorMessage);
      throw error; // Re-throw so the modal knows there was an error
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      console.log('Starting avatar upload...', { 
        fileName: file.name, 
        fileSize: file.size, 
        fileType: file.type,
        userId: user.id 
      });

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      console.log('Uploading to path:', fileName);

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);

      // Update user profile with new avatar URL
      await updateUserProfile({ avatar_url: publicUrl });

      console.log('Avatar uploaded successfully');
      alert('Avatar updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      
      // More detailed error message
      let errorMessage = 'Failed to upload avatar. ';
      if (error.message?.includes('not found')) {
        errorMessage += 'Storage bucket not found. Please check Supabase setup.';
      } else if (error.message?.includes('policy')) {
        errorMessage += 'Permission denied. Please check storage policies.';
      } else if (error.message?.includes('size')) {
        errorMessage += 'File size too large.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      event.target.value = '';
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-light">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-light text-black">
                {isOwnProfile ? 'Profile' : 'Profile'}
              </h1>
            </div>
            
            {isOwnProfile && (
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <ProfileHeader
        profile={currentProfile}
        isOwnProfile={isOwnProfile}
        onEditProfile={() => setShowEditModal(true)}
        onAvatarClick={handleAvatarClick}
        navigate={navigate}
      />

      {/* Hidden file input for avatar upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      {/* Upload overlay */}
      {isUploadingAvatar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 mx-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900">Uploading avatar...</span>
            </div>
          </div>
        </div>
      )}

      {/* Profile Stats */}
      <ProfileStats entries={filteredEntries} friends={friends} />

      {/* Content Tabs */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-3 text-sm font-light border-b-2 transition-colors ${
                activeTab === 'posts'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              Posts
            </button>
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab('saved')}
                className={`py-3 text-sm font-light border-b-2 transition-colors ${
                  activeTab === 'saved'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                Saved
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {activeTab === 'posts' && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black transition-colors"
          />
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        {activeTab === 'posts' && (
          <>
            {loading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 text-sm">Loading dishes...</p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-16">
                {searchQuery ? (
                  <div>
                    <p className="text-gray-500 text-sm mb-2">No results found</p>
                    <p className="text-gray-400 text-xs">Try a different search term</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 text-sm mb-4">
                      {isOwnProfile ? 'No dishes yet' : 'No dishes shared'}
                    </p>
                    {isOwnProfile && (
                      <button
                        onClick={() => navigate('/add')}
                        className="px-6 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition-colors"
                      >
                        Add First Dish
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {filteredEntries.map((entry) => (
                  <button 
                    key={entry.id} 
                    className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity relative focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    onClick={() => {
                      console.log('Clicking entry:', entry.id);
                      navigate(`/add?edit=${entry.id}`);
                    }}
                  >
                    {entry.photo_url ? (
                      <img
                        src={entry.photo_url}
                        alt={entry.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('Image failed to load:', entry.photo_url);
                          // Hide the image and show fallback
                          e.target.parentElement.innerHTML = `
                            <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                              <div class="text-center p-2">
                                <svg class="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                </svg>
                                <p class="text-gray-500 text-xs leading-tight">${entry.title}</p>
                              </div>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <div className="text-center p-2">
                          <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                          </svg>
                          <p className="text-gray-500 text-xs leading-tight">{entry.title}</p>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'saved' && (
          <>
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
              </div>
            ) : savedEntries.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-sm mb-2">No saved dishes</p>
                <p className="text-gray-400 text-xs">Save dishes from friends to see them here</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {savedEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => {
                      // If it's the user's own post, allow editing
                      if (entry.user_id === user?.id) {
                        navigate(`/add?edit=${entry.id}`);
                      } else {
                        // Otherwise, navigate to view-only mode
                        navigate(`/add?view=${entry.id}`);
                      }
                    }}
                  >
                    {entry.photo_url ? (
                      <img
                        src={entry.photo_url}
                        alt={entry.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
                      <div className="text-white text-sm font-medium truncate">{entry.title}</div>
                      <div className="text-white/80 text-xs">
                        {entry.rating}/10
                        {entry.user && ` • @${entry.user.username}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        profile={userProfile}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProfile}
      />
      
      <BottomNavigation />
    </div>
  );
};

export default Profile;
