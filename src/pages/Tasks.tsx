
import React from "react";
import { AppSidebarLayout } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import TaskBoard from "@/components/TaskBoard";
import DashboardAnalytics from "@/components/DashboardAnalytics";
import ThemeToggle from "@/components/ThemeToggle";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useTeams } from "@/contexts/TeamsContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckSquare, BarChart3, History } from "lucide-react";

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const { selectedTeam } = useTeams();

  if (!selectedTeam) {
    return (
      <AppSidebarLayout>
        <div className="min-h-screen flex-1 w-full bg-background flex flex-col">
          <header className="flex items-center justify-between px-4 py-4 border-b border-border bg-card shadow-sm sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="mr-2" />
              <h1 className="text-2xl font-semibold text-foreground">Tasks</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user ? (
                <UserProfile />
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </header>
          
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Workspace Selected</h3>
              <p className="text-muted-foreground text-center">
                Please select a workspace from the sidebar to view tasks
              </p>
            </div>
          </main>
        </div>
      </AppSidebarLayout>
    );
  }

  return (
    <AppSidebarLayout>
      <div className="min-h-screen flex-1 w-full bg-background flex flex-col">
        <header className="flex items-center justify-between px-4 py-4 border-b border-border bg-card shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="mr-2" />
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <CheckSquare className="size-6" />
              {selectedTeam.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <UserProfile />
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </header>
        
        <main className="flex-1 px-4 py-6 space-y-8 overflow-auto">
          {/* Analytics Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" />
              <h2 className="text-xl font-semibold">Analytics Overview</h2>
            </div>
            <DashboardAnalytics />
          </section>

          {/* Task Board Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="size-5 text-primary" />
              <h2 className="text-xl font-semibold">Task Board</h2>
            </div>
            <div className="bg-card/50 border border-border rounded-lg p-4">
              <TaskBoard />
            </div>
          </section>
        </main>
      </div>
    </AppSidebarLayout>
  );
};

export default Tasks;
