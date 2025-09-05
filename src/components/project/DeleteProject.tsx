import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectData } from "@/interfaces/project";
import { deleteProjectAPI, getProjectByIdAPI } from "@/https/services/project";


const DeleteProject = ({
  data,
  onClose,
}: {
  data: ProjectData;
  onClose: () => void;
}) => {
  const [open, setOpen] = useState(true);
  const [projectId, setProjectId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // fetch project if needed (optional)
  const { data: selectedProjectData } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const result = await getProjectByIdAPI(projectId!);
      return result;
    },
    enabled: !!projectId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await deleteProjectAPI(id);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(
        res?.data?.message || "The project was deleted successfully."
      );
      setOpen(false);
      onClose();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete project."
      );
    },
  });

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(data.id!);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  useEffect(() => {
    if (data?.id !== undefined) {
      setProjectId(data.id);
    }
  }, [data]);

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this project: <b>{data.title}</b>?
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
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProject;
