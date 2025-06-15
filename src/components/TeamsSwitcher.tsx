
import React, { useState } from "react";
import { useTeams } from "@/contexts/TeamsContext";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const TeamsSwitcher: React.FC = () => {
  const { teams, selectedTeam, setSelectedTeam, createTeam, loading } = useTeams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleTeamSelect = (teamId: string) => {
    const found = teams.find((t) => t.id === teamId);
    if (found) setSelectedTeam(found);
    setDialogOpen(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    await createTeam(teamName.trim());
    setTeamName("");
    setCreating(false);
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="items-center gap-2 font-normal border"
        >
          <Users className="size-4" />
          <span className="truncate">{selectedTeam ? selectedTeam.name : "No Team"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Switch Team Workspace</DialogTitle>
        <div className="flex flex-col gap-3 mt-2">
          {teams.length === 0 ? (
            <div className="text-sm text-muted-foreground mb-2">No teams yet. Create one below!</div>
          ) : (
            <div className="flex flex-col gap-1 mb-4 max-h-56 overflow-auto">
              {teams.map((team) => (
                <Button
                  key={team.id}
                  onClick={() => handleTeamSelect(team.id)}
                  variant={selectedTeam?.id === team.id ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "justify-start w-full gap-2",
                    selectedTeam?.id === team.id ? "font-semibold" : ""
                  )}
                  disabled={loading}
                >
                  <Users className="size-4" />
                  <span className="truncate">{team.name}</span>
                  {selectedTeam?.id === team.id && <span className="ml-auto text-xs text-primary">(Selected)</span>}
                </Button>
              ))}
            </div>
          )}
          <form onSubmit={handleCreate} className="flex gap-2 mt-2">
            <Input
              placeholder="New team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              minLength={1}
              maxLength={100}
              required
              disabled={creating || loading}
              className="flex-1"
            />
            <Button type="submit" disabled={!teamName.trim() || creating || loading}>
              {creating ? <Loader2 className="animate-spin size-4" /> : <Plus className="size-4" />}
              Create
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamsSwitcher;
