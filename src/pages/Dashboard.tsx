
import React from "react";
import { Button } from "@/components/ui/button";
import TaskBoard from "@/components/TaskBoard";
import { LayoutDashboard } from "lucide-react";

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Dashboard Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-border bg-card shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="text-primary" size={28} />
          <h1 className="text-2xl font-semibold text-foreground">
            Dashboard
          </h1>
        </div>
        <Button variant="outline" size="sm" className="text-xs">
          Settings
        </Button>
      </header>
      {/* Main content */}
      <main className="max-w-7xl mx-auto w-full px-4 py-10 space-y-10">
        <section>
          <h2 className="text-xl font-semibold mb-2">Your Board</h2>
          <p className="text-muted-foreground mb-4">
            Manage all your project tasks in one place.
          </p>
          <div className="rounded-xl border border-border bg-card/60 shadow-lg p-4">
            <TaskBoard />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
