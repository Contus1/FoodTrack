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
  const [friendRequests, setFriendRequests] = useState([]); // Received requests
  const [sentRequests, setSentRequests] = useState([]); // Sent requests
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
      // For avatar-only updates, preserve existing profile data
      if (profileData.avatar_url && Object.keys(profileData).length === 1) {
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            avatar_url: profileData.avatar_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        setUserProfile(data);
        return data;
      }

      // For full profile updates, ensure username is provided
      if (!profileData.username || profileData.username.trim() === '') {
        throw new Error('Username is required');
      }

      // Clean username (remove spaces, special characters, make lowercase)
      const cleanUsername = profileData.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      
      if (cleanUsername.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      // Try direct upsert first
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...profileData,
          username: cleanUsername,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) {
        // If schema cache error, try insert instead
        if (error.message.includes('schema cache')) {
          const insertResult = await supabase
            .from('user_profiles')
            .insert({
              id: user.id,
              username: cleanUsername,
              display_name: profileData.display_name || cleanUsername,
              bio: profileData.bio || '',
              is_private: profileData.is_private || false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (insertResult.error) {
            // If insert fails because record exists, try update
            if (insertResult.error.code === '23505') {
              const updateResult = await supabase
                .from('user_profiles')
                .update({
                  username: cleanUsername,
                  display_name: profileData.display_name,
                  bio: profileData.bio,
                  is_private: profileData.is_private,
                  updated_at: new Date().toISOString()
                })
                .eq('id', user.id)
                .select()
                .single();

              if (updateResult.error) {
                throw updateResult.error;
              }
              
              setUserProfile(updateResult.data);
              return updateResult.data;
            } else {
              throw insertResult.error;
            }
          }

          setUserProfile(insertResult.data);
          return insertResult.data;
        }
        
        // Handle specific error cases
        if (error.code === '23505' && error.message.includes('username')) {
          throw new Error('This username is already taken. Please choose a different one.');
        }
        
        throw error;
      }

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

    console.log('Loading friends and requests for user:', user.id);
    try {
      // Get accepted friends
      const { data: friendsData, error: friendsError } = await supabase
        .from('friendships')
        .select('*')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (friendsError) {
        console.error('Friends loading error:', friendsError);
        throw friendsError;
      }

      console.log('Friends data loaded:', friendsData);

      // Get user profiles separately and match them
      const { data: allProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*');

      if (profilesError) {
        console.error('Profiles loading error:', profilesError);
        throw profilesError;
      }

      // Process friends data to get the other person's profile
      const processedFriends = friendsData?.map(friendship => {
        const isRequester = friendship.requester_id === user.id;
        const friendId = isRequester ? friendship.addressee_id : friendship.requester_id;
        const friendProfile = allProfiles?.find(profile => profile.id === friendId);
        
        return {
          ...friendship,
          friend: friendProfile
        };
      }) || [];

      setFriends(processedFriends);

      // Get pending friend requests (received)
      const { data: requestsData, error: requestsError } = await supabase
        .from('friendships')
        .select('*')
        .eq('addressee_id', user.id)
        .eq('status', 'pending');

      if (requestsError) {
        console.error('Friend requests loading error:', requestsError);
        throw requestsError;
      }

      // Get requester profiles separately
      const processedRequests = requestsData?.map(request => {
        const requesterProfile = allProfiles?.find(profile => profile.id === request.requester_id);
        return {
          ...request,
          requester: requesterProfile
        };
      }) || [];

      console.log('Friend requests data loaded:', processedRequests);
      setFriendRequests(processedRequests);

      // Get sent friend requests
      const { data: sentRequestsData, error: sentRequestsError } = await supabase
        .from('friendships')
        .select('*')
        .eq('requester_id', user.id)
        .eq('status', 'pending');

      if (sentRequestsError) {
        console.error('Sent requests loading error:', sentRequestsError);
        throw sentRequestsError;
      }

      // Get addressee profiles separately
      const processedSentRequests = sentRequestsData?.map(request => {
        const addresseeProfile = allProfiles?.find(profile => profile.id === request.addressee_id);
        return {
          ...request,
          addressee: addresseeProfile
        };
      }) || [];

      console.log('Sent requests data loaded:', processedSentRequests);
      setSentRequests(processedSentRequests);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  // Send friend request
  const sendFriendRequest = async (userId) => {
    if (!user) return;

    console.log('Sending friend request:', { from: user.id, to: userId });
    try {
      // First check if request already exists
      const { data: existingRequest, error: checkError } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`);

      if (checkError) {
        console.error('Error checking existing request:', checkError);
        throw checkError;
      }

      if (existingRequest && existingRequest.length > 0) {
        console.log('Friend request already exists:', existingRequest);
        throw new Error('Friend request already sent or you are already friends');
      }

      const { data, error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: userId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Friend request insert error:', error);
        if (error.code === '23505') {
          throw new Error('Friend request already sent');
        }
        throw error;
      }

      console.log('Friend request inserted:', data);

      // Create notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          from_user_id: user.id,
          type: 'friend_request'
        });

      if (notificationError) {
        console.error('Notification error:', notificationError);
      } else {
        console.log('Notification created successfully');
      }

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

      // Reload friends data
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

      // Reload friends data
      loadFriends();
    } catch (error) {
      console.error('Error declining friend request:', error);
      throw error;
    }
  };

  // Cancel/withdraw sent friend request
  const cancelFriendRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', requestId)
        .eq('requester_id', user.id);

      if (error) throw error;

      // Reload friends data to update sent requests
      loadFriends();
    } catch (error) {
      console.error('Error canceling friend request:', error);
      throw error;
    }
  };

  // Search users
  const searchUsers = async (query) => {
    console.log('Searching users with query:', query);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .neq('id', user?.id)
        .limit(20);

      if (error) {
        console.error('Search users error:', error);
        throw error;
      }
      
      console.log('Search results:', data);
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
      console.log('Adding comment:', { entryId, content, userId: user.id });
      
      const { data, error } = await supabase
        .from('entry_comments')
        .insert({
          user_id: user.id,
          entry_id: entryId,
          content
        })
        .select()
        .single();

      if (error) {
        console.error('Comment insert error:', error);
        throw error;
      }

      console.log('Comment inserted:', data);

      // Get user profile separately
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        // Continue even if profile fetch fails
      }

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

      // Combine comment with user profile
      const commentWithProfile = {
        ...data,
        user_profile: userProfile
      };

      console.log('Comment with profile:', commentWithProfile);
      return commentWithProfile;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  // Get social feed (entries from friends)
  const getSocialFeed = async (limit = 20, offset = 0) => {
    if (!user) return [];

    try {
      console.log('Loading social feed...');
      
      // Get entries without joins first
      const { data: entriesData, error: entriesError } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (entriesError) {
        console.error('Entries loading error:', entriesError);
        throw entriesError;
      }

      console.log('Entries loaded:', entriesData);

      if (!entriesData || entriesData.length === 0) {
        return [];
      }

      // Get user profiles for all entries
      const userIds = [...new Set(entriesData.map(entry => entry.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) {
        console.error('Profiles loading error:', profilesError);
        throw profilesError;
      }

      // Get likes for current user
      const entryIds = entriesData.map(entry => entry.id);
      const { data: likesData, error: likesError } = await supabase
        .from('entry_likes')
        .select('*')
        .in('entry_id', entryIds);

      if (likesError) {
        console.error('Likes loading error:', likesError);
      }

      // Get saves for current user
      const { data: savesData, error: savesError } = await supabase
        .from('entry_saves')
        .select('*')
        .in('entry_id', entryIds);

      if (savesError) {
        console.error('Saves loading error:', savesError);
      }

      // Get comments for entries
      const { data: commentsData, error: commentsError } = await supabase
        .from('entry_comments')
        .select('*')
        .in('entry_id', entryIds)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Comments loading error:', commentsError);
      }

      // Get comment user profiles
      const commentUserIds = [...new Set((commentsData || []).map(comment => comment.user_id))];
      const { data: commentProfilesData, error: commentProfilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .in('id', commentUserIds);

      if (commentProfilesError) {
        console.error('Comment profiles loading error:', commentProfilesError);
      }

      // Process and combine data
      const processedEntries = entriesData.map(entry => {
        const userProfile = profilesData?.find(profile => profile.id === entry.user_id);
        const entryLikes = likesData?.filter(like => like.entry_id === entry.id) || [];
        const entrySaves = savesData?.filter(save => save.entry_id === entry.id) || [];
        const entryComments = commentsData?.filter(comment => comment.entry_id === entry.id) || [];
        
        // Add user profiles to comments
        const processedComments = entryComments.map(comment => ({
          ...comment,
          user_profile: commentProfilesData?.find(profile => profile.id === comment.user_id)
        }));

        return {
          ...entry,
          user_profile: userProfile,
          likes: entryLikes,
          saves: entrySaves,
          comments: processedComments,
          isLiked: entryLikes.some(like => like.user_id === user.id),
          isSaved: entrySaves.some(save => save.user_id === user.id),
          likesCount: entryLikes.length
        };
      });

      console.log('Processed entries:', processedEntries);
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
        setSentRequests([]);
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
    sentRequests,
    notifications,
    loading,
    updateUserProfile,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest,
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