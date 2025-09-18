import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { Eye, Edit, Trash2 } from "lucide-react";
import { getTasksByProjectId } from "@/https/services/project";
import { Task, TaskResponse } from "@/interfaces/project";
import { useNavigate } from "@tanstack/react-router";
import { deleteTasksAPI } from "@/https/services/tasks";
import { toast } from "sonner";
import DeleteTaskDialog from "../core/TaskDeleteFilter"; // ✅ make sure path is correct

interface TasksTableProps {
  projectId: number;
}

const TasksTable: React.FC<TasksTableProps> = ({ projectId }) => {
  const { data, isLoading, error } = useQuery<TaskResponse, Error>({
    queryKey: ["tasks", projectId],
    queryFn: () => getTasksByProjectId(projectId),
    enabled: !!projectId,
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  const { mutate: deleteTask, isPending: deleteLoading } = useMutation({
    mutationFn: (id: number) => deleteTasksAPI(id),
    onSuccess: (res: any) => {
      toast.success(res?.data?.message || "Task deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      let message = "Failed to delete project.";
      if (error?.status === 409) {
        message = error?.message || "Conflict: Project cannot be deleted.";
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(message);
      setDeleteDialogOpen(false);
    },
  });

  const handleDeleteClick = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
    }
  };

  const formatDate = (dateStr: string | null) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "NA";

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-pink-100 text-pink-600";
      case "Review":
        return "bg-yellow-100 text-yellow-600";
      case "Done":
        return "bg-green-100 text-green-600";
      case "Overdue":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const taskColumns: ColumnDef<Task>[] = [
    {
      header: "S. No",
      accessorFn: (_row, index) => index + 1,
      cell: ({ getValue }) => (
        <span className="text-gray-600 text-sm flex justify-center">
          {getValue() as number}
        </span>
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
          <span>{row.original.task_title}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "task_status",
      cell: ({ row }) => {
        const status = row.original.task_status;
        return (
          <span
            className={`px-3 py-1 rounded-md text-xs font-semibold ${getStatusStyle(
              status
            )}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      header: "Due Date",
      accessorFn: (row) => formatDate(row.end_date),
      cell: ({ getValue }) => (
        <span className="px-3 py-1 rounded-md bg-blue-100 text-blue-600 text-xs font-medium">
          {getValue() as string}
        </span>
      ),
    },
    {
      header: "Actions",
      id: "actions",
      cell: (info: any) => {
        const rowData = info.row.original;
        return (
          <div className="flex gap-3 justify-center text-gray-500">
            <button
              className="hover:text-indigo-600 cursor-pointer"
              onClick={() => navigate({ to: `/tasks/view/${rowData.id}` })}
            >
              <Eye size={16} />
            </button>
            <button
              className="hover:text-green-600 cursor-pointer"
              onClick={() => navigate({ to: `/tasks/edit/${rowData.id}` })}
            >
              <Edit size={16} />
            </button>
            <button
              className="hover:text-red-600 cursor-pointer"
              onClick={() => {
                setTaskToDelete(rowData.id);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data?.data.data.records || [],
    columns: taskColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <p>Loading tasks...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data?.data.data.records?.length) return <p>No tasks found.</p>;

  return (
    <>
      <table className="w-full border-separate border-spacing-y-3 text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="text-left text-gray-500 text-xs"
            >
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="pb-2">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <DeleteTaskDialog
        openOrNot={deleteDialogOpen}
        onCancelClick={() => setDeleteDialogOpen(false)}
        label="Are you sure you want to delete this task?"
        onOKClick={handleDeleteClick}
        deleteLoading={deleteLoading}
      />
    </>
  );
};

export default TasksTable;
