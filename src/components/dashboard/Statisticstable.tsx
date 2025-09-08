import React, { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStatistics } from "@/https/services/dashboard";


type TaskStats = {
  id: number;
  name: string;
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
};

const columns: ColumnDef<TaskStats>[] = [
 {
  id: "sno",
  header: () => <span>S.No</span>,
  cell: ({ row }) => {
    // row.index starts from 0, so add 1
    return <span>{row.index + 1}</span>;
  },
  size: 80,
  minSize: 80,
  maxSize: 80,
},
  
  {
    accessorFn: (row: any) => row.display_name,
    id: "name",
    cell: (info: any) => {
      let title = info.getValue();
      return <span>{title ? title : "-"}</span>;
    },
    size: 200,    
    minSize: 200,
    maxSize: 200,
    header: () => <span>Name</span>,
    footer: (props: any) => props.column.id,
  },
   {
    accessorFn: (row: any) => row.total_tasks,
    id: "total",
    cell: (info: any) => {
      let title = info.getValue();
      return <span>{title ? title : "-"}</span>;
    },
    size: 200,    
    minSize: 200,
    maxSize: 200,
    header: () => <span>Total Tasks</span>,
    footer: (props: any) => props.column.id,
  },
  {
    accessorFn: (row: any) => row.completed_tasks,
    id: "completed",
    cell: (info: any) => {
      let title = info.getValue();
      return <span>{title ? title : "-"}</span>;
    },
    size: 200,    
    minSize: 200,
    maxSize: 200,
    header: () => <span>Completed</span>,
    footer: (props: any) => props.column.id,
  },
  {
    accessorFn: (row: any) => row.in_progress_tasks,
    id: "inProgress",
    cell: (info: any) => {
      let title = info.getValue();
      return <span>{title ? title : "-"}</span>;
    },
    size: 200,    
    minSize: 200,
    maxSize: 200,
    header: () => <span>In Progress</span>,
    footer: (props: any) => props.column.id,
  },
  {
    accessorFn: (row: any) => row.pending_tasks,
    id: "pending",
    cell: (info: any) => {
      let title = info.getValue();
      return <span>{title ? title : "-"}</span>;
    },
    size: 200,    
    minSize: 200,
    maxSize: 200,
    header: () => <span>Pending</span>,
    footer: (props: any) => props.column.id,
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

const Statisticstable = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-stats", page, pageSize],
    queryFn: () => getDashboardStatistics({ pageIndex: page, pageSize }),
   

  });

 const statsData: TaskStats[] = data?.data?.data?.records ?? [0];
  const totalRecords: number = data?.data?.pagination_info?.total_records ?? 0;
  const totalPages: number = data?.data?.pagination_info?.total_pages ?? 1;
  const table = useReactTable({
    data: statsData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  // Pagination with ellipsis
  const renderPaginationButtons = () => {
    const buttons: React.ReactElement[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        buttons.push(
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`px-3 py-1 border rounded ${
              i === page ? "bg-purple-500 text-white" : "bg-gray-100"
            }`}
          >
            {i}
          </button>
        );
      } else if (
        (i === 2 && page > 3) ||
        (i === totalPages - 1 && page < totalPages - 2)
      ) {
        buttons.push(
          <span key={`dots-${i}`} className="px-2">
            ...
          </span>
        );
      }
    }

    return buttons;
  };

  const startIndex =
    statsData.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex =
    statsData.length === 0 ? 0 : startIndex + statsData.length - 1;

  return (
    <div className="bg-white p-6 mt-6 rounded-2xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">STATISTICS</h2>

     {isLoading ? (
  <table className="w-full text-left border-separate border-spacing-y-2">
    <tbody>
      <tr>
        <td colSpan={columns.length} className="text-center py-10">
          <div className="flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
) : isError ? (
  <p className="text-red-500">Error fetching statistics</p>
) : (
  <>
    {/* ✅ Existing Table Render */}
    <table className="w-full text-left border-separate border-spacing-y-2">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="text-gray-600">
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
        {table.getRowModel().rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="text-center py-4">
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
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>

    {/* Pagination */}
    <div className="flex justify-between items-center mt-4">
      <div className="text-sm text-gray-600">
        {`${startIndex} - ${endIndex} of ${totalRecords}`}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        {renderPaginationButtons()}
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <select
        value={pageSize}
        onChange={(e) => {
          setPageSize(Number(e.target.value));
          setPage(1);
        }}
        className="border px-2 py-1 rounded"
      >
        {[10, 25, 50].map((size) => (
          <option key={size} value={size}>
            {size}/page
          </option>
        ))}
      </select>
    </div>
  </>
)}
    </div>
  );
};

export default Statisticstable;

