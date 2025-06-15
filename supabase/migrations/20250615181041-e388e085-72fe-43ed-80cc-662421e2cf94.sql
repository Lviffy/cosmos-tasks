
-- Create teams table
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Allow the team owner to select their own teams
CREATE POLICY "Select own teams" 
ON public.teams FOR SELECT 
USING (owner_id = auth.uid());

-- Allow the team owner to insert their teams
CREATE POLICY "Insert own teams" 
ON public.teams FOR INSERT 
WITH CHECK (owner_id = auth.uid());

-- Allow the team owner to update their teams
CREATE POLICY "Update own teams" 
ON public.teams FOR UPDATE 
USING (owner_id = auth.uid());

-- Allow the team owner to delete their teams
CREATE POLICY "Delete own teams" 
ON public.teams FOR DELETE 
USING (owner_id = auth.uid());

-- Add a constraint for non-empty team name
ALTER TABLE public.teams 
ADD CONSTRAINT team_name_not_empty 
CHECK (char_length(trim(name)) > 0);

-- Create an index for better performance on owner_id
CREATE INDEX idx_teams_owner_id ON public.teams(owner_id);
