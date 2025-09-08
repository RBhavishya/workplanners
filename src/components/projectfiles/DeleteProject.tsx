import React from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteProjectAPI } from "@/https/services/project";
import { ProjectData } from "@/lib/interfaces/project";
import { useNavigate } from "@tanstack/react-router";

interface DeleteProjectProps {
  open: boolean;
  data: ProjectData | null;
  onOpenChange: (open: boolean) => void;
}

const DeleteProject = ({ open, data, onOpenChange }: DeleteProjectProps) => {
  const queryClient = useQueryClient();
const navigate = useNavigate();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => await deleteProjectAPI(id),
   onSuccess: (res) => {
  queryClient.invalidateQueries({ queryKey: ["projects"] });
  
  toast.success(
    res?.data?.message || "The project was deleted successfully."
  );
  navigate({ to: "/projects" });
},
    onError: (error: any) => {
      
      toast.error(
        error?.data?.message || "Failed to delete project."
      );
    },
  });
  

  const handleDelete = async () => {
    if (!data?.id) return;
    await deleteMutation.mutateAsync(data.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this project:{" "}
            <b>{data?.title || "Untitled"}</b>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </button>
          <button
            type="button"
            className="px-4 py-2 border rounded-lg"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProject;
