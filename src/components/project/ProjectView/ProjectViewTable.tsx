import DeleteTaskDialog from "@/components/core/TaskDeleteFilter";
import TasksPagination from "@/components/core/TasksPagination";
import { NoTasksIcon } from "@/components/icons/NoIcons/NoTasksIcon";
import { getTasksByProjectId } from "@/https/services/project";
import { deleteTasksAPI } from "@/https/services/tasks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import React, { useState } from "react";
import { toast } from "sonner";
import { projectViewColumns } from "./ProjectViewColumns";

interface TasksTableProps {
  projectId: number;
}

const TasksTable: React.FC<TasksTableProps> = ({ projectId }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const pageIndexParam = Number(searchParams.get("page")) || 1;
  const pageSizeParam = Number(searchParams.get("page_size")) || 25;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

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

  const taskColumns = projectViewColumns({
    pagination,
    navigate,
    onDeleteClick: (id) => {
      setTaskToDelete(id);
      setDeleteDialogOpen(true);
    },
  });

  const table = useReactTable({
    data: data?.data.data.records || [],
    columns: taskColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (error) return <p>Error: {error.message}</p>;
  if (isLoading) {
    return ( 
      <div className="flex items-center justify-center min-h-100">
        <img src="/6-dots-scale.svg" alt="loader" width={60} height={60} />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white h-[calc(100vh-278px)] rounded-lg">
      <div className="overflow-auto flex-1 rounded-lg">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="text-left text-gray-500 text-xs !h-10"
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 ">
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
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={taskColumns.length} className="text-center py-6">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <NoTasksIcon className="w-50 h-50" />
                    <p className="text-base 3xl:!text-lg text-[#828282] font-normal">
                      No Tasks Found
                    </p>
                  </div>
                </td>
              </tr>
            ) :(
              table.getRowModel().rows.map((row, rowIndex) => (
                <tr key={row.id} 
                className={`${
                  rowIndex % 2 === 0 ? "bg-slate-100" : "bg-white"
                } hover:bg-gray-50 border-none`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-1 px-4 ext-[13px] 3xl:!text-base">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-2">
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
