import { Button } from "@/components/ui/button";
import { Edit, Eye, Trash } from "lucide-react";

export const getTaskActions = ({
  navigate,
  setTaskToDelete,
  setDeleteDialogOpen,
}: {
    navigate: any;
    setTaskToDelete: (id: number) => void;
    setDeleteDialogOpen: (value: boolean) => void;
}) => [
  {
    id: "actions",
    header: () => <span>Actions</span>,
    footer: (props: any) => props.column.id,
    size: 50,
    cell: (info: any) => {
      const rowData = info.row.original;

      return (
        <div className="flex gap-3">
          <Button
            title="View"
            className="text-gray-600 hover:bg-gray-100 cursor-pointer p-0"
            variant="ghost"
            onClick={() => navigate({ to: `/tasks/view/${rowData.id}` })}
          >
            <Eye size={16} />
          </Button>

          <Button
            title="Edit"
            className="text-gray-600 hover:bg-gray-100 cursor-pointer p-0"
            variant="ghost"
            onClick={() => navigate({ to: `/tasks/edit/${rowData.id}` })}
          >
            <Edit size={16} />
          </Button>

          <Button
            title="Delete"
            className="text-gray-600 hover:bg-gray-100 cursor-pointer p-0"
            variant="ghost"
            onClick={() => {
              setTaskToDelete(rowData.id);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash size={16} />
          </Button>
        </div>
      );
    },
  },
];
