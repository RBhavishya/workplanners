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
      header: () => <span>S.No</span>,
      cell: ({ row }) => <span>{row.original.serial}</span>,
      size: 80,
    },
    {
      accessorFn: (row: any) => row.display_name,
      id: "name",
      cell: (info: any) => <span>{info.getValue() || "-"}</span>,
      header: () => <span>Name</span>,
    },
    {
      accessorFn: (row: any) => row.total_tasks,
      id: "total",
      cell: (info: any) => <span>{info.getValue() || "-"}</span>,
      header: () => <span>Total Tasks</span>,
    },
    {
      accessorFn: (row: any) => row.completed_tasks,
      id: "completed",
      cell: (info: any) => <span>{info.getValue() || "-"}</span>,
      header: () => <span>Completed</span>,
    },
    {
      accessorFn: (row: any) => row.in_progress_tasks,
      id: "inProgress",
      cell: (info: any) => <span>{info.getValue() || "-"}</span>,
      header: () => <span>In Progress</span>,
    },
    {
      accessorFn: (row: any) => row.pending_tasks,
      id: "pending",
      cell: (info: any) => <span>{info.getValue() || "-"}</span>,
      header: () => <span>Pending</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: () => (
        <button className="px-4 py-1 text-sm rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200">
          View
        </button>
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
      setPagination((prev) => ({ ...prev, pageIndex: 1 })); // reset to first page on search
    }, 500);

    return () => clearTimeout(handler);
  }, [searchString]);

  return (
    <div className="bg-white p-6 mt-3 rounded-2xl shadow-md flex flex-col h-[calc(100vh-240px)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">STATISTICS</h2>

        {/* Search Filter aligned to the right */}
        <TaskSearchFilter
          searchString={searchString}
          setSearchString={setSearchString}
          title="Find your Task"
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
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="text-gray-600 sticky top-0 bg-white"
                  >
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-4 py-2 cursor-pointer">
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
                      className="bg-gray-50 hover:bg-gray-100 rounded-lg"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-3 border-b border-gray-200"
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
            <div className="border-t border-gray-200 pt-3 mt-2">
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
