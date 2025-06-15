
-- Creates a table to store team members, linking users to teams.
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Enables Row Level Security on the new table to control access.
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Updates the 'teams' table policy to allow members to view teams they belong to.
DROP POLICY IF EXISTS "Select own teams" ON public.teams;
CREATE POLICY "Users can view teams they are members of"
ON public.teams FOR SELECT USING (
  (owner_id = auth.uid()) OR
  EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE public.team_members.team_id = public.teams.id AND public.team_members.user_id = auth.uid()
  )
);

-- Updates 'tasks' policies to allow team members to manage tasks.
DROP POLICY IF EXISTS "Users can view tasks in their teams" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert tasks in their teams" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks in their teams" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete tasks in their teams" ON public.tasks;

CREATE POLICY "Team members can manage tasks"
ON public.tasks FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE public.team_members.team_id = public.tasks.team_id AND public.team_members.user_id = auth.uid()
  )
);

-- Adds a policy so members can see who else is in the team.
CREATE POLICY "Team members can view other members"
ON public.team_members FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.team_members as tm
    WHERE tm.team_id = public.team_members.team_id AND tm.user_id = auth.uid()
  )
);

-- Adds a policy to allow team owners to add/remove members.
CREATE POLICY "Team owners can manage members"
ON public.team_members FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM public.teams
    WHERE public.teams.id = public.team_members.team_id AND public.teams.owner_id = auth.uid()
  )
);

-- This function automatically adds the team creator as the first member of the team.
CREATE OR REPLACE FUNCTION public.add_team_creator_as_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.team_members (team_id, user_id)
  VALUES (NEW.id, NEW.owner_id);
  RETURN NEW;
END;
$$;

-- This trigger executes the function after a new team is created.
CREATE TRIGGER on_team_created_add_owner_as_member
  AFTER INSERT ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.add_team_creator_as_member();
