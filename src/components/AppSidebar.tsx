
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import TeamsSwitcher from "@/components/TeamsSwitcher";

const AppSidebar: React.FC = () => {
  const { user, profile } = useAuth();

  // Only Dashboard for now, active highlighting for extensibility
  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    // add more routes here
  ];

  return (
    <Sidebar className="h-full" collapsible="offcanvas">
      <SidebarHeader className="flex items-center px-2 gap-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="text-primary" size={24} />
            <span className="font-semibold text-lg hidden md:inline">TaskApp</span>
          </div>
          <SidebarTrigger className="h-8 w-8" />
        </div>
      </SidebarHeader>

      {/* Team switcher here */}
      <div className="px-2 pt-1 pb-2">
        <TeamsSwitcher />
      </div>

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
