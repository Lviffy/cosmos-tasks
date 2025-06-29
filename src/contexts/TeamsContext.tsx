import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// NOTE: You must manually update your Supabase types after running migrations to avoid TS errors.
// For now, we disable specific type errors with 'as any' due to missing typings.
type Team = {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
};

type TeamsContextType = {
  teams: Team[];
  selectedTeam: Team | null;
  setSelectedTeam: (team: Team | null) => void;
  refreshTeams: () => Promise<void>;
  createTeam: (name: string) => Promise<Team | null>;
  deleteTeam: (teamId: string) => Promise<boolean>;
  inviteUserToTeam: (teamId: string, username: string) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
};

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export const TeamsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTeams = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      // Fetch teams by joining with team_members to get teams the user belongs to
      const { data, error } = await supabase
        .from("team_members")
        .select(`
          teams!inner(
            id,
            name,
            owner_id,
            created_at
          )
        `)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching teams:", error);
        toast({
          title: "Error loading teams",
          description: error.message,
          variant: "destructive",
        });
        setTeams([]);
      } else {
        // Extract teams from the joined data
        const userTeams = data?.map((item: any) => item.teams) || [];
        console.log("Fetched teams:", userTeams);
        setTeams(userTeams);
        
        // Keep selectedTeam if still present, otherwise pick first or null
        if (selectedTeam && userTeams.some((t: Team) => t.id === selectedTeam.id)) {
          setSelectedTeam(userTeams.find((t: Team) => t.id === selectedTeam.id) ?? null);
        } else if (userTeams.length > 0) {
          setSelectedTeam(userTeams[0]);
        } else {
          setSelectedTeam(null);
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching teams:", err);
      toast({
        title: "Error loading teams",
        description: "An unexpected error occurred while loading teams.",
        variant: "destructive",
      });
      setTeams([]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();
    // eslint-disable-next-line
  }, [user?.id]);

  const createTeam = async (name: string) => {
    if (!user?.id) return null;
    setLoading(true);
    
    try {
      const { data, error } = await (supabase.from("teams") as any)
        .insert({
          name,
          owner_id: user.id,
        })
        .select("*")
        .single();

      setLoading(false);
      if (error) {
        console.error("Error creating team:", error);
        toast({
          title: "Error creating team",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }
      
      console.log("Team created successfully:", data);
      toast({ title: "Team created!", description: `Workspace "${name}" is ready.` });
      await fetchTeams();
      return data as Team;
    } catch (err) {
      console.error("Unexpected error creating team:", err);
      setLoading(false);
      toast({
        title: "Error creating team",
        description: "An unexpected error occurred while creating the team.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteTeam = async (teamId: string) => {
    setLoading(true);
    const { error } = await supabase.from("teams").delete().eq("id", teamId);
    setLoading(false);
    if (error) {
      toast({
        title: "Error deleting team",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
    toast({
      title: "Team deleted",
      description: "Workspace has been deleted.",
      variant: "default",
    });
    await fetchTeams();
    return true;
  };

  const inviteUserToTeam = async (teamId: string, username: string): Promise<{ success: boolean; message: string; }> => {
    if (!user) return { success: false, message: 'You must be logged in.' };

    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', username.trim());

    if (profileError || !profiles || profiles.length === 0) {
      return { success: false, message: 'User with that username was not found.' };
    }

    if (profiles.length > 1) {
      return { success: false, message: 'Multiple users found with that username. Please contact support.' };
    }

    const invitee = profiles[0];

    if (invitee.id === user.id) {
      return { success: false, message: "You cannot invite yourself to a team." };
    }

    const { error: insertError } = await supabase
      .from('team_members')
      .insert({ team_id: teamId, user_id: invitee.id });
    
    if (insertError) {
      if (insertError.code === '23505') { // unique constraint violation
        return { success: false, message: `${invitee.username} is already a member of this team.`};
      }
      return { success: false, message: `Error inviting user: ${insertError.message}`};
    }

    return { success: true, message: `Successfully invited ${invitee.username} to the team.`};
  };

  return (
    <TeamsContext.Provider
      value={{
        teams,
        selectedTeam,
        setSelectedTeam,
        refreshTeams: fetchTeams,
        createTeam,
        deleteTeam,
        inviteUserToTeam,
        loading,
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
};

export function useTeams() {
  const context = useContext(TeamsContext);
  if (!context) throw new Error("useTeams must be used within TeamsProvider");
  return context;
}
