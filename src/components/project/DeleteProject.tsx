import React, { useState, useEffect } from "react";
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
import { ProjectData } from "@/interfaces/project";
import { deleteProjectAPI } from "@/https/services/project";

const DeleteProject = ({
  data,
  onClose,
}: {
  data: ProjectData;
  onClose: () => void;
}) => {
  const [open, setOpen] = useState(true);
  const queryClient = useQueryClient();

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
    let message = "Failed to delete project.";
    if (error?.status === 409) {
      message = error?.message || "Conflict: Project cannot be deleted.";
    } else if (error?.response?.data?.message) {
      message = error.response.data.message;
    }

    toast.error(message);

    // ✅ Close dialog even on error
    setOpen(false);
    onClose();
  },
});

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(data.id!);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

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
            Are you sure you want to delete this project:{" "}
            <b>{data.title}</b>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            )}
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </button>
          <button
            type="button"
            className="px-4 py-2 border rounded-lg"
            onClick={() => {
              setOpen(false);
              onClose();
            }}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProject;
