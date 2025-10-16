import { ColumnDef } from "@tanstack/react-table";
import { Task } from "@/interfaces/project";
import { statusColors } from "@/lib/helpers/statusColors";
import dayjs from "dayjs";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavigateFn } from "@tanstack/react-router";

interface ProjectViewColumnsProps {
  pagination: { pageIndex: number; pageSize: number };
  navigate: NavigateFn;
  onDeleteClick: (id: number) => void;
}

export const projectViewColumns = ({
  pagination,
  navigate,
  onDeleteClick,
}: ProjectViewColumnsProps): ColumnDef<Task>[] => [
  {
    header: "S. No",
    accessorFn: (_row, index) =>
      (pagination.pageIndex - 1) * pagination.pageSize + index + 1,
    cell: ({ getValue }) => (
      <span className="text-gray-600 text-sm">{getValue() as number}</span>
    ),
  },
  {
    header: "Task Name",
    accessorKey: "task_title",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
          📌
        </div>
        <span className="capitalize">{row.original.task_title}</span>
      </div>
    ),
  },
  {
    header: "Status",
    accessorKey: "task_status",
    cell: ({ row }) => {
      const status = row.original.task_status;
      const cls = statusColors[status] || "bg-gray-100 text-gray-600";
      return (
        <span className={`px-3 py-0.5 rounded-sm text-xs font-medium ${cls}`}>
          {status === "IN_PROGRESS"
            ? "In Progress"
            : status.charAt(0).toUpperCase() +
              status.slice(1).toLowerCase() || "-"}
        </span>
      );
    },
  },
  {
    header: "Due Date",
    accessorFn: (row) => dayjs(row.end_date).format("DD MMM YYYY"),
    cell: ({ getValue }) => (
      <span className="px-3 py-1 rounded-md bg-blue-100 text-blue-600 text-xs font-medium">
        {getValue() as string}
      </span>
    ),
  },
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const rowData = row.original;
      return (
        <div className="flex gap-3 justify-center text-gray-500">
          <Button
            title="View"
            variant="ghost"
            className="hover:text-indigo-600 text-gray-600 cursor-pointer p-0"
            onClick={() => navigate({ to: `/tasks/view/${rowData.id}` })}
          >
            <Eye size={16} />
          </Button>
          <Button
            title="Edit"
            variant="ghost"
            className="hover:text-green-600 text-gray-600 cursor-pointer p-0"
            onClick={() => navigate({ to: `/tasks/edit/${rowData.id}` })}
          >
            <Edit size={16} />
          </Button>
          <Button
            title="Delete"
            variant="ghost"
            className="hover:text-red-600 text-gray-600 cursor-pointer p-0"
            onClick={() => onDeleteClick(rowData.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      );
    },
  },
];
