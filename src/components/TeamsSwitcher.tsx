
import React, { useState } from "react";
import { useTeams } from "@/contexts/TeamsContext";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export const TeamsSwitcher: React.FC = () => {
  const { teams, selectedTeam, setSelectedTeam, createTeam, loading } = useTeams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toast } = useToast();

  const MAX_LENGTH = 100;
  const MIN_LENGTH = 1;

  const handleTeamSelect = (teamId: string) => {
    const found = teams.find((t) => t.id === teamId);
    if (found) setSelectedTeam(found);
    setDialogOpen(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = teamName.trim();

    if (trimmedName.length < MIN_LENGTH || trimmedName.length > MAX_LENGTH) {
      setErrorMsg(
        `Team name must be ${MIN_LENGTH} to ${MAX_LENGTH} characters.`
      );
      return;
    }

    try {
      setCreating(true);
      const result = await createTeam(trimmedName);
      if (!result) {
        setErrorMsg("Failed to create team. Please try again.");
        toast({
          title: "Error",
          description: "Could not create the team. Try again or use a different name.",
          variant: "destructive",
        });
        setCreating(false);
        return;
      }
      setTeamName("");
      setDialogOpen(false);
      toast({
        title: "Team Created",
        description: `Workspace "${trimmedName}" has been created.`,
        variant: "default",
      });
    } catch (err) {
      setErrorMsg("Unexpected error. Please try again.");
      toast({
        title: "Unexpected Error",
        description: "An unknown error occurred while creating your team.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "items-center gap-2 font-normal border w-full",
            dialogOpen && "bg-muted"
          )}
        >
          <Users className="size-4" />
          <span className="truncate">{selectedTeam ? selectedTeam.name : "No Team"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Switch Team Workspace</DialogTitle>
        <DialogDescription>
          Select a workspace below, or create a new team for your organization.
        </DialogDescription>
        <div className="flex flex-col gap-3 mt-2">
          {teams.length === 0 ? (
            <div className="text-sm text-muted-foreground mb-2">
              No teams yet. Create your first one!
            </div>
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
                  aria-selected={selectedTeam?.id === team.id}
                >
                  <Users className="size-4" />
                  <span className="truncate">{team.name}</span>
                  {selectedTeam?.id === team.id && (
                    <span className="ml-auto text-xs text-primary">(Selected)</span>
                  )}
                </Button>
              ))}
            </div>
          )}
          <form onSubmit={handleCreate} className="flex flex-col gap-2 mt-1">
            <div>
              <Input
                placeholder="New team name"
                value={teamName}
                onChange={(e) => {
                  setTeamName(e.target.value);
                  setErrorMsg(null);
                }}
                minLength={MIN_LENGTH}
                maxLength={MAX_LENGTH}
                autoFocus
                required
                disabled={creating || loading}
                className={cn(
                  "flex-1",
                  errorMsg ? "border-destructive ring-destructive/30" : ""
                )}
                aria-invalid={!!errorMsg}
                aria-describedby={errorMsg ? "team-name-error" : undefined}
              />
              {errorMsg && (
                <p id="team-name-error" className="text-xs text-destructive mt-1">
                  {errorMsg}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={
                !teamName.trim() ||
                creating ||
                loading ||
                teamName.trim().length < MIN_LENGTH ||
                teamName.trim().length > MAX_LENGTH
              }
              className="w-full"
            >
              {creating ? (
                <>
                  <Loader2 className="animate-spin size-4" /> Creating...
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Create
                </>
              )}
            </Button>
          </form>
          <div className="text-xs text-muted-foreground text-center mt-2">
            Tip: You can join or switch teams anytime.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamsSwitcher;
