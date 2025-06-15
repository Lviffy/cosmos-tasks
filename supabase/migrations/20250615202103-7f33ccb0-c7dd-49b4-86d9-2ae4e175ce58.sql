
-- Drop the previous policies to avoid conflicts
DROP POLICY IF EXISTS "Team owners can manage members" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can insert members" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can delete members" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can update members" ON public.team_members;

-- This policy allows team owners to add new members to their teams.
CREATE POLICY "Team owners can insert members"
ON public.team_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.teams
    WHERE public.teams.id = public.team_members.team_id AND public.teams.owner_id = auth.uid()
  )
);

-- This policy allows team owners to remove members from their teams.
CREATE POLICY "Team owners can delete members"
ON public.team_members FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.teams
    WHERE public.teams.id = public.team_members.team_id AND public.teams.owner_id = auth.uid()
  )
);

-- This policy allows team owners to update members.
-- While there's nothing to update on team_members currently, this is for future-proofing.
CREATE POLICY "Team owners can update members"
ON public.team_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.teams
    WHERE public.teams.id = public.team_members.team_id AND public.teams.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.teams
    WHERE public.teams.id = public.team_members.team_id AND public.teams.owner_id = auth.uid()
  )
);
