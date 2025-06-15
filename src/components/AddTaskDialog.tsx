
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useCreateTask } from "@/hooks/useCreateTask";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormValues = {
  title: string;
  description: string;
  due_date: string;
};

const AddTaskDialog: React.FC<AddTaskDialogProps> = ({ open, onOpenChange }) => {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<FormValues>();
  const createTask = useCreateTask();

  const { user, loading } = useAuth();
  const { toast } = useToast();

  // If dialog opens and user is not authenticated, auto-close and alert
  useEffect(() => {
    if (open && !loading && !user) {
      toast({
        title: "Please sign in",
        description: "You must be signed in to create a task.",
        variant: "destructive",
      });
      // Close the dialog
      onOpenChange(false);
    }
  }, [open, user, loading, toast, onOpenChange]);

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Not signed in",
        description: "Sign in to add tasks.",
        variant: "destructive",
      });
      onOpenChange(false);
      return;
    }
    await createTask.mutateAsync({
      ...values,
      due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
      status: "todo",
      tag_label: "Task",
      tag_color: "gray",
      progress_total: 1,
      progress_completed: 0,
      assignees_count: 1,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!isSubmitting) onOpenChange(o); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Fill out the details to add a new task to your board.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <Input autoFocus placeholder="Title" {...register("title", { required: "Title is required" })} />
            {errors.title && <span className="text-xs text-destructive">{errors.title.message}</span>}
          </div>
          <div>
            <Textarea placeholder="Description" {...register("description")} />
          </div>
          <div>
            <Input type="date" {...register("due_date")} />
          </div>
          <div className="flex gap-2 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !user}>
              {isSubmitting ? (
                <Loader2 className="animate-spin size-4" />
              ) : (
                "Add Task"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskDialog;
