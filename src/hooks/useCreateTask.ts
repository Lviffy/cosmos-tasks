
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTeams } from '@/contexts/TeamsContext';
import { useToast } from "@/hooks/use-toast";
import { Database } from '@/integrations/supabase/types';

type TaskStatus = Database['public']['Enums']['task_status'];

type NewTask = {
  title: string;
  description?: string;
  due_date?: string | null;
  tag_label?: string;
  tag_color?: string;
  status?: TaskStatus;
  progress_total?: number | null;
  progress_completed?: number | null;
  assignees_count?: number | null;
};

export function useCreateTask() {
  const { user } = useAuth();
  const { selectedTeam } = useTeams();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (task: NewTask) => {
      if (!user) throw new Error("User not authenticated");
      if (!selectedTeam) throw new Error("No team selected");
      
      const insertPayload = {
        ...task,
        user_id: user.id,
        team_id: selectedTeam.id,
        status: (task.status || 'todo') as TaskStatus,
        due_date: task.due_date ? task.due_date : null,
        progress_total: task.progress_total ?? 1,
        progress_completed: task.progress_completed ?? 0,
        assignees_count: task.assignees_count ?? 1,
      };
      const { error, data } = await supabase
        .from('tasks')
        .insert(insertPayload)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (newTask) => {
      queryClient.setQueryData(['tasks', user?.id, selectedTeam?.id], (old: any) => [newTask, ...(old ?? [])]);
      toast({
        title: "Task created",
        description: "Your new task was added!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return mutation;
}
