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

    // Only fetch teams where this user is the owner (no subqueries)
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at");

    if (error) {
      toast({
        title: "Error loading teams",
        description: error.message,
        variant: "destructive",
      });
      setTeams([]);
    } else {
      setTeams(data || []);
      // Keep selectedTeam if still present, otherwise pick first or null
      if (selectedTeam && data?.some((t: Team) => t.id === selectedTeam.id)) {
        setSelectedTeam(data.find((t: Team) => t.id === selectedTeam.id) ?? null);
      } else if (data && data.length > 0) {
        setSelectedTeam(data[0]);
      } else {
        setSelectedTeam(null);
      }
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
    const { data, error } = await (supabase.from("teams") as any)
      .insert({
        name,
        owner_id: user.id,
      })
      .select("*")
      .single();

    setLoading(false);
    if (error) {
      toast({
        title: "Error creating team",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
    toast({ title: "Team created!", description: `Workspace "${name}" is ready.` });
    await fetchTeams();
    return data as Team;
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

  return (
    <TeamsContext.Provider
      value={{
        teams,
        selectedTeam,
        setSelectedTeam,
        refreshTeams: fetchTeams,
        createTeam,
        deleteTeam,
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
