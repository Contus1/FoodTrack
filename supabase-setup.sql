-- ============================================
-- FOODTRACK - COMPLETE SUPABASE SETUP
-- ============================================
-- This file reflects the EXACT current database structure
-- Generated: November 2, 2025
-- Based on actual database schema export
-- 
-- Run this entire file to recreate the database from scratch
-- ============================================

-- ============================================
-- SECTION 1: USER PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_pkey ON public.user_profiles(id);
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_username_key ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS user_profiles_username_idx ON public.user_profiles(username);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.user_profiles FOR SELECT
  USING ((NOT is_private) OR (auth.uid() = id));

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- SECTION 2: DISHES (GLOBAL CATALOG)
-- ============================================

CREATE TABLE IF NOT EXISTS public.dishes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL UNIQUE,
  description TEXT,
  cuisine_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS dishes_pkey ON public.dishes(id);
CREATE UNIQUE INDEX IF NOT EXISTS unique_normalized_name ON public.dishes(normalized_name);
CREATE INDEX IF NOT EXISTS idx_dishes_normalized_name ON public.dishes(normalized_name);

-- Enable RLS
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Dishes are viewable by everyone" ON public.dishes;
DROP POLICY IF EXISTS "Authenticated users can create dishes" ON public.dishes;

CREATE POLICY "Dishes are viewable by everyone"
  ON public.dishes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create dishes"
  ON public.dishes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- SECTION 3: ENTRIES (FOOD DIARY)
-- ============================================

CREATE TABLE IF NOT EXISTS public.entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dish_id UUID REFERENCES public.dishes(id),
  title TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  photo_url TEXT[],
  location TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  tagged_friends UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS entries_pkey ON public.entries(id);
CREATE INDEX IF NOT EXISTS entries_user_id_created_at_idx ON public.entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_entries_dish_id ON public.entries(dish_id);
CREATE INDEX IF NOT EXISTS idx_entries_tagged_friends ON public.entries USING gin(tagged_friends);

-- Enable RLS
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view entries" ON public.entries;
DROP POLICY IF EXISTS "Users can insert their own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can update their own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can delete their own entries" ON public.entries;

CREATE POLICY "Users can view entries"
  ON public.entries FOR SELECT
  USING ((auth.uid() = user_id) OR ((auth.uid() IS NOT NULL) AND ((is_private = false) OR (is_private IS NULL))));

CREATE POLICY "Users can insert their own entries"
  ON public.entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
  ON public.entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
  ON public.entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SECTION 4: DISH RATINGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.dish_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dish_id UUID NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  entry_id UUID REFERENCES public.entries(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, entry_id)
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS dish_ratings_pkey ON public.dish_ratings(id);
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_entry_rating ON public.dish_ratings(user_id, entry_id);
CREATE INDEX IF NOT EXISTS idx_dish_ratings_dish_id ON public.dish_ratings(dish_id);
CREATE INDEX IF NOT EXISTS idx_dish_ratings_user_id ON public.dish_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_dish_ratings_entry_id ON public.dish_ratings(entry_id);

-- Enable RLS
ALTER TABLE public.dish_ratings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Dish ratings are viewable by everyone" ON public.dish_ratings;
DROP POLICY IF EXISTS "Users can create own dish ratings" ON public.dish_ratings;
DROP POLICY IF EXISTS "Users can update own dish ratings" ON public.dish_ratings;
DROP POLICY IF EXISTS "Users can delete own dish ratings" ON public.dish_ratings;

CREATE POLICY "Dish ratings are viewable by everyone"
  ON public.dish_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create own dish ratings"
  ON public.dish_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dish ratings"
  ON public.dish_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dish ratings"
  ON public.dish_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SECTION 5: FRIENDSHIPS
-- ============================================

CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id, addressee_id)
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS friendships_pkey ON public.friendships(id);
CREATE UNIQUE INDEX IF NOT EXISTS friendships_requester_id_addressee_id_key ON public.friendships(requester_id, addressee_id);
CREATE INDEX IF NOT EXISTS friendships_requester_addressee_idx ON public.friendships(requester_id, addressee_id);
CREATE INDEX IF NOT EXISTS friendships_status_idx ON public.friendships(status);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can insert friend requests" ON public.friendships;
DROP POLICY IF EXISTS "Users can update friendships they're part of" ON public.friendships;
DROP POLICY IF EXISTS "Users can delete friendships they're part of" ON public.friendships;

CREATE POLICY "Users can view their own friendships"
  ON public.friendships FOR SELECT
  USING ((auth.uid() = requester_id) OR (auth.uid() = addressee_id));

CREATE POLICY "Users can insert friend requests"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friendships they're part of"
  ON public.friendships FOR UPDATE
  USING ((auth.uid() = requester_id) OR (auth.uid() = addressee_id));

CREATE POLICY "Users can delete friendships they're part of"
  ON public.friendships FOR DELETE
  USING ((auth.uid() = requester_id) OR (auth.uid() = addressee_id));

-- ============================================
-- SECTION 6: ENTRY LIKES
-- ============================================

