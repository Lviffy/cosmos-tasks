
import React from "react";
import { AppSidebarLayout } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import TasksPage from "@/components/TasksPage";
import ThemeToggle from "@/components/ThemeToggle";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Tasks: React.FC = () => {
  const { user } = useAuth();

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
        
        <main className="max-w-7xl mx-auto w-full px-4 py-10">
          <TasksPage />
        </main>
      </div>
    </AppSidebarLayout>
  );
};

export default Tasks;
