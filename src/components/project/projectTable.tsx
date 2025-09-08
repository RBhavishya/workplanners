import React from "react";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Eye, Edit, Trash } from "lucide-react";
import { deleteProjectAPI, getAllProjectsWithUsersAPI } from "@/https/services/project";

const statusColors: Record<string, string> = {
  NEW: "bg-purple-100 text-purple-600",
  IN_PROGRESS: "bg-blue-100 text-blue-600",
  REVIEW: "bg-yellow-100 text-yellow-700",
  OVERDUE: "bg-red-100 text-red-600",
  COMPLETED: "bg-green-100 text-green-600",
};

const ProjectsTable: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // pagination state
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  const queryParam = `page=${page}&page_size=${pageSize}&order_by=id:asc`;

  // fetch projects
  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects-with-users", queryParam],
    queryFn: () => getAllProjectsWithUsersAPI(queryParam),
  });

  // response mapping
  const projects = data?.data?.data?.records || [];
  const pagination = data?.data?.data?.pagination_info;

  // delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProjectAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects-with-users"] });
    },
  });

  // table columns
  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
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
            return <span className="text-gray-400 text-sm">No users</span>;
          }
          return (
            <div className="flex -space-x-2">
              {users.map((u: any) => (
                <div
                  key={u.user_id}
                  className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white border-2 border-white"
                  title={u.display_name}
                >
                  {u.display_name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          );
        },
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
                className="border border-gray-400 rounded px-2 py-1 text-gray-600"
                onClick={() => navigate({ to: `/projects/view/${p.id}` })}
              >
                <Eye size={16} />
              </button>
              <button
                className="border border-gray-400 rounded px-2 py-1 text-gray-600"
                onClick={() => navigate({ to: `/projects/edit/${p.id}` })}
              >
                <Edit size={16} />
              </button>
              <button
                className="border border-gray-400 rounded px-2 py-1 text-gray-600"
                onClick={() => deleteMutation.mutate(p.id)}
              >
                <Trash size={16} />
              </button>
            </div>
          );
        },
      },
    ],
    [navigate, deleteMutation, page]
  );

  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // 🔹 Loading spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError)
    return <p className="text-red-500 text-center py-4">Failed to fetch projects</p>;

  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-50 text-left text-gray-600 text-xs font-semibold">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th key={header.id} className="px-4 py-3">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && (
        <div className="flex justify-between items-center p-3 text-sm text-gray-600">
          <span>
            Page {pagination.current_page} of {pagination.total_pages}
          </span>

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
