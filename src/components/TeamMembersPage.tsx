
import React, { useState, useEffect } from "react";
import { useTeams } from "@/contexts/TeamsContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Crown, Trash2 } from "lucide-react";
import ShareTeamDialog from "./ShareTeamDialog";

interface TeamMember {
  id: string;
  user_id: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

const TeamMembersPage: React.FC = () => {
  const { selectedTeam } = useTeams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const fetchMembers = async () => {
    if (!selectedTeam) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("team_members")
        .select(`
          id,
          user_id,
          profiles!inner(
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("team_id", selectedTeam.id);

      if (error) {
        toast({
          title: "Error loading members",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setMembers(data || []);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, [selectedTeam]);

  const removeMember = async (memberId: string) => {
    if (!selectedTeam) return;

    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Member removed from team",
      });
      fetchMembers();
    }
  };

  const isOwner = selectedTeam?.owner_id === user?.id;

  if (!selectedTeam) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a team first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <h2 className="text-2xl font-semibold">{selectedTeam.name} Members</h2>
        </div>
        {isOwner && (
          <Button onClick={() => setShareOpen(true)}>
            <UserPlus className="size-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Team Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-1/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : members.length > 0 ? (
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={member.profiles.avatar_url || ""} />
                      <AvatarFallback>
                        {(member.profiles.username || member.profiles.full_name || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {member.profiles.full_name || member.profiles.username || "Unknown User"}
                        </p>
                        {member.user_id === selectedTeam.owner_id && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Crown className="size-3" />
                            Owner
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        @{member.profiles.username || "no-username"}
                      </p>
                    </div>
                  </div>
                  {isOwner && member.user_id !== selectedTeam.owner_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeMember(member.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="size-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No members found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ShareTeamDialog
        teamId={selectedTeam.id}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
    </div>
  );
};

export default TeamMembersPage;
