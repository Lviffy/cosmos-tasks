
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { Database } from '@/integrations/supabase/types';

type NewTask = {
  title: string;
  description?: string;
  due_date?: string;
  tag_label?: string;
  tag_color?: string;
  status?: string;
  progress_total?: number;
  progress_completed?: number;
  assignees_count?: number;
};

export function useCreateTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (task: NewTask) => {
      if (!user) throw new Error("User not authenticated");
      const { error, data } = await supabase.from('tasks').insert({ ...task, user_id: user.id }).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (newTask) => {
      // Optimistically add the new task to the cache
      queryClient.setQueryData(['tasks', user?.id], (old: any) => [newTask, ...(old ?? [])]);
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
