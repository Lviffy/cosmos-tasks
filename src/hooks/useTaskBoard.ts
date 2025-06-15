
import { useState, useMemo } from 'react';
import { useTasks } from './useTasks';
import { Task } from '@/components/TaskCard';
import { Column } from '@/components/TaskColumn';
import { useToast } from "@/hooks/use-toast";

export const useTaskBoard = () => {
  const { toast } = useToast();
  const { tasks, isLoading, updateTaskStatusMutation } = useTasks();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

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

  return {
    columns,
    isLoading,
    handleTaskDragStart,
    handleTaskDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleStatusChange,
  };
};
