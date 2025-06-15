
-- The existing policy for viewing team members causes infinite recursion because it
-- queries the team_members table to determine access. This migration fixes the issue
-- by using a SECURITY DEFINER function to break the recursion.

-- 1. Drop the faulty policy.
DROP POLICY IF EXISTS "Team members can view other members" ON public.team_members;

-- 2. Create a function that runs with elevated privileges to safely get the teams
--    a user belongs to. This avoids the recursive check.
CREATE OR REPLACE FUNCTION get_user_teams()
RETURNS TABLE(team_id uuid)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT team_id FROM public.team_members WHERE user_id = auth.uid();
$$;

-- 3. Recreate the policy for viewing team members, using the function.
--    A user can see members of a team if that team_id is in the list of teams they belong to.
CREATE POLICY "Team members can view other members"
ON public.team_members FOR SELECT USING (
  team_id IN (SELECT team_id FROM get_user_teams())
);
