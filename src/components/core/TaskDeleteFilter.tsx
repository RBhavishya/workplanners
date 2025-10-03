import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

const DeleteTaskDialog = ({
  openOrNot,
  label,
  onCancelClick,
  onOKClick,
  deleteLoading,
}: {
  openOrNot: boolean;
  label: string;
  onCancelClick: () => void;
  onOKClick: () => void;
  deleteLoading: boolean;
}) => {
  return (
    <Dialog open={openOrNot} onOpenChange={(open) => !open && onCancelClick()}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>{label}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          {/* Delete Button */}
          <Button
            type="button"
            variant="destructive"
            className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 cursor-pointer"
            onClick={onOKClick}
            disabled={deleteLoading}
          >
            {deleteLoading && (
              <Loader2 className="animate-spin h-4 w-4 text-white" />
            )}
            {deleteLoading ? "Deleting..." : "Yes! Delete"}
          </Button>

          {/* Cancel Button */}
          <Button
            type="button"
            variant="outline"
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
            onClick={onCancelClick}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTaskDialog;
