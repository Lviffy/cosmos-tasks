
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useCreateTask } from "@/hooks/useCreateTask";
import { Loader2, X } from "lucide-react";

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

  const onSubmit = async (values: FormValues) => {
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
            <Button type="submit" disabled={isSubmitting}>
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
