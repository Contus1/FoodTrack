-- ============================================
-- FIX TIMESTAMPS AND SAVED POSTS
-- ============================================
-- Run this in Supabase SQL Editor

-- 1. CREATE entry_saves table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.entry_saves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES public.entries(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entry_id)
);

-- 2. Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_entry_saves_user_id ON public.entry_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_entry_saves_entry_id ON public.entry_saves(entry_id);

-- 3. Enable Row Level Security
ALTER TABLE public.entry_saves ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own saved entries" ON public.entry_saves;
DROP POLICY IF EXISTS "Users can save entries" ON public.entry_saves;
DROP POLICY IF EXISTS "Users can unsave entries" ON public.entry_saves;

-- 5. Create RLS policies
CREATE POLICY "Users can view their own saved entries"
  ON public.entry_saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save entries"
  ON public.entry_saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave entries"
  ON public.entry_saves FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Verify entries table has correct timestamp column type
-- This ensures all timestamps are stored as TIMESTAMPTZ (timezone-aware)
DO $$
BEGIN
  -- Check if created_at is not already TIMESTAMPTZ
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'entries' 
    AND column_name = 'created_at'
    AND data_type != 'timestamp with time zone'
  ) THEN
    -- Change to TIMESTAMPTZ
    ALTER TABLE public.entries 
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';
    
    -- Set default to NOW() if not already set
    ALTER TABLE public.entries 
    ALTER COLUMN created_at SET DEFAULT NOW();
  END IF;
END $$;

-- 7. Check the foreign key relationship exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'entries_user_id_fkey'
    AND table_name = 'entries'
  ) THEN
    ALTER TABLE public.entries
    ADD CONSTRAINT entries_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 8. Verify the setup
SELECT 
  'entry_saves table exists' as check_name,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'entry_saves'

UNION ALL

SELECT 
  'entries.created_at is TIMESTAMPTZ' as check_name,
  COUNT(*) as count
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'entries' 
AND column_name = 'created_at'
AND data_type = 'timestamp with time zone'

UNION ALL

SELECT 
  'Foreign key exists' as check_name,
  COUNT(*) as count
FROM information_schema.table_constraints
WHERE constraint_name = 'entries_user_id_fkey'
AND table_name = 'entries';
