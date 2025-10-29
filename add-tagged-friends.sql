-- ============================================
-- ADD TAGGED FRIENDS TO ENTRIES TABLE
-- ============================================
-- Run this in Supabase SQL Editor

-- Add tagged_friends column to entries table (array of user IDs)
ALTER TABLE public.entries 
ADD COLUMN IF NOT EXISTS tagged_friends UUID[] DEFAULT '{}';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_entries_tagged_friends 
ON public.entries USING GIN (tagged_friends);

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'entries'
  AND column_name = 'tagged_friends';

-- Success message
SELECT 'Tagged friends column added successfully!' as status;
