import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import supabase from '../utils/supabaseClient';

const SocialContext = createContext();

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};

export const SocialProvider = ({ children }) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user profile
  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Create or update user profile
  const updateUserProfile = async (profileData) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setUserProfile(data);
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Load friends and friend requests
  const loadFriends = async () => {
    if (!user) return;

    try {
      // Get accepted friends
      const { data: friendsData, error: friendsError } = await supabase
        .from('friendships')
        .select(`
          *,
          requester:user_profiles!friendships_requester_id_fkey(*),
          addressee:user_profiles!friendships_addressee_id_fkey(*)
        `)
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (friendsError) throw friendsError;

      // Process friends data to get the other person's profile
      const processedFriends = friendsData?.map(friendship => {
        const isRequester = friendship.requester_id === user.id;
        return {
          ...friendship,
          friend: isRequester ? friendship.addressee : friendship.requester
        };
      }) || [];

      setFriends(processedFriends);

      // Get pending friend requests (received)
      const { data: requestsData, error: requestsError } = await supabase
        .from('friendships')
        .select(`
          *,
          requester:user_profiles!friendships_requester_id_fkey(*)
        `)
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      if (requestsError) throw requestsError;

      setFriendRequests(requestsData || []);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  // Send friend request
  const sendFriendRequest = async (userId) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: userId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          from_user_id: user.id,
          type: 'friend_request'
        });

      return data;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (requestId) => {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;

      // Create notification for the requester
      await supabase
        .from('notifications')
        .insert({
          user_id: data.requester_id,
          from_user_id: user.id,
          type: 'friend_accepted'
        });

      loadFriends();
      return data;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  };

  // Decline friend request
  const declineFriendRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      loadFriends();
    } catch (error) {
      console.error('Error declining friend request:', error);
      throw error;
    }
  };

  // Search users
  const searchUsers = async (query) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .neq('id', user?.id)
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  // Like an entry
  const likeEntry = async (entryId) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('entry_likes')
        .insert({
          user_id: user.id,
          entry_id: entryId
        })
        .select()
        .single();

      if (error) throw error;

      // Get entry owner to create notification
      const { data: entryData } = await supabase
        .from('entries')
        .select('user_id')
        .eq('id', entryId)
        .single();

      if (entryData && entryData.user_id !== user.id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: entryData.user_id,
            from_user_id: user.id,
            entry_id: entryId,
            type: 'like'
          });
      }

      return data;
    } catch (error) {
      console.error('Error liking entry:', error);
      throw error;
    }
  };

  // Unlike an entry
  const unlikeEntry = async (entryId) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('entry_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('entry_id', entryId);

      if (error) throw error;
    } catch (error) {
      console.error('Error unliking entry:', error);
      throw error;
    }
  };

  // Save an entry
  const saveEntry = async (entryId) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('entry_saves')
        .insert({
          user_id: user.id,
          entry_id: entryId
        })
        .select()
        .single();

      if (error) throw error;

      // Get entry owner to create notification
      const { data: entryData } = await supabase
        .from('entries')
        .select('user_id')
        .eq('id', entryId)
        .single();

      if (entryData && entryData.user_id !== user.id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: entryData.user_id,
            from_user_id: user.id,
            entry_id: entryId,
            type: 'entry_save'
          });
      }

      return data;
    } catch (error) {
      console.error('Error saving entry:', error);
      throw error;
    }
  };

  // Unsave an entry
  const unsaveEntry = async (entryId) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('entry_saves')
        .delete()
        .eq('user_id', user.id)
        .eq('entry_id', entryId);

      if (error) throw error;
    } catch (error) {
      console.error('Error unsaving entry:', error);
      throw error;
    }
  };

  // Add comment to entry
  const addComment = async (entryId, content) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('entry_comments')
        .insert({
          user_id: user.id,
          entry_id: entryId,
          content
        })
        .select(`
          *,
          user_profile:user_profiles(*)
        `)
        .single();

      if (error) throw error;

      // Get entry owner to create notification
      const { data: entryData } = await supabase
        .from('entries')
        .select('user_id')
        .eq('id', entryId)
        .single();

      if (entryData && entryData.user_id !== user.id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: entryData.user_id,
            from_user_id: user.id,
            entry_id: entryId,
            comment_id: data.id,
            type: 'comment'
          });
      }

      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  // Get social feed (entries from friends)
  const getSocialFeed = async (limit = 20, offset = 0) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('entries')
        .select(`
          *,
          user_profile:user_profiles(*),
          likes:entry_likes(user_id),
          saves:entry_saves(user_id),
          comments:entry_comments(
            *,
            user_profile:user_profiles(*)
          ),
          _count:entry_likes(count)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Add interaction flags for current user
      const processedEntries = data?.map(entry => ({
        ...entry,
        isLiked: entry.likes?.some(like => like.user_id === user.id) || false,
        isSaved: entry.saves?.some(save => save.user_id === user.id) || false,
        likesCount: entry._count?.[0]?.count || 0
      })) || [];

      return processedEntries;
    } catch (error) {
      console.error('Error getting social feed:', error);
      return [];
    }
  };

  // Load user data when user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setLoading(true);
        await Promise.all([
          loadUserProfile(),
          loadFriends()
        ]);
        setLoading(false);
      } else {
        setUserProfile(null);
        setFriends([]);
        setFriendRequests([]);
        setNotifications([]);
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const value = {
    userProfile,
    friends,
    friendRequests,
    notifications,
    loading,
    updateUserProfile,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    searchUsers,
    likeEntry,
    unlikeEntry,
    saveEntry,
    unsaveEntry,
    addComment,
    getSocialFeed,
    loadFriends
  };

  return (
    <SocialContext.Provider value={value}>
      {children}
    </SocialContext.Provider>
  );
};