CREATE TABLE IF NOT EXISTS public.entry_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES public.entries(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, entry_id)
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS entry_likes_pkey ON public.entry_likes(id);
CREATE UNIQUE INDEX IF NOT EXISTS entry_likes_user_id_entry_id_key ON public.entry_likes(user_id, entry_id);
CREATE INDEX IF NOT EXISTS entry_likes_user_id_idx ON public.entry_likes(user_id);
CREATE INDEX IF NOT EXISTS entry_likes_entry_id_idx ON public.entry_likes(entry_id);

-- Enable RLS
ALTER TABLE public.entry_likes ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view likes on public entries" ON public.entry_likes;
DROP POLICY IF EXISTS "Users can insert their own likes" ON public.entry_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.entry_likes;

CREATE POLICY "Anyone can view likes on public entries"
  ON public.entry_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own likes"
  ON public.entry_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON public.entry_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SECTION 7: ENTRY SAVES
-- ============================================

CREATE TABLE IF NOT EXISTS public.entry_saves (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES public.entries(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, entry_id)
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS entry_saves_pkey ON public.entry_saves(id);
CREATE UNIQUE INDEX IF NOT EXISTS entry_saves_user_id_entry_id_key ON public.entry_saves(user_id, entry_id);
CREATE INDEX IF NOT EXISTS entry_saves_user_id_idx ON public.entry_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_entry_saves_entry_id ON public.entry_saves(entry_id);

-- Enable RLS
ALTER TABLE public.entry_saves ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own saves" ON public.entry_saves;
DROP POLICY IF EXISTS "Users can insert their own saves" ON public.entry_saves;
DROP POLICY IF EXISTS "Users can delete their own saves" ON public.entry_saves;

CREATE POLICY "Users can view their own saves"
  ON public.entry_saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saves"
  ON public.entry_saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saves"
  ON public.entry_saves FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SECTION 8: ENTRY COMMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.entry_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES public.entries(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS entry_comments_pkey ON public.entry_comments(id);
CREATE INDEX IF NOT EXISTS entry_comments_entry_id_idx ON public.entry_comments(entry_id);

-- Enable RLS
ALTER TABLE public.entry_comments ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view comments on public entries" ON public.entry_comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON public.entry_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.entry_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.entry_comments;

CREATE POLICY "Anyone can view comments on public entries"
  ON public.entry_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own comments"
  ON public.entry_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.entry_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.entry_comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SECTION 9: NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_post', 'friend_request', 'friend_request_accepted', 'stat_update', 'achievement', 'comment', 'like', 'save')),
  entry_id UUID REFERENCES public.entries(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.entry_comments(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read BOOLEAN DEFAULT FALSE,
  data JSONB DEFAULT '{}',
  title TEXT DEFAULT 'Notification',
  message TEXT DEFAULT '',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS notifications_pkey ON public.notifications(id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read) WHERE (read = false);
CREATE INDEX IF NOT EXISTS notifications_user_id_unread_idx ON public.notifications(user_id, is_read);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications for others" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notifications for others"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SECTION 10: PUSH SUBSCRIPTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS push_subscriptions_pkey ON public.push_subscriptions(id);
CREATE UNIQUE INDEX IF NOT EXISTS push_subscriptions_endpoint_key ON public.push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can insert own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can update own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Users can view own push subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push subscriptions"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push subscriptions"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SECTION 11: DISH STATS VIEW
-- ============================================

-- Drop existing view first
DROP VIEW IF EXISTS public.dish_stats CASCADE;

CREATE OR REPLACE VIEW public.dish_stats AS
SELECT 
  d.id AS dish_id,
  d.name AS dish_name,
  d.normalized_name,
  d.cuisine_type,
  COUNT(DISTINCT dr.user_id) AS total_ratings,
  (AVG(dr.rating))::numeric(3,1) AS avg_rating,
  MIN(dr.rating) AS min_rating,
  MAX(dr.rating) AS max_rating,
  COUNT(DISTINCT e.id) AS total_entries
FROM public.dishes d
LEFT JOIN public.dish_ratings dr ON d.id = dr.dish_id
LEFT JOIN public.entries e ON d.id = e.dish_id
GROUP BY d.id, d.name, d.normalized_name, d.cuisine_type;

-- Grant access
GRANT SELECT ON public.dish_stats TO authenticated;
GRANT SELECT ON public.dish_stats TO anon;

COMMENT ON VIEW public.dish_stats IS 'Aggregated statistics for each dish across all users';

-- ============================================
-- SECTION 12: FUNCTIONS
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function: Handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Function: Get or create dish
CREATE OR REPLACE FUNCTION public.get_or_create_dish(p_name TEXT, p_cuisine_type TEXT DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_normalized_name TEXT;
  v_dish_id UUID;
BEGIN
  v_normalized_name := LOWER(TRIM(p_name));
  
  SELECT id INTO v_dish_id
  FROM public.dishes
  WHERE normalized_name = v_normalized_name;
  
  IF v_dish_id IS NULL THEN
    INSERT INTO public.dishes (name, normalized_name, cuisine_type)
    VALUES (p_name, v_normalized_name, p_cuisine_type)
    RETURNING id INTO v_dish_id;
  END IF;
  
  RETURN v_dish_id;
END;
$$;

-- Function: Create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Function: Sync dish rating when entry is created/updated
CREATE OR REPLACE FUNCTION public.sync_dish_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.dish_id IS NOT NULL AND NEW.rating IS NOT NULL THEN
    INSERT INTO public.dish_ratings (dish_id, user_id, entry_id, rating)
    VALUES (NEW.dish_id, NEW.user_id, NEW.id, NEW.rating)
    ON CONFLICT (user_id, entry_id) 
    DO UPDATE SET 
      rating = EXCLUDED.rating,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function: Notify friends on new post
CREATE OR REPLACE FUNCTION public.notify_friends_on_new_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_friend_id UUID;
  v_poster_username TEXT;
  v_entry_title TEXT;
BEGIN
  -- Only notify for public entries
  IF NEW.is_private IS TRUE THEN
    RETURN NEW;
  END IF;

  SELECT username INTO v_poster_username
  FROM public.user_profiles
  WHERE id = NEW.user_id;

  IF v_poster_username IS NULL THEN
    RETURN NEW;
  END IF;

  v_entry_title := COALESCE(NEW.title, 'a new entry');

  FOR v_friend_id IN
    SELECT CASE 
      WHEN requester_id = NEW.user_id THEN addressee_id
      ELSE requester_id
    END as friend
    FROM public.friendships
    WHERE (requester_id = NEW.user_id OR addressee_id = NEW.user_id)
      AND status = 'accepted'
  LOOP
    PERFORM public.create_notification(
      v_friend_id,
      'new_post',
      v_poster_username || ' posted a new meal! 🍽️',
      v_poster_username || ' just posted: ' || v_entry_title,
      jsonb_build_object(
        'postId', NEW.id,
        'userId', NEW.user_id,
        'entryTitle', v_entry_title
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Function: Notify on friend request
CREATE OR REPLACE FUNCTION public.notify_on_friend_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_requester_username TEXT;
BEGIN
  IF NEW.status = 'pending' THEN
    SELECT username INTO v_requester_username
    FROM public.user_profiles
    WHERE id = NEW.requester_id;

    PERFORM public.create_notification(
      NEW.addressee_id,
      'friend_request',
      'New friend request! 👋',
      v_requester_username || ' wants to be your friend',
      jsonb_build_object(
        'requestId', NEW.id,
        'userId', NEW.requester_id,
        'username', v_requester_username
      )
    );
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    SELECT username INTO v_requester_username
    FROM public.user_profiles
    WHERE id = NEW.addressee_id;

    PERFORM public.create_notification(
      NEW.requester_id,
      'friend_request_accepted',
      'Friend request accepted! 🎉',
      v_requester_username || ' accepted your friend request',
      jsonb_build_object(
        'userId', NEW.addressee_id,
        'username', v_requester_username
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Function: Get user profile
CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid UUID)
RETURNS TABLE(
  id UUID, 
  username TEXT, 
  display_name TEXT, 
  bio TEXT, 
  avatar_url TEXT, 
  is_private BOOLEAN, 
  created_at TIMESTAMP WITHOUT TIME ZONE, 
  updated_at TIMESTAMP WITHOUT TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT up.id, up.username, up.display_name, up.bio, up.avatar_url, up.is_private, up.created_at, up.updated_at
  FROM public.user_profiles up
  WHERE up.id = user_uuid;
END;
$$;

-- ============================================
-- SECTION 13: TRIGGERS
-- ============================================

-- Trigger: Update updated_at on user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Update updated_at on friendships
DROP TRIGGER IF EXISTS update_friendships_updated_at ON public.friendships;
CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: Sync dish rating on entry insert/update
DROP TRIGGER IF EXISTS trigger_sync_dish_rating ON public.entries;
CREATE TRIGGER trigger_sync_dish_rating
  AFTER INSERT OR UPDATE ON public.entries
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_dish_rating();

-- Trigger: Notify friends on new post
DROP TRIGGER IF EXISTS trigger_notify_friends_on_new_post ON public.entries;
CREATE TRIGGER trigger_notify_friends_on_new_post
  AFTER INSERT ON public.entries
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_friends_on_new_post();

-- Trigger: Notify on friend request
DROP TRIGGER IF EXISTS trigger_notify_on_friend_request ON public.friendships;
CREATE TRIGGER trigger_notify_on_friend_request
  AFTER INSERT OR UPDATE ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_friend_request();

-- ============================================
-- SETUP COMPLETE!
-- ============================================

SELECT 
  'FoodTrack database setup complete! ✅' as status,
  (SELECT COUNT(*) FROM public.user_profiles) as users,
  (SELECT COUNT(*) FROM public.entries) as entries,
  (SELECT COUNT(*) FROM public.dishes) as dishes,
  (SELECT COUNT(*) FROM public.friendships WHERE status = 'accepted') as friendships;
