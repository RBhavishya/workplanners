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
import { Task} from "@/interfaces/project";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { deleteTasksAPI } from "@/https/services/tasks";
import { toast } from "sonner";
import DeleteTaskDialog from "../core/TaskDeleteFilter";
import TasksPagination from "./TasksPagination";
import { Button } from "../ui/button";

interface TasksTableProps {
  projectId: number;
}

const TasksTable: React.FC<TasksTableProps> = ({ projectId }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const pageIndexParam = Number(searchParams.get("page")) || 1;
  const pageSizeParam = Number(searchParams.get("page_size")) || 25;

  const [pagination, setPagination] = useState({
    pageIndex: pageIndexParam,
    pageSize: pageSizeParam,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks", projectId, pagination],
    queryFn: () =>
      getTasksByProjectId({
        projectId,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      }),
    enabled: !!projectId,
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  const statusColors: Record<string, string> = {
    NEW: "bg-purple-100 text-purple-600",
    IN_PROGRESS: "bg-blue-100 text-blue-600",
    REVIEW: "bg-yellow-100 text-yellow-700",
    OVERDUE: "bg-red-100 text-red-600",
    COMPLETED: "bg-green-100 text-green-600",
  };

  const { mutate: deleteTask, isPending: deleteLoading } = useMutation({
    mutationFn: (id: number) => deleteTasksAPI(id),
    onSuccess: (res: any) => {
      toast.success(res?.data?.message || "Task deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      let message = "Failed to delete task.";
      if (error?.status === 409) {
        message = error?.message || "Conflict: Task cannot be deleted.";
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

  const capturePageNum = (pageIndex: number) => {
    setPagination((prev) => ({ ...prev, pageIndex }));
  };

  const captureRowPerItems = (pageSize: number) => {
    setPagination((prev) => ({ ...prev, pageIndex: 1, pageSize }));
  };

  const formatDate = (dateStr: string | null) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "NA";

  const taskColumns: ColumnDef<Task>[] = [
    {
      header: "S. No",
      accessorFn: (_row, index) =>
        (pagination.pageIndex - 1) * pagination.pageSize + index + 1,
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
        const status = row.original.task_status?.toUpperCase();
        const cls = statusColors[status] || "bg-gray-100 text-gray-600";
        return (
          <span className={`px-3 py-1 rounded-md text-xs font-medium ${cls}`}>
            {status || "Unknown"}
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
            <Button
              title="View"
               variant="ghost"
              className=" hover:text-indigo-600 border border-gray-400 rounded px-2 py-1 text-gray-600 cursor-pointer"
              onClick={() => navigate({ to: `/tasks/view/${rowData.id}` })}
            >
              <Eye size={16} />
            </Button>
            <Button
              title="Edit"
               variant="ghost"
              className=" hover:text-green-600 border border-gray-400 rounded px-2 py-1 text-gray-600 cursor-pointer"
              onClick={() => navigate({ to: `/tasks/edit/${rowData.id}` })}
            >
              <Edit size={16} />
            </Button>
            <Button
              title="Delete"
               variant="ghost"
              className=" hover:text-red-600 border border-gray-400 rounded px-2 py-1 text-gray-600 cursor-pointer"
              onClick={() => {
                setTaskToDelete(rowData.id);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 size={16} />
            </Button>
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
    <div className="flex flex-col h-[calc(100vh-400px)] p-4">
      {/* Scrollable table container */}
      <div className="overflow-auto flex-1 border border-gray-200 rounded-lg">
        <table className="w-full border-separate border-spacing-y-3 text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="text-left text-gray-500 text-xs">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="pb-2 px-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="bg-white border-b border-gray-200">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <TasksPagination
          paginationDetails={
            data?.data?.data?.pagination_info || {
              total_records: 0,
              total_pages: 1,
              current_page: pagination.pageIndex,
              page_size: pagination.pageSize,
              next_page: null,
              prev_page: null,
            }
          }
          capturePageNum={capturePageNum}
          captureRowPerItems={captureRowPerItems}
        />
      </div>

      {/* Delete Dialog */}
      <DeleteTaskDialog
        openOrNot={deleteDialogOpen}
        onCancelClick={() => setDeleteDialogOpen(false)}
        label="Are you sure you want to delete this task?"
        onOKClick={handleDeleteClick}
        deleteLoading={deleteLoading}
      />
    </div>
  );
};

export default TasksTable;
