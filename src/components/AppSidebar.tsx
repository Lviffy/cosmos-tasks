
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
import { Link, useLocation } from "react-router-dom";

const AppSidebar: React.FC = () => {
  const { user, profile } = useAuth();
  const location = useLocation();

  // Only Dashboard for now, active highlighting for extensibility
  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      match: (path: string) => path === "/dashboard",
    },
    // add more routes here
  ];

  return (
    <Sidebar className="h-full" collapsible="offcanvas">
      {/* Optionally, you can add a logo or app title in the header */}
      <SidebarHeader className="flex items-center px-2">
        <LayoutDashboard className="text-primary mr-2" size={24} />
        <span className="font-semibold text-lg hidden md:inline">TaskApp</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const active = item.match(location.pathname);
            return (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton asChild isActive={active}>
                  <Link to={item.to} className="flex items-center gap-2">
                    <item.icon className="size-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
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
          <Link to="/auth" className="w-full">
            <Button variant="outline" className="w-full">Login</Button>
          </Link>
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
