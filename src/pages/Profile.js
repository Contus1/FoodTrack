import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { useEntries } from '../context/EntriesContext';
import { useNavigate, useParams } from 'react-router-dom';
import EntryCard from '../components/EntryCard';
import BottomNavigation from '../components/BottomNavigation';

const ProfileHeader = ({ profile, isOwnProfile, isFollowing, onFollow, onUnfollow, onEditProfile }) => {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center space-x-6">
          {/* Profile Avatar */}
          <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            {profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          
          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-2xl font-light text-black">
                {profile?.display_name || 'Unknown User'}
              </h1>
              {isOwnProfile ? (
                <button
                  onClick={onEditProfile}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={isFollowing ? onUnfollow : onFollow}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isFollowing
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
            
            <p className="text-gray-500 text-sm mb-2">@{profile?.username}</p>
            
            {profile?.bio && (
              <p className="text-gray-700 text-sm mb-4">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileStats = ({ entries, friends }) => {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex space-x-8 text-center">
          <div>
            <div className="text-lg font-medium text-black">{entries?.length || 0}</div>
            <div className="text-sm text-gray-500">Dishes</div>
          </div>
          <div>
            <div className="text-lg font-medium text-black">{friends?.length || 0}</div>
            <div className="text-sm text-gray-500">Friends</div>
          </div>
          <div>
            <div className="text-lg font-medium text-black">
              {entries?.reduce((sum, entry) => sum + (entry.rating || 0), 0) / Math.max(entries?.length || 1, 1) || 0}
            </div>
            <div className="text-sm text-gray-500">Avg Rating</div>
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
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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
  const { userProfile, updateUserProfile, friends } = useSocial();
  const { entries } = useEntries();
  const navigate = useNavigate();
  const { userId } = useParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const isOwnProfile = !userId || userId === user?.id;
  const currentProfile = isOwnProfile ? userProfile : null; // TODO: Load other user's profile

  // Filter entries based on search
  const filteredEntries = entries.filter(entry => 
    entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
    await updateUserProfile(profileData);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black rounded-full hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-light tracking-wide text-black">
                {isOwnProfile ? 'My Profile' : 'Profile'}
              </h1>
            </div>
            
            {isOwnProfile && (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
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
      />

      {/* Profile Stats */}
      <ProfileStats entries={filteredEntries} friends={friends} />

      {/* Content Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'posts'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Posts
            </button>
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab('saved')}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'saved'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Saved
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search and View Controls */}
      {activeTab === 'posts' && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search dishes, locations, notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-gray-50 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
                </svg>
              </div>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-50 rounded-full transition-all"
              >
                {viewMode === 'grid' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {activeTab === 'posts' && (
          <>
            {filteredEntries.length === 0 ? (
              <div className="text-center py-20">
                {searchQuery ? (
                  <div>
                    <div className="w-16 h-16 mx-auto mb-6 border border-gray-200 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-light text-black mb-2">
                      No results found
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Try a different search term
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="w-20 h-20 mx-auto mb-8 border border-gray-200 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-light text-black mb-4">
                      {isOwnProfile ? 'No dishes yet' : 'No public dishes'}
                    </h2>
                    <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed mb-8">
                      {isOwnProfile 
                        ? 'Start documenting your culinary adventures'
                        : 'This user hasn\'t shared any dishes yet'
                      }
                    </p>
                    {isOwnProfile && (
                      <button
                        onClick={() => navigate('/add')}
                        className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 text-sm font-light tracking-wide"
                      >
                        Add First Dish
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
                "space-y-6"
              }>
                {filteredEntries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} viewMode={viewMode} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'saved' && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 border border-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h2 className="text-lg font-light text-black mb-2">
              No saved dishes
            </h2>
            <p className="text-gray-500 text-sm">
              Save dishes from friends to see them here
            </p>
          </div>
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
