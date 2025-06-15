
import React, { useState, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import TaskColumn, { Column } from './TaskColumn';
import { Task } from './TaskCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Database } from '@/integrations/supabase/types';

type DbTask = Database['public']['Tables']['tasks']['Row'];

// Initial data for the task board has been removed.

interface TaskBoardProps {
  className?: string;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ className }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);
      if (error) {
        toast({
            title: "Error fetching tasks",
            description: error.message,
            variant: "destructive",
        });
        throw new Error(error.message);
      }
      return data || [];
    },
    enabled: !!user,
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: string; newStatus: string }) => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus as any })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onMutate: async ({ taskId, newStatus }) => {
        await queryClient.cancelQueries({ queryKey: ['tasks', user?.id] });
        const previousTasks = queryClient.getQueryData(['tasks', user?.id]);
        
        queryClient.setQueryData(['tasks', user?.id], (old: DbTask[] | undefined) => {
            if (!old) return [];
            return old.map(task => 
                task.id === taskId ? { ...task, status: newStatus as any } : task
            );
        });
        
        return { previousTasks };
    },
    onError: (err, variables, context: any) => {
        if (context?.previousTasks) {
            queryClient.setQueryData(['tasks', user?.id], context.previousTasks);
        }
        toast({
            title: "Error moving task",
            description: "Could not update task status. Please try again.",
            variant: "destructive",
        });
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });

  const columns = useMemo<Column[]>(() => {
    const columnDefinitions: Omit<Column, 'tasks'>[] = [
      { id: 'todo', title: 'To Do', color: 'muted' },
      { id: 'in-progress', title: 'In Progress', color: 'blue' },
      { id: 'in-review', title: 'In Review', color: 'amber' },
      { id: 'completed', title: 'Completed', color: 'accent' },
    ];

    if (!tasks) {
      return columnDefinitions.map(c => ({...c, tasks: []}));
    }

    const groupedTasks = tasks.reduce((acc, task) => {
      const status = task.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push({
        id: task.id,
        title: task.title,
        description: task.description || '',
        tag: {
          color: task.tag_color || 'gray',
          label: task.tag_label || 'Task',
        },
        dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date',
        assignees: task.assignees_count || 1,
        progress: {
          completed: task.progress_completed || 0,
          total: task.progress_total || 1,
        },
      });
      return acc;
    }, {} as Record<string, Task[]>);

    return columnDefinitions.map(colDef => ({
      ...colDef,
      tasks: groupedTasks[colDef.id] || [],
    }));
  }, [tasks]);

  const handleTaskDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('taskId', task.id);
    setDraggedTask(task);
  };

  const handleTaskDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Handle drag leave logic if needed
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId || !draggedTask) return;

    const sourceColumn = columns.find(c => c.tasks.some(t => t.id === taskId));
    if (!sourceColumn || sourceColumn.id === targetColumnId) {
      return;
    }
    
    updateTaskStatusMutation.mutate({ taskId, newStatus: targetColumnId });
    
    const targetColumn = columns.find(col => col.id === targetColumnId);
    if (targetColumn) {
      toast({
        title: "Task moved",
        description: `${draggedTask.title} moved to ${targetColumn.title}`,
      });
    }
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    // This function can be used for programmatic status changes (not used in this implementation)
  };

  if (isLoading) {
    return (
        <div className={`flex gap-4 overflow-x-auto pb-4 ${className}`}>
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col w-72 min-w-72 rounded-lg border border-border bg-card/50 p-3 space-y-4">
                    <Skeleton className="h-6 w-2/3" />
                    <div className="space-y-2">
                        <Skeleton className="h-44 w-full" />
                        <Skeleton className="h-44 w-full" />
                    </div>
                </div>
            ))}
        </div>
    );
  }

  return (
    <div className={`flex gap-4 overflow-x-auto pb-4 ${className}`}>
      {columns.map(column => (
        <TaskColumn
          key={column.id}
          column={column}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onTaskDragStart={handleTaskDragStart}
          onTaskDragEnd={handleTaskDragEnd}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
};

export default TaskBoard;
