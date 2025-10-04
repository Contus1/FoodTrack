-- Fix entries visibility for social feed
-- Run this in your Supabase SQL Editor

-- Drop the current complex policy
DROP POLICY IF EXISTS "Users can view accessible entries" ON public.entries;

-- Create a simpler policy that allows viewing public entries from anyone
-- This will enable the social feed to work properly
CREATE POLICY "Users can view entries" ON public.entries
  FOR SELECT USING (
    auth.uid() = user_id OR          -- Users can always see their own entries
    (NOT is_private AND auth.uid() IS NOT NULL)  -- Logged in users can see all public entries
  );

-- Optional: If you want to be more restrictive and only show friends' entries,
-- uncomment this policy instead (but the above one is better for social discovery)
/*
CREATE POLICY "Users can view accessible entries" ON public.entries
  FOR SELECT USING (
    auth.uid() = user_id OR  -- Own entries
    (NOT is_private AND 
      (auth.uid() IN (
        SELECT CASE 
          WHEN requester_id = entries.user_id THEN addressee_id
          WHEN addressee_id = entries.user_id THEN requester_id
        END
        FROM public.friendships 
        WHERE status = 'accepted' 
        AND (requester_id = auth.uid() OR addressee_id = auth.uid())
      ) OR TRUE)  -- Allow discovery of all public entries for now
    )
  );
*/

SELECT 'Entries visibility policy updated for social feed!' as message;