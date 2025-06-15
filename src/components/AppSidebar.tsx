
import React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import TeamsSwitcher from "@/components/TeamsSwitcher";
import { useTeams } from "@/contexts/TeamsContext";

const AppSidebar: React.FC = () => {
  const { user, profile } = useAuth();
  const { teams, selectedTeam, setSelectedTeam, loading: teamsLoading } = useTeams();

  // Only Dashboard for now, active highlighting for extensibility
  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    // add more routes here
  ];

  const handleTeamSelect = (team: any) => {
    setSelectedTeam(team);
  };

  return (
    <Sidebar className="h-full" collapsible="offcanvas">
      <SidebarHeader className="flex items-center px-2 gap-2">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="text-primary" size={24} />
          <span className="font-semibold text-lg hidden md:inline">TaskApp</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 w-full ${
                      isActive
                        ? "bg-muted text-primary font-medium"
                        : "hover:bg-muted/50"
                    }`
                  }
                  end
                >
                  <item.icon className="size-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarSeparator className="my-2" />
        
        <SidebarGroup className="p-2 pt-0">
          <SidebarGroupLabel className="px-0 pb-1">Workspaces</SidebarGroupLabel>
          <SidebarMenu>
            {teamsLoading && !teams.length ? (
               <>
                 <SidebarMenuItem><SidebarMenuSkeleton showIcon /></SidebarMenuItem>
                 <SidebarMenuItem><SidebarMenuSkeleton showIcon /></SidebarMenuItem>
               </>
            ) : (
              teams.map((team) => (
                <SidebarMenuItem key={team.id}>
                  <SidebarMenuButton
                    onClick={() => handleTeamSelect(team)}
                    isActive={selectedTeam?.id === team.id}
                  >
                    <Users className="size-4" />
                    <span className="truncate">{team.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            )}
            <SidebarMenuItem>
              <TeamsSwitcher />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with user info or login button */}
      <SidebarFooter className="border-t border-border">
        {user && profile ? (
          <div className="flex items-center gap-3 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile.avatar_url || ""} alt={profile.username || ""} />
              <AvatarFallback>
                {(profile.username || profile.full_name || user.email || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm overflow-hidden">
              <span className="font-medium truncate max-w-[10rem] text-ellipsis">
                {profile.full_name || profile.username || "User"}
              </span>
              <span className="text-xs text-muted-foreground truncate max-w-[10rem] text-ellipsis">
                {user.email}
              </span>
            </div>
          </div>
        ) : (
          <NavLink to="/auth" className="w-full">
            <Button variant="outline" className="w-full">Login</Button>
          </NavLink>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export const AppSidebarLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      {children}
    </div>
  </SidebarProvider>
);

export default AppSidebar;
