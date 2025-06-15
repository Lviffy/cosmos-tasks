
import React, { useState } from "react";
import { useTeams } from "@/contexts/TeamsContext";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const TeamsSwitcher: React.FC = () => {
  const { createTeam, loading } = useTeams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const MAX_LENGTH = 100;
  const MIN_LENGTH = 1;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = teamName.trim();

    if (trimmedName.length < MIN_LENGTH || trimmedName.length > MAX_LENGTH) {
      setErrorMsg(
        `Team name must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters.`
      );
      return;
    }

    try {
      setCreating(true);
      const newTeam = await createTeam(trimmedName);
      if (newTeam) {
        setTeamName("");
        setDialogOpen(false);
      } else {
        setErrorMsg("Failed to create team. Try a different name.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start items-center gap-2 h-8 text-sm p-2"
        >
          <Plus className="size-4" />
          <span className="hidden md:inline">New Workspace</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Create a new workspace</DialogTitle>
        <DialogDescription>
          Give your new team a name. You can change this later.
        </DialogDescription>
        <form onSubmit={handleCreate} className="flex flex-col gap-2 mt-4">
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
                <Loader2 className="animate-spin size-4 mr-2" /> Creating...
              </>
            ) : (
              <>
                <Plus className="size-4 mr-2" />
                Create Workspace
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeamsSwitcher;

