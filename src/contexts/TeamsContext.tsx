import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
    // Get teams where user is owner or member
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .or(`owner_id.eq.${user.id},id.in.(select team_id from team_members where user_id.eq.${user.id} and status.eq.active)`)
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
      // Keep the current team if still in the list, else pick the first one
      if (selectedTeam && data?.some((t) => t.id === selectedTeam.id)) {
        setSelectedTeam(data.find((t) => t.id === selectedTeam.id) ?? null);
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
    const { data, error } = await supabase
      .from("teams")
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
    return data;
  };

  return (
    <TeamsContext.Provider
      value={{
        teams,
        selectedTeam,
        setSelectedTeam,
        refreshTeams: fetchTeams,
        createTeam,
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
