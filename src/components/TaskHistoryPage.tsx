
import React, { useState } from "react";
import { useTeams } from "@/contexts/TeamsContext";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Calendar, User, History } from "lucide-react";
import AddTaskDialog from "./AddTaskDialog";
import { Database } from "@/integrations/supabase/types";

type TaskStatus = Database['public']['Enums']['task_status'];

const TaskHistoryPage: React.FC = () => {
  const { selectedTeam } = useTeams();
  const { tasks, isLoading } = useTasks();
  const [addOpen, setAddOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");

  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "due_date":
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      case "status":
        return a.status.localeCompare(b.status);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "todo": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      case "in-progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "in-review": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case "todo": return "To Do";
      case "in-progress": return "In Progress";
      case "in-review": return "In Review";
      case "completed": return "Completed";
      default: return status;
    }
  };

  if (!selectedTeam) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <History className="size-12 mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Workspace Selected</h3>
        <p className="text-muted-foreground text-center">
          Please select a workspace from the sidebar to view task history
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{selectedTeam.name} Task History</h2>
          <p className="text-muted-foreground">Complete workspace task history and management</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="flex items-center gap-2">
          <Plus className="size-4" />
          New Task
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="border border-border bg-card/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="size-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                placeholder="Search tasks by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="in-review">In Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Newest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="due_date">Due Date</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Results */}
      <Card className="border border-border bg-card/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <History className="size-5" />
              Task History ({sortedTasks.length})
            </span>
            {sortedTasks.length > 0 && (
              <Badge variant="outline">
                {sortedTasks.filter(t => t.status === 'completed').length} completed
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border border-border rounded-lg">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedTasks.length > 0 ? (
            <div className="space-y-4">
              {sortedTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="p-4 border border-border rounded-lg hover:shadow-md transition-all duration-200 bg-background hover:bg-muted/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{task.title}</h3>
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusLabel(task.status)}
                        </Badge>
                        {task.tag_label && (
                          <Badge variant="outline" style={{ borderColor: task.tag_color, color: task.tag_color }}>
                            {task.tag_label}
                          </Badge>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-muted-foreground text-sm leading-relaxed">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        {task.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="size-4" />
                            <span>{new Date(task.due_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <User className="size-4" />
                          <span>{task.assignees_count || 1} assignee{(task.assignees_count || 1) > 1 ? 's' : ''}</span>
                        </div>
                        {task.progress_total && task.progress_total > 0 && (
                          <div className="flex items-center gap-1">
                            <span>Progress: {task.progress_completed || 0}/{task.progress_total}</span>
                          </div>
                        )}
                        <div className="text-xs">
                          Created {new Date(task.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="size-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search criteria or filters" 
                  : "This workspace doesn't have any tasks yet. Create your first task to get started!"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={() => setAddOpen(true)} className="flex items-center gap-2">
                  <Plus className="size-4" />
                  Create First Task
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AddTaskDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
};

export default TaskHistoryPage;
