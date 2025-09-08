import React, { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

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
    accessorKey: "id",
    header: "S.No",
    cell: ({ row }) => <span>{String(row.index + 1).padStart(2, "0")}</span>,
  },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "total", header: "Total Tasks" },
  { accessorKey: "completed", header: "Completed" },
  { accessorKey: "inProgress", header: "In Progress" },
  { accessorKey: "pending", header: "Pending" },
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
  const [data, setData] = useState<TaskStats[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // dummy data
  const fetchData = async () => {
    // sample 25 rows
    const dummy: TaskStats[] = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      total: 10 + (i % 5),
      completed: 5 + (i % 3),
      inProgress: 2 + (i % 2),
      pending: 3 + (i % 4),
    }));

    setTotalRecords(dummy.length);
    setTotalPages(Math.ceil(dummy.length / pageSize));
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setData(dummy.slice(start, end));
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  // Pagination with ellipsis
  const renderPaginationButtons = () => {
    const buttons: React.ReactElement[] = [];

    const maxVisible = 3;

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

  const startIndex = data.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = data.length === 0 ? 0 : startIndex + data.length - 1;

  return (
    <div className="bg-white p-6 mt-6 rounded-2xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">STATISTICS</h2>

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

      {/* Pagination Controls */}
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
          {[5, 10, 15, 20].map((size) => (
            <option key={size} value={size}>
              {size}/page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
export default Statisticstable;
