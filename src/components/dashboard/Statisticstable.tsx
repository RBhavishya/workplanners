import React, { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStatistics } from "@/https/services/dashboard";
import TasksPagination from "../core/TasksPagination";
import { addSerial } from "@/lib/helpers/addSerial";
import TaskSearchFilter from "../core/TasksSearchFilter";
import { SquarePen, Trash2 } from "lucide-react";

type TaskStats = {
  id: number;
  name: string;
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  serial?: number;
};

const Statisticstable = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 25,
  });
  const [searchString, setSearchString] = useState(""); // Search input
  const [debouncedSearch, setDebouncedSearch] = useState(searchString);

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "dashboard-stats",
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearch,
    ],
    queryFn: () =>
      getDashboardStatistics({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        search_string: debouncedSearch,
      }),
  });

  const statsData: TaskStats[] =
    addSerial(
      data?.data?.data?.records,
      pagination.pageIndex,
      pagination.pageSize
    ) || [];

  const columns: ColumnDef<TaskStats>[] = [
    {
      id: "sno",
      header: () => <span className="font-medium text-black">S.No</span>,
      cell: ({ row }) => <span>{row.original.serial}</span>,
      size: 80,
    },
    {
      accessorFn: (row: any) => row.display_name,
      id: "name",
      cell: (info: any) => (
        <span className="capitalize">{info.getValue() || "-"}</span>
      ),
      header: () => <span className="font-medium text-black">Name</span>,
    },
    {
      accessorFn: (row: any) => row.total_tasks,
      id: "total",
      cell: (info: any) => <span>{info.getValue() || "-"}</span>,
      header: () => <span className="font-medium text-black">Total Tasks</span>,
    },
    {
      accessorFn: (row: any) => row.completed_tasks,
      id: "completed",
      cell: (info: any) => <span>{info.getValue() || "-"}</span>,
      header: () => <span className="font-medium text-black">Completed</span>,
    },
    {
      accessorFn: (row: any) => row.in_progress_tasks,
      id: "inProgress",
      cell: (info: any) => <span>{info.getValue() || "-"}</span>,
      header: () => <span className="font-medium text-black">In Progress</span>,
    },
    {
      accessorFn: (row: any) => row.pending_tasks,
      id: "pending",
      cell: (info: any) => <span>{info.getValue() || "-"}</span>,
      header: () => <span className="font-medium text-black">Pending</span>,
    },
    {
      id: "actions",
      header: () => <span className="font-medium text-black">Actions</span>,
      cell: () => (
        <div className="flex items-center gap-3">
          <SquarePen className="w-3.5 h-3.5 cursor-pointer" strokeWidth={1.5} />
          <Trash2 className="w-3.5 h-3.5 cursor-pointer" strokeWidth={1.5} />
        </div>
      ),
    },
  ];
  const table = useReactTable({
    data: statsData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  // handlers for TasksPagination
  const capturePageNum = (pageIndex: number) => {
    setPagination((prev) => ({ ...prev, pageIndex }));
  };

  const captureRowPerItems = (pageSize: number) => {
    setPagination({ pageIndex: 1, pageSize });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchString);
      setPagination((prev) => ({ ...prev, pageIndex: 1 }));
    }, 500);

    return () => clearTimeout(handler);
  }, [searchString]);

  return (
    <div className="bg-white p-3 mt-2 rounded-sm shadow-none flex flex-col h-[calc(100vh-183px)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-normal">Statistics</h2>

        {/* Search Filter aligned to the right */}
        <TaskSearchFilter
          searchString={searchString}
          setSearchString={setSearchString}
          title="Find your Users"
        />
      </div>

      {isError ? (
        <p className="text-red-500">Error fetching statistics</p>
      ) : (
        <>
          {/* Scrollable Table Section */}
          <div className="flex-1 overflow-y-auto relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <table className="w-full text-left">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="text-neutral-400 sticky top-0 bg-white"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-2 cursor-pointer font-normal text-sm 3xl:!text-base"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 && !isLoading ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center py-4 text-gray-500"
                    >
                      No data found.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={`rounded-md shadow-none ${
                        row.index % 2 === 0 ? "bg-slate-50" : "bg-white"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-2 text-sm 3xl:!text-base"
                        >
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

          {/* Fixed Pagination Section */}
          {!isLoading && (
            <div>
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
          )}
        </>
      )}
    </div>
  );
};

export default Statisticstable;
