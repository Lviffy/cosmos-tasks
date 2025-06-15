
import React, { useState } from "react";
import { useTeams } from "@/contexts/TeamsContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface ShareTeamDialogProps {
  teamId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareTeamDialog: React.FC<ShareTeamDialogProps> = ({
  teamId,
  open,
  onOpenChange,
}) => {
  const { inviteUserToTeam } = useTeams();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    const result = await inviteUserToTeam(teamId, username.trim());
    setLoading(false);

    if (result.success) {
      toast({ title: "Success!", description: result.message });
      setUsername("");
      onOpenChange(false);
    } else {
      toast({
        title: "Failed to invite",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a Teammate</DialogTitle>
          <DialogDescription>
            Enter the username of the person you want to invite to this workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite}>
          <div className="py-4">
            <Input
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !username.trim()}>
              {loading && <Loader2 className="animate-spin mr-2" />}
              Send Invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShareTeamDialog;
