
-- Add team_id column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;

-- Update RLS policies to include team_id
DROP POLICY IF EXISTS "Users can view their own tasks." ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks." ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks." ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks." ON public.tasks;

-- New policies that consider both user ownership and team membership
CREATE POLICY "Users can view tasks in their teams" ON public.tasks
FOR SELECT USING (
  auth.uid() = user_id AND 
  team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
);

CREATE POLICY "Users can insert tasks in their teams" ON public.tasks
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
);

CREATE POLICY "Users can update tasks in their teams" ON public.tasks
FOR UPDATE USING (
  auth.uid() = user_id AND 
  team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
);

CREATE POLICY "Users can delete tasks in their teams" ON public.tasks
FOR DELETE USING (
  auth.uid() = user_id AND 
  team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
);

-- Create index for better performance
CREATE INDEX idx_tasks_team_id ON public.tasks(team_id);
