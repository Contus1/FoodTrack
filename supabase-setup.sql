-- ============================================
-- SUPABASE SETUP: NOTIFICATIONS SYSTEM
-- ============================================
-- Copy and paste this entire file into Supabase SQL Editor
-- Run it to create all necessary tables and functions

-- ============================================
-- 0. CHECK AND UPDATE EXISTING NOTIFICATIONS TABLE
-- ============================================
-- If you already have a notifications table, this will add missing columns
DO $$
BEGIN
  -- Add 'read' column if it doesn't exist (but you already have is_read)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'notifications' 
    AND column_name = 'read'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN read BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add 'data' column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'notifications' 
    AND column_name = 'data'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN data JSONB DEFAULT '{}'::jsonb;
  END IF;
  
  -- Add 'title' column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'notifications' 
    AND column_name = 'title'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN title TEXT DEFAULT 'Notification';
  END IF;
  
  -- Add 'message' column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'notifications' 
    AND column_name = 'message'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN message TEXT DEFAULT '';
  END IF;
END $$;

-- ============================================
-- 1. CREATE NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'new_post', 'friend_request', 'stat_update', 'achievement', 'comment'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb, -- Additional data like post_id, user_id, etc.
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read) WHERE read = false;

-- Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow system to insert notifications (needed for triggers)
CREATE POLICY "System can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE public.notifications IS 'Stores in-app notifications for users';

-- ============================================
-- 2. CREATE PUSH SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL, -- Contains p256dh and auth keys
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can insert own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can update own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON public.push_subscriptions;

-- Users can manage their own push subscriptions
CREATE POLICY "Users can view own push subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push subscriptions"
  ON public.push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push subscriptions"
  ON public.push_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
  ON public.push_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.push_subscriptions IS 'Stores Web Push API subscription details for each user device';

-- ============================================
-- 3. CREATE HELPER FUNCTION TO CREATE NOTIFICATIONS
-- ============================================
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

COMMENT ON FUNCTION public.create_notification IS 'Helper function to create notifications with proper permissions';

-- ============================================
-- 4. CREATE TRIGGER FOR NEW POSTS (EXAMPLE)
-- ============================================
-- This automatically notifies friends when someone posts

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
  -- Get poster's username
  SELECT username INTO v_poster_username
  FROM public.user_profiles
  WHERE id = NEW.user_id;

  -- Get entry title
  v_entry_title := COALESCE(NEW.title, 'a new entry');

  -- Notify all friends of the poster (accepted friendships only)
  FOR v_friend_id IN
    SELECT CASE 
      WHEN requester_id = NEW.user_id THEN addressee_id
      ELSE requester_id
    END as friend
    FROM public.friendships
    WHERE (requester_id = NEW.user_id OR addressee_id = NEW.user_id)
      AND status = 'accepted'
  LOOP
    -- Create notification for each friend
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

-- Attach trigger to entries table (not food_entries!)
DROP TRIGGER IF EXISTS trigger_notify_friends_on_new_post ON public.entries;
CREATE TRIGGER trigger_notify_friends_on_new_post
  AFTER INSERT ON public.entries
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_friends_on_new_post();

COMMENT ON FUNCTION public.notify_friends_on_new_post IS 'Automatically notifies friends when a user posts a new entry';

-- ============================================
-- 5. CREATE TRIGGER FOR FRIEND REQUESTS
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_on_friend_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_requester_username TEXT;
BEGIN
  -- Only notify on new friend requests (pending status)
  IF NEW.status = 'pending' THEN
    -- Get requester's username
    SELECT username INTO v_requester_username
    FROM public.user_profiles
    WHERE id = NEW.requester_id;

    -- Notify the addressee (recipient)
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

  -- Notify when friend request is accepted
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    -- Get accepter's username
    SELECT username INTO v_requester_username
    FROM public.user_profiles
    WHERE id = NEW.addressee_id;

    -- Notify the original requester
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

-- Attach trigger to friendships table (not friends!)
DROP TRIGGER IF EXISTS trigger_notify_on_friend_request ON public.friendships;
CREATE TRIGGER trigger_notify_on_friend_request
  AFTER INSERT OR UPDATE ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_friend_request();

COMMENT ON FUNCTION public.notify_on_friend_request IS 'Notifies users about friend requests and acceptances';

-- ============================================
-- DONE! 
-- ============================================
-- Your notification system is now set up.
-- The app will automatically:
-- 1. Show notifications when friends post new entries
-- 2. Show notifications for friend requests
-- 3. Allow users to subscribe to push notifications

SELECT 'Notification system successfully installed!' as status;
