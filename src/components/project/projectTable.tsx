import React, { useEffect, useState } from "react";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Eye, Edit, Trash } from "lucide-react";
import { getAllUsersProjects } from "@/https/services/project";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import dayjs from "dayjs";
import { Button } from "../ui/button";
import TasksPagination from "../core/TasksPagination";
import { NoProjectIcon } from "../icons/NoIcons/NoProjectIcon";

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
  selectedStatus: string;
  setSelectedSort: (val: string) => void;
  setSelectedStatus: (val: string) => void;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (val: number) => void;
  onDelete: (project: any) => void;
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({
  debouncedSearch,
  selectedSort,
  selectedStatus,
  setSelectedSort,
  setSelectedStatus,
  page,
  pageSize,
  setPage,
  setPageSize,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);
  }, []);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: [
      "projectsTable",
      page,
      pageSize,
      debouncedSearch,
      selectedSort,
      selectedStatus,
    ],
    queryFn: () =>
      getAllUsersProjects({
        pageIndex: page,
        pageSize,
        viewMode: "table",
        order_by: selectedSort,
        project_status: selectedStatus,
        search_string: debouncedSearch,
      }),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const projects = data?.data?.data?.records || [];
  const pagination = data?.data?.data?.pagination_info;

  const handleSort = (column: string) => {
    if (selectedSort === `${column}:asc`) {
      setSelectedSort(`${column}:desc`);
    } else if (selectedSort === `${column}:desc`) {
      setSelectedSort("");
    } else {
      setSelectedSort(`${column}:asc`);
    }
  };

  const renderSortIcon = (column: string) => {
    if (selectedSort === `${column}:asc`) {
      return <img src="/table/sort-asc.svg" height={15} width={15} alt="Asc" />;
    }
    if (selectedSort === `${column}:desc`) {
      return (
        <img src="/table/sort-desc.svg" height={15} width={15} alt="Desc" />
      );
    }
    return (
      <img src="/table/sort-norm.svg" height={15} width={15} alt="No Sort" />
    );
  };

  const columns = React.useMemo<ColumnDef<any>[]>(() => {
    return [
      {
        header: "S. No",
        cell: ({ row }) => row.index + 1 + (page - 1) * pageSize,
      },
      {
        header: () => (
          <div
            className="flex items-center cursor-pointer select-none"
            onClick={() => handleSort("title")}
          >
            Project Name {renderSortIcon("title")}
          </div>
        ),
        accessorKey: "project_name",
        cell: ({ row }) => {
          const p = row.original;
          const name = p.project_name || "-";

          return (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-purple-400 flex items-center justify-center text-white font-normal shrink-0 text-sm">
                {name !== "-" ? name.charAt(0).toUpperCase() : "-"}
              </div>
              <p className="capitalize">{name}</p>
              {/* <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="font-medium truncate max-w-[160px] cursor-default"
                      title={name}
                    >
                      {name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider> */}
            </div>
          );
        },
      },
      {
        header: "Assigned Users",
        accessorKey: "users",
        cell: ({ row }) => {
          const users = row.original.users || [];
          if (users.length === 0)
            return <span className="text-black-400 text-sm">-</span>;

          const visibleUsers = users.slice(0, 3);
          const remainingUsers = users.slice(3);

          return (
            <div className="flex -space-x-2 items-center">
              {visibleUsers.map((u: any) => (
                <div
                  key={u.user_id}
                  className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-[11px] font-medium text-white border-2 border-white"
                  title={u.display_name}
                >
                  {u.display_name.charAt(0).toUpperCase()}
                </div>
              ))}

              {remainingUsers.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-xs font-medium text-white border-2 border-white cursor-pointer">
                        +{remainingUsers.length}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      className="max-h-[150px] overflow-y-auto bg-white text-gray-700 rounded-md shadow-md p-2"
                      side="top"
                    >
                      <div className="flex flex-col gap-1">
                        {remainingUsers.map((u: any) => (
                          <span key={u.user_id} className="capitalize">{u.display_name}</span>
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
        header: () => (
          <div
            className="flex items-center cursor-pointer select-none"
            onClick={() => handleSort("start_date")}
          >
            Start Date {renderSortIcon("start_date")}
          </div>
        ),
        accessorFn: (row: any) => row.project_start_date,
        id: "start_date",
        cell: (info: any) => {
          const date: string = info.getValue();
          return <span>{date ? dayjs(date).format("DD-MM-YYYY") : "-"}</span>;
        },
      },
      {
        header: () => (
          <div
            className="flex items-center cursor-pointer select-none"
            onClick={() => handleSort("due_date")}
          >
            Due Date {renderSortIcon("due_date")}
          </div>
        ),
        accessorFn: (row: any) => row.project_end_date,
        id: "due_date",
        cell: (info: any) => {
          const date: string = info.getValue();
          return <span>{date ? dayjs(date).format("DD-MM-YYYY") : "-"}</span>;
        },
      },
      {
        header: "Status",
        accessorKey: "project_status",
        cell: ({ row }) => {
          const status = row.original.project_status?.toUpperCase();
          const cls = statusColors[status] || "bg-gray-100 text-gray-600";
          return (
            <span className={`px-3 py-1 rounded-md text-xs font-medium ${cls}`}>
              {status || "Unknown"}
            </span>
          );
        },
      },
      {
        header: "Actions",
        cell: ({ row }) => {
          const p = row.original;
          if (!user) return null;

          return (
            <div className="flex gap-3">
              <Button
                title="View"
                className="p-0 text-gray-600 cursor-pointer"
                variant="ghost"
                onClick={() => navigate({ to: `/projects/${p.id}` })}
              >
                <Eye size={16} />
              </Button>
              {user?.user_type === "MANAGER" && (
                <>
                  <Button
                    title="Edit"
                    className="p-0 text-gray-600 cursor-pointer"
                    variant="ghost"
                    onClick={() => navigate({ to: `/projects/edit/${p.id}` })}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    title="Delete"
                    className="p-0 text-gray-600 cursor-pointer"
                    variant="ghost"
                    onClick={() => onDelete(p)}
                  >
                    <Trash size={16} />
                  </Button>
                </>
              )}
            </div>
          );
        },
      },
    ];
  }, [navigate, page, pageSize, selectedSort, onDelete, user]);

  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isError) {
    return (
      <p className="text-red-500 text-center py-4">Failed to fetch projects</p>
    );
  }

  return (
    <div className="border-none rounded-xl overflow-hidden h-[calc(100vh-120px)] flex flex-col bg-white">
      <div className="overflow-auto flex-1">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50 sticky top-0 text-left text-neutral-400">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 font-medium text-sm 3xl:!text-base">
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
            {isLoading || isFetching ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-6 text-gray-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading projects...</span>
                  </div>
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-gray-500 text-center py-6"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                      <NoProjectIcon />
                      <p className="text-base 3xl:!text-lg text-[#828282] font-normal">
                        No Project found
                      </p>
                    </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`${row.index % 2 === 0 ? "bg-slate-100" : "bg-white"} hover:bg-gray-50 border-none`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="!h-10 px-3 text-sm 3xl:!text-base">
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
      <div className="w-full flex justify-center bg-white mt-2">
        <TasksPagination
          paginationDetails={
            pagination || {
              total_records: 0,
              total_pages: 1,
              current_page: page,
              page_size: pageSize,
              next_page: null,
              prev_page: null,
            }
          }
          capturePageNum={setPage}
          captureRowPerItems={setPageSize}
        />
      </div>
    </div>
  );
};

export default ProjectsTable;
