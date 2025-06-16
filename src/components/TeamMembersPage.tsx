
import React, { useState, useEffect } from "react";
import { useTeams } from "@/contexts/TeamsContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, User, Trash2 } from "lucide-react";
import ShareTeamDialog from "./ShareTeamDialog";

interface TeamMember {
  id: string;
  user_id: string;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
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
      // First get team members
      const { data: teamMembersData, error: membersError } = await supabase
        .from("team_members")
        .select("id, user_id")
        .eq("team_id", selectedTeam.id);

      if (membersError) {
        toast({
          title: "Error loading members",
          description: membersError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!teamMembersData || teamMembersData.length === 0) {
        setMembers([]);
        setLoading(false);
        return;
      }

      // Get user IDs
      const userIds = teamMembersData.map(member => member.user_id);

      // Then get profiles for those users
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", userIds);

      if (profilesError) {
        console.warn("Error loading profiles:", profilesError.message);
      }

      // Combine the data
      const membersWithProfiles = teamMembersData.map(member => ({
        ...member,
        profiles: profilesData?.find(profile => profile.id === member.user_id) || null
      }));

      setMembers(membersWithProfiles);
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
      <div className="flex flex-col items-center justify-center h-64">
        <Users className="size-12 mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Workspace Selected</h3>
        <p className="text-muted-foreground text-center">
          Please select a workspace from the sidebar to manage team members
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="size-6" />
            {selectedTeam.name} Members
          </h2>
          <p className="text-muted-foreground">Manage your team members and their access</p>
        </div>
        {isOwner && (
          <Button onClick={() => setShareOpen(true)} className="flex items-center gap-2">
            <UserPlus className="size-4" />
            Invite Member
          </Button>
        )}
      </div>

      <Card className="border border-border bg-card/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="size-5" />
              Team Members ({members.length})
            </span>
            {members.length > 0 && (
              <Badge variant="outline">
                {members.filter(m => m.user_id === selectedTeam.owner_id).length} owner
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                  <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
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
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-md transition-all duration-200 bg-background hover:bg-muted/30"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.profiles?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(member.profiles?.username || member.profiles?.full_name || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {member.profiles?.full_name || member.profiles?.username || "Unknown User"}
                        </p>
                        {member.user_id === selectedTeam.owner_id && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <User className="size-3" />
                            Owner
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        @{member.profiles?.username || "no-username"}
                      </p>
                    </div>
                  </div>
                  {isOwner && member.user_id !== selectedTeam.owner_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeMember(member.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="size-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">No members found</h3>
              <p className="text-muted-foreground mb-4">
                This workspace doesn't have any members yet.
              </p>
              {isOwner && (
                <Button onClick={() => setShareOpen(true)} className="flex items-center gap-2">
                  <UserPlus className="size-4" />
                  Invite First Member
                </Button>
              )}
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
