-- Food Diary Database Setup
-- Run this in your Supabase SQL Editor

-- Add location column to existing entries table (if it doesn't exist)
ALTER TABLE public.entries 
ADD COLUMN IF NOT EXISTS location TEXT;

-- Create entries table for food entries (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  photo_url TEXT,
  location TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add updated_at column to existing entries table (if it doesn't exist)
ALTER TABLE public.entries 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create storage bucket for food images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('food-images', 'food-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Users can view their own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can insert their own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can update their own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can delete their own entries" ON public.entries;

-- RLS Policies for entries table
CREATE POLICY "Users can view their own entries" ON public.entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entries" ON public.entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" ON public.entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries" ON public.entries
  FOR DELETE USING (auth.uid() = user_id);

-- Drop existing storage policies if they exist, then recreate them
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
DROP POLICY IF EXISTS "Public images can be viewed" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public avatars can be viewed" ON storage.objects;

-- Storage policies for food images
CREATE POLICY "Users can upload their own images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'food-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'food-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public images can be viewed" ON storage.objects
  FOR SELECT USING (bucket_id = 'food-images');

-- Storage policies for avatars
CREATE POLICY "Users can upload their own avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own avatars" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public avatars can be viewed" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Optional: Create an index for better performance
CREATE INDEX IF NOT EXISTS entries_user_id_created_at_idx 
ON public.entries(user_id, created_at DESC);

-- ====================================
-- SOCIAL FEATURES SCHEMA
-- ====================================

-- Create user profiles table for extended user information
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create friendships table for managing friend relationships
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id, addressee_id)
);

-- Create likes table for entry interactions
CREATE TABLE IF NOT EXISTS public.entry_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES public.entries(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, entry_id)
);

-- Create saves table for saving entries
CREATE TABLE IF NOT EXISTS public.entry_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES public.entries(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, entry_id)
);

-- Create comments table for entry comments
CREATE TABLE IF NOT EXISTS public.entry_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES public.entries(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table for social interactions
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('like', 'comment', 'friend_request', 'friend_accepted', 'entry_save')) NOT NULL,
  entry_id UUID REFERENCES public.entries(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.entry_comments(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on all social tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entry_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ====================================
-- RLS POLICIES FOR SOCIAL FEATURES
-- ====================================

-- User Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.user_profiles
  FOR SELECT USING (NOT is_private OR auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Friendships Policies
CREATE POLICY "Users can view their own friendships" ON public.friendships
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can insert friend requests" ON public.friendships
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friendships they're part of" ON public.friendships
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can delete friendships they're part of" ON public.friendships
  FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Entry Likes Policies
CREATE POLICY "Anyone can view likes on public entries" ON public.entry_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON public.entry_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.entry_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Entry Saves Policies
CREATE POLICY "Users can view their own saves" ON public.entry_saves
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saves" ON public.entry_saves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saves" ON public.entry_saves
  FOR DELETE USING (auth.uid() = user_id);

-- Entry Comments Policies
CREATE POLICY "Anyone can view comments on public entries" ON public.entry_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comments" ON public.entry_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.entry_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.entry_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notifications for others" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- ====================================
-- UPDATE ENTRIES TABLE FOR SOCIAL FEATURES
-- ====================================

-- Add privacy settings to entries
ALTER TABLE public.entries 
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

-- Update entries RLS policies to include friends
DROP POLICY IF EXISTS "Users can view their own entries" ON public.entries;

-- New policy: Users can view their own entries and public entries from friends
CREATE POLICY "Users can view accessible entries" ON public.entries
  FOR SELECT USING (
    auth.uid() = user_id OR  -- Own entries
    (NOT is_private AND (   -- Public entries from friends or everyone
      auth.uid() IN (
        SELECT CASE 
          WHEN requester_id = entries.user_id THEN addressee_id
          WHEN addressee_id = entries.user_id THEN requester_id
        END
        FROM public.friendships 
        WHERE status = 'accepted' 
        AND (requester_id = auth.uid() OR addressee_id = auth.uid())
        AND (requester_id = entries.user_id OR addressee_id = entries.user_id)
      ) OR auth.uid() IS NOT NULL  -- For discovery feed
    ))
  );

-- ====================================
-- FUNCTIONS AND TRIGGERS
-- ====================================

-- Function to get user profile (bypasses cache issues)
CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid UUID)
RETURNS TABLE(
  id UUID,
  username TEXT,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_private BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT up.id, up.username, up.display_name, up.bio, up.avatar_url, up.is_private, up.created_at, up.updated_at
  FROM public.user_profiles up
  WHERE up.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, display_name, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_friendships_updated_at ON public.friendships;
CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_entries_updated_at ON public.entries;
CREATE TRIGGER update_entries_updated_at
  BEFORE UPDATE ON public.entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================
-- CREATE INDEXES FOR PERFORMANCE
-- ====================================

CREATE INDEX IF NOT EXISTS user_profiles_username_idx ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS friendships_requester_addressee_idx ON public.friendships(requester_id, addressee_id);
CREATE INDEX IF NOT EXISTS friendships_status_idx ON public.friendships(status);
CREATE INDEX IF NOT EXISTS entry_likes_entry_id_idx ON public.entry_likes(entry_id);
CREATE INDEX IF NOT EXISTS entry_likes_user_id_idx ON public.entry_likes(user_id);
CREATE INDEX IF NOT EXISTS entry_saves_user_id_idx ON public.entry_saves(user_id);
CREATE INDEX IF NOT EXISTS entry_comments_entry_id_idx ON public.entry_comments(entry_id);
CREATE INDEX IF NOT EXISTS notifications_user_id_unread_idx ON public.notifications(user_id, is_read);

-- Success message
SELECT 'Social Media Database setup completed successfully!' as message;
