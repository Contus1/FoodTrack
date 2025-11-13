-- ============================================
-- FOODTRACK - COMPLETE SUPABASE SETUP
-- ============================================
-- This is the complete, up-to-date setup for FoodTrack
-- Run this entire file in Supabase SQL Editor to set up all features
-- 
-- Features included:
-- 1. User Profiles
-- 2. Food Entries
-- 3. Friendships & Social Features
-- 4. Community Dish Ratings
-- 5. Notifications System
-- 6. Push Notifications
-- ============================================

-- ============================================
-- SECTION 1: USER PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.user_profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

COMMENT ON TABLE public.user_profiles IS 'Extended user profile information';

-- ============================================
-- SECTION 2: DISHES (COMMUNITY CATALOG)
-- ============================================

CREATE TABLE IF NOT EXISTS public.dishes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL UNIQUE,
  cuisine_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dishes_normalized_name ON public.dishes(normalized_name);
CREATE INDEX IF NOT EXISTS idx_dishes_cuisine_type ON public.dishes(cuisine_type);

-- Enable RLS
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view dishes" ON public.dishes;
DROP POLICY IF EXISTS "Authenticated users can create dishes" ON public.dishes;

CREATE POLICY "Anyone can view dishes"
  ON public.dishes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create dishes"
  ON public.dishes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

COMMENT ON TABLE public.dishes IS 'Global dish catalog for community ratings';

-- ============================================
-- SECTION 3: FOOD ENTRIES
-- ============================================

CREATE TABLE IF NOT EXISTS public.entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dish_id UUID REFERENCES public.dishes(id),
  title TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  notes TEXT,
  photo_url TEXT[],
  location TEXT,
  tags TEXT[],
  is_private BOOLEAN DEFAULT FALSE,
  tagged_friends UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON public.entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_dish_id ON public.entries(dish_id);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON public.entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_entries_is_private ON public.entries(is_private);
CREATE INDEX IF NOT EXISTS idx_entries_location ON public.entries(location);
CREATE INDEX IF NOT EXISTS idx_entries_tags ON public.entries USING GIN(tags);

-- Enable RLS
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can view public entries" ON public.entries;
DROP POLICY IF EXISTS "Users can view friends' entries" ON public.entries;
DROP POLICY IF EXISTS "Users can insert own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can update own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can delete own entries" ON public.entries;

CREATE POLICY "Users can view own entries"
  ON public.entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public entries"
  ON public.entries FOR SELECT
  USING (NOT is_private);

CREATE POLICY "Users can view friends' entries"
  ON public.entries FOR SELECT
  USING (
    is_private AND EXISTS (
      SELECT 1 FROM public.friendships
      WHERE status = 'accepted'
        AND ((requester_id = auth.uid() AND addressee_id = user_id)
          OR (addressee_id = auth.uid() AND requester_id = user_id))
    )
  );

CREATE POLICY "Users can insert own entries"
  ON public.entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON public.entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON public.entries FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.entries IS 'User food diary entries';

-- ============================================
-- SECTION 4: FRIENDSHIPS
-- ============================================

CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON public.friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can create friendship requests" ON public.friendships;
DROP POLICY IF EXISTS "Users can update received requests" ON public.friendships;
DROP POLICY IF EXISTS "Users can delete own friendships" ON public.friendships;

CREATE POLICY "Users can view own friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() IN (requester_id, addressee_id));

CREATE POLICY "Users can create friendship requests"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update received requests"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = addressee_id);

CREATE POLICY "Users can delete own friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid() IN (requester_id, addressee_id));

COMMENT ON TABLE public.friendships IS 'User friendship connections';

-- ============================================
-- SECTION 5: DISH STATISTICS (MATERIALIZED VIEW)
-- ============================================

-- Drop any existing view first
DROP VIEW IF EXISTS public.dish_stats CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.dish_stats CASCADE;

CREATE MATERIALIZED VIEW public.dish_stats AS
SELECT 
  d.id as dish_id,
  d.name as dish_name,
  d.normalized_name,
  d.cuisine_type,
  COUNT(e.id) as total_ratings,
  ROUND(AVG(e.rating)::numeric, 2) as avg_rating,
  MAX(e.created_at) as last_rated_at
FROM public.dishes d
LEFT JOIN public.entries e ON e.dish_id = d.id
GROUP BY d.id, d.name, d.normalized_name, d.cuisine_type;

-- Indexes
CREATE UNIQUE INDEX idx_dish_stats_dish_id ON public.dish_stats(dish_id);
CREATE INDEX idx_dish_stats_total_ratings ON public.dish_stats(total_ratings DESC);
CREATE INDEX idx_dish_stats_avg_rating ON public.dish_stats(avg_rating DESC);

-- Grant access
GRANT SELECT ON public.dish_stats TO authenticated;
GRANT SELECT ON public.dish_stats TO anon;

