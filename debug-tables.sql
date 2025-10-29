-- ============================================
-- DEBUG QUERIES - Run these and send me the results
-- ============================================

-- Query 1: Check entries table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'entries'
ORDER BY ordinal_position;

-- Query 2: Check entry_saves table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'entry_saves'
ORDER BY ordinal_position;

-- Query 3: Check foreign keys on entries table
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'entries';

-- Query 4: Check RLS policies on entry_saves
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'entry_saves';

-- Query 5: Test if we can insert into entry_saves (replace with your actual IDs)
-- First, let's see what entries exist
SELECT id, title, user_id 
FROM entries 
ORDER BY created_at DESC 
LIMIT 3;
