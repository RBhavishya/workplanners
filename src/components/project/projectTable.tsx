import React from "react";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Eye, Edit, Trash, ArrowUpDown } from "lucide-react";
import {
  deleteProjectAPI,
  getAllUsersProjects,
} from "@/https/services/project";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import dayjs from "dayjs";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  NEW: "bg-purple-100 text-purple-600",
  IN_PROGRESS: "bg-blue-100 text-blue-600",
  REVIEW: "bg-yellow-100 text-yellow-700",
  OVERDUE: "bg-red-100 text-red-600",
  COMPLETED: "bg-green-100 text-green-600",
};

interface ProjectsTableProps {
  debouncedSearch: string;
  selectedSort: string;
  setSelectedSort: (val: string) => void; // ✅ added setter
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  onDelete: (project: any) => void;
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({
  debouncedSearch,
  selectedSort,
  setSelectedSort,
  page,
  pageSize,
  setPage,
  onDelete,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // View Project Handler
  const handleView = (id: number) => {
    navigate({ to: `/projects/${id}` });
  };

  // Fetch projects with filters
  const { data, isLoading, isError } = useQuery({
    queryKey: ["projectsTable", page, pageSize, debouncedSearch, selectedSort],
    queryFn: () =>
      getAllUsersProjects({
        pageIndex: page,
        pageSize,
        viewMode: "table",
        order_by: selectedSort,
        search_string: debouncedSearch,
      }),
  });
  const projects = data?.data?.data?.records || [];
  const pagination = data?.data?.data?.pagination_info;


  // Sort toggle helper
  const handleSort = (column: string) => {
    if (selectedSort === column) {
      setSelectedSort(`${column}_desc`);
    } else if (selectedSort === `${column}_desc`) {
      setSelectedSort(""); // clear sort
    } else {
      setSelectedSort(column);
    }
  };

  // Table Columns
  const columns = React.useMemo<ColumnDef<any>[]>(() => {
    return [
      {
        header: "S. No",
        cell: ({ row }) => row.index + 1 + (page - 1) * pageSize,
      },
      {
        header: "Project Name",
        accessorKey: "project_name",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-purple-500 flex items-center justify-center text-white font-bold">
                {p.project_name?.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{p.project_name}</span>
            </div>
          );
        },
      },
      {
        header: "Assigned Users",
        accessorKey: "users",
        cell: ({ row }) => {
          const users = row.original.users || [];
          if (users.length === 0) {
            return <span className="text-black-400 text-sm">-</span>;
          }
          const visibleUsers = users.slice(0, 3);
          const remainingUsers = users.slice(3);
          return (
            <div className="flex -space-x-2 items-center">
              {visibleUsers.map((u: any) => (
                <div
                  key={u.user_id}
                  className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white border-2 border-white"
                  title={u.display_name}
                >
                  {u.display_name.charAt(0).toUpperCase()}
                </div>
              ))}
              {remainingUsers.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-xs font-bold text-white border-2 border-white cursor-pointer">
                        +{remainingUsers.length}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex flex-col gap-1">
                        {remainingUsers.map((u: any) => (
                          <span key={u.user_id}>{u.display_name}</span>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          );
        },
      },
      {
        accessorFn: (row: any) => row.start_date,
        id: "start_date",
        cell: (info: any) => {
          const date: string = info.getValue();
          return <span>{date ? dayjs(date).format("MM-DD-YYYY") : "-"}</span>;
        },
        width: "90px",
        maxWidth: "90px",
        minWidth: "90px",
        header: () => <span>Start Date</span>,
        footer: (props: any) => props.column.id,
      },
      {
        accessorFn: (row: any) => row.due_date,
        id: "end_date",
        cell: (info: any) => {
          const date: string = info.getValue();
          return <span>{date ? dayjs(date).format("MM-DD-YYYY") : "-"}</span>;
        },
        width: "90px",
        maxWidth: "90px",
        minWidth: "90px",
        header: () => <span>End Date</span>,
        footer: (props: any) => props.column.id,
      },
      {
        header: "Status",
        accessorKey: "project_status",
        cell: ({ row }) => {
          const status = row.original.project_status;
          const cls = statusColors[status] || "bg-gray-100 text-gray-600";
          return (
            <span className={`px-3 py-1 rounded-md text-xs font-medium ${cls}`}>
              {status}
            </span>
          );
        },
      },
      {
        header: "Actions",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex gap-2">
              <button
                className="border border-gray-400 rounded px-2 py-1 text-gray-600 cursor-pointer"
                onClick={() => navigate({ to: `/projects/${p.id}` })}
              >
                <Eye size={16} />
              </button>
              <button
                className="border border-gray-400 rounded px-2 py-1 text-gray-600 cursor-pointer"
                onClick={() => navigate({ to: `/projects/edit/${p.id}` })}
              >
                <Edit size={16} />
              </button>
              <button
                className="border border-gray-400 rounded px-2 py-1 text-gray-600 cursor-pointer"
                onClick={() => onDelete(p)}
              >
                <Trash size={16} />
              </button>
            </div>
          );
        },
      },
    ];
  }, [navigate, page, pageSize, selectedSort, onDelete]);
  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-red-500 text-center py-4">Failed to fetch projects</p>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-50 text-left text-gray-600 text-xs font-semibold">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 cursor-pointer">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200">
          {projects.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-gray-500 col-span-3 text-center py-6"
              >
                No projects found
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && (
        <div className="flex justify-between items-center p-3 text-sm text-gray-600">
          <span>
            Page {pagination.current_page} of {pagination.total_pages}
          </span>

          {/* Pagination */}
          <div className="flex items-center gap-2">
            <button
              disabled={!pagination.prev_page}
              onClick={() => setPage(pagination.prev_page)}
              className={`px-3 py-1 rounded border ${
                pagination.prev_page
                  ? "text-gray-700 bg-white hover:bg-gray-100"
                  : "text-gray-400 bg-gray-100 cursor-not-allowed"
              }`}
            >
              Prev
            </button>

            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
              .filter((p) => {
                const current = pagination.current_page;
                const total = pagination.total_pages;
                if (p === 1 || p === total) return true;
                if (p >= current - 1 && p <= current + 1) return true;
                return false;
              })
              .map((p, i, arr) => {
                const prev = arr[i - 1];
                return (
                  <React.Fragment key={p}>
                    {prev && p - prev > 1 && <span className="px-2">...</span>}
                    <button
                      onClick={() => setPage(p)}
                      className={`px-3 py-1 rounded border ${
                        p === pagination.current_page
                          ? "bg-indigo-500 text-white border-indigo-500"
                          : "text-gray-700 bg-white hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              disabled={!pagination.next_page}
              onClick={() => setPage(pagination.next_page)}
              className={`px-3 py-1 rounded border ${
                pagination.next_page
                  ? "text-gray-700 bg-white hover:bg-gray-100"
                  : "text-gray-400 bg-gray-100 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>

          <span>Total Records: {pagination.total_records}</span>
        </div>
      )}
    </div>
  );
};

export default ProjectsTable;