COMMENT ON MATERIALIZED VIEW public.dish_stats IS 'Aggregated statistics for each dish across all users';

-- ============================================
-- SECTION 6: NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read) WHERE read = false;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE public.notifications IS 'In-app notifications for users';

-- ============================================
-- SECTION 7: PUSH SUBSCRIPTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Users can manage own push subscriptions"
  ON public.push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.push_subscriptions IS 'Web Push API subscription details';

-- ============================================
-- SECTION 8: HELPER FUNCTIONS
-- ============================================

-- Function to refresh dish statistics
CREATE OR REPLACE FUNCTION public.refresh_dish_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.dish_stats;
END;
$$;

COMMENT ON FUNCTION public.refresh_dish_stats IS 'Refreshes the dish statistics materialized view';

-- Function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'::jsonb
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

COMMENT ON FUNCTION public.create_notification IS 'Helper function to create notifications';

-- Function to get dish stats
CREATE OR REPLACE FUNCTION public.get_dish_stats(p_dish_id UUID)
RETURNS TABLE (
  dish_id UUID,
  dish_name TEXT,
  total_ratings BIGINT,
  avg_rating NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ds.dish_id,
    ds.dish_name,
    ds.total_ratings,
    ds.avg_rating
  FROM public.dish_stats ds
  WHERE ds.dish_id = p_dish_id;
END;
$$;

COMMENT ON FUNCTION public.get_dish_stats IS 'Retrieve statistics for a specific dish';

-- ============================================
-- SECTION 9: TRIGGERS
-- ============================================

-- Trigger: Auto-refresh dish stats when entries change
CREATE OR REPLACE FUNCTION public.trigger_refresh_dish_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.refresh_dish_stats();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_refresh_dish_stats_on_entry ON public.entries;
CREATE TRIGGER trigger_refresh_dish_stats_on_entry
  AFTER INSERT OR UPDATE OR DELETE ON public.entries
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_refresh_dish_stats();

-- Trigger: Notify friends on new post
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
  -- Skip if private entry
  IF NEW.is_private THEN
    RETURN NEW;
  END IF;

  -- Get poster's username
  SELECT username INTO v_poster_username
  FROM public.user_profiles
  WHERE id = NEW.user_id;

  v_entry_title := COALESCE(NEW.title, 'a new entry');

  -- Notify all friends
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

DROP TRIGGER IF EXISTS trigger_notify_friends_on_new_post ON public.entries;
CREATE TRIGGER trigger_notify_friends_on_new_post
  AFTER INSERT ON public.entries
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_friends_on_new_post();

-- Trigger: Notify on friend requests
CREATE OR REPLACE FUNCTION public.notify_on_friend_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_requester_username TEXT;
BEGIN
  -- Notify on new friend request
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

  -- Notify when request is accepted
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

DROP TRIGGER IF EXISTS trigger_notify_on_friend_request ON public.friendships;
CREATE TRIGGER trigger_notify_on_friend_request
  AFTER INSERT OR UPDATE ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_friend_request();

-- ============================================
-- SECTION 10: MIGRATION - LINK EXISTING ENTRIES TO DISHES
-- ============================================

DO $$
DECLARE
  v_entry RECORD;
  v_dish_id UUID;
  v_count INTEGER := 0;
BEGIN
  -- Loop through entries that don't have a dish_id
  FOR v_entry IN 
    SELECT id, title, user_id 
    FROM public.entries 
    WHERE dish_id IS NULL AND title IS NOT NULL
  LOOP
    -- Create or get dish
    INSERT INTO public.dishes (name, normalized_name)
    VALUES (v_entry.title, LOWER(TRIM(v_entry.title)))
    ON CONFLICT (normalized_name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_dish_id;
    
    -- Update entry with dish_id
    UPDATE public.entries
    SET dish_id = v_dish_id
    WHERE id = v_entry.id;
    
    v_count := v_count + 1;
  END LOOP;
  
  -- Refresh stats after migration
  IF v_count > 0 THEN
    REFRESH MATERIALIZED VIEW public.dish_stats;
    RAISE NOTICE 'Migration complete! % entries linked to dishes.', v_count;
  ELSE
    RAISE NOTICE 'No entries to migrate.';
  END IF;
END $$;

-- ============================================
-- SECTION 11: INITIAL DATA REFRESH
-- ============================================

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW public.dish_stats;

-- ============================================
-- SETUP COMPLETE!
-- ============================================

SELECT 
  'FoodTrack setup complete! ✅' as status,
  (SELECT COUNT(*) FROM public.user_profiles) as users,
  (SELECT COUNT(*) FROM public.entries) as entries,
  (SELECT COUNT(*) FROM public.dishes) as dishes,
  (SELECT COUNT(*) FROM public.friendships WHERE status = 'accepted') as friendships,
  (SELECT COUNT(*) FROM public.notifications) as notifications;
