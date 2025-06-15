
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import TaskBoard from "@/components/TaskBoard";
import AddTaskDialog from "@/components/AddTaskDialog";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AppSidebar, { AppSidebarLayout } from "@/components/AppSidebar";
import UserAvatarButton from "@/components/UserAvatarButton";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Dashboard: React.FC = () => {
  const [addOpen, setAddOpen] = useState(false);

  const { user, loading } = useAuth();
  const { toast } = useToast();

  const handleOpenAddTask = () => {
    if (!loading && !user) {
      toast({
        title: "Please sign in",
        description: "You must be signed in to create a task.",
        variant: "destructive",
      });
      setAddOpen(false);
      return;
    }
    setAddOpen(true);
  };

  return (
    <AppSidebarLayout>
      <div className="min-h-screen flex-1 w-full bg-background flex flex-col">
        {/* Dashboard Header */}
        <header className="flex items-center justify-between px-4 py-4 border-b border-border bg-card shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-2">
            {/* Sidebar trigger for mobile/small view */}
            <SidebarTrigger className="md:hidden mr-2" />
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              Dashboard
            </h1>
          </div>
          {/* Settings button removed for now, you can add back if needed */}
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleOpenAddTask}
              disabled={loading || !user}
            >
              <Plus className="size-4" /> New Task
            </Button>
            <UserAvatarButton />
          </div>
        </header>
        {/* Main content */}
        <main className="max-w-7xl mx-auto w-full px-4 py-10 space-y-10">
          <section>
            <div className="flex justify-between items-center mb-2 gap-2 flex-col sm:flex-row">
              <div>
                <h2 className="text-xl font-semibold">Your Board</h2>
                <p className="text-muted-foreground mb-2 sm:mb-0">
                  Manage all your project tasks in one place.
                </p>
              </div>
            </div>
            <AddTaskDialog open={addOpen} onOpenChange={setAddOpen} />
            <div className="rounded-xl border border-border bg-card/60 shadow-lg p-4">
              <TaskBoard />
            </div>
          </section>
        </main>
      </div>
    </AppSidebarLayout>
  );
};

export default Dashboard;
