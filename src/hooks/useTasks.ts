
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { Database } from '@/integrations/supabase/types';

type DbTask = Database['public']['Tables']['tasks']['Row'];

export const useTasks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  return { tasks, isLoading, updateTaskStatusMutation };
};
