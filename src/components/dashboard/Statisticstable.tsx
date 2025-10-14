import { getDashboardStatistics } from "@/https/services/dashboard";
import { addSerial } from "@/lib/helpers/addSerial";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import SearchFilter from "../core/SearchFilter";
import TasksPagination from "../core/TasksPagination";
import { NoDataIcon } from "../icons/NoIcons/NoDataIcon";
import Loading from "../core/Loading";

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
  const [searchString, setSearchString] = useState("");
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
    refetchOnWindowFocus: false,
    retry: false,
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
      cell: (info: any) => (
        <span className="capitalize">{info.getValue() || "-"}</span>
      ),
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
      header: () => <span>Overdue</span>,
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
    <div className="bg-white p-3 mt-1 rounded-sm shadow-none flex flex-col h-[calc(100vh-170px)]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg 3xl:!text-xl font-normal">Statistics</h2>

        {/* Search Filter aligned to the right */}
        <SearchFilter
          searchString={searchString}
          setSearchString={setSearchString}
          title="Find your Users"
        />
      </div>

      {/* isError ? ( */}
        {/* <p className="text-red-500">Error fetching statistics</p> */}
      {/* ) : ( */}
        <>
          {/* Scrollable Table Section */}
          <div className="flex-1 overflow-y-auto relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
               <Loading loading={isLoading} />
              </div>
            )}
            <table className="w-full text-left">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="text-neutral-500 sticky top-0 bg-white"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-2 cursor-pointer font-medium text-sm 3xl:!text-base"
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
                  <td colSpan={columns.length} className="text-center py-15">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <NoDataIcon />
                      <p className="text-base 3xl:!text-lg text-[#828282] font-normal">
                        No Data found
                      </p>
                    </div>
                  </td>
                </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={`rounded-md shadow-none ${
                        row.index % 2 === 0 ? "bg-slate-100" : "bg-white"
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
    </div>
  );
};

export default Statisticstable;
