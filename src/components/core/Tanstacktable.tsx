import React, { useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import { $fetch } from "@/https/fetch";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
interface Project {
  id: number;
  title: string;
  description: string;
  logo_url: string | null;
  project_status: string;
  start_date: string;
  due_date: string | null;
}
const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "id",
    header: "S No",
  },
  {
    accessorKey: "title",
    header: "Task Name",
  },
  {
    accessorKey: "description",
    header: "Task Brief",
  },
  {
    accessorKey: "project_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("project_status");
      let bgColor = "bg-purple-200";
      let text = "New";
      if (status === "In Progress") {
        bgColor = "bg-blue-200";
        text = "In Progress";
      } else if (status === "Review") {
        bgColor = "bg-yellow-200";
        text = "Review";
      } else if (status === "Done") {
        bgColor = "bg-green-200";
        text = "Done";
      } else if (status === "Overdue") {
        bgColor = "bg-red-200";
        text = "Overdue";
      } else if (status === "COMPLETED") {
        bgColor = "bg-green-200";
        text = "Completed";
      }
      return (
        <span className={`px-2 py-1 rounded-full text-sm ${bgColor}`}>
          {text}
        </span>
      );
    },
  },
  {
    accessorKey: "due_date",
    header: "Due Date",
    cell: ({ row }) => {
      const dueDate = row.getValue("due_date");
      return dueDate
        ? new Date(dueDate?.toString()).toLocaleDateString()
        : "N/A";
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: () => (
      <div className="flex space-x-2">
        <Button variant="ghost" size="icon">
          <span className="h-4 w-4">⋮</span>
        </Button>
        <Button variant="ghost" size="icon">
          <span className="h-4 w-4">⋮</span>
        </Button>
      </div>
    ),
  },
];
const ProjectTable: React.FC = () => {
  const [data, setData] = useState<Project[]>([]);
  const [paginationDetails, setPaginationDetails] = useState({
    total_records: 0,
    total_pages: 1,
    current_page: 1,
    page_size: 6,
    next_page: null,
    prev_page: null,
  });
  const [sort, setSort] = useState<{
    column: string;
    direction: "asc" | "desc";
  } | null>({ column: "id", direction: "asc" });
  const [searchString, setSearchString] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const getAllProjectsAPI = async (params: {
    order_by?: string;
    page?: number;
    page_size?: number;
    search_string?: string;
  }) => {
    try {
      const queryParams = new URLSearchParams({
        order_by: params.order_by || "id:asc",
        page: params.page?.toString() || "1",
        page_size: params.page_size?.toString() || "6",
        search_string: params.search_string || "",
      }).toString();
      const response = await $fetch.get(`/projects?${queryParams}`);
      return response;
    } catch (error) {
      throw error;
    }
  };
  const fetchProjects = async () => {
    setIsFetching(true);
    try {
      const response = await getAllProjectsAPI({
        order_by: sort ? `${sort.column}:${sort.direction}` : "id:asc",
        page: paginationDetails.current_page,
        page_size: paginationDetails.page_size,
        search_string: searchString,
      });
      const paginationInfo = response.data.pagination_info ?? {
        total_records: paginationDetails.total_records || 0,
        total_pages: paginationDetails.total_pages || 1,
        current_page: paginationDetails || 1,
        page_size: paginationDetails.page_size,
        next_page: paginationDetails.next_page || null,
        prev_page: paginationDetails.prev_page || null,
      };
      setData(response.data?.data?.records || []);
      setPaginationDetails(paginationInfo);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setData([]);
      setPaginationDetails({
        total_records: 0,
        total_pages: 1,
        current_page: 1,
        page_size: paginationDetails.page_size,
        next_page: null,
        prev_page: null,
      });
    } finally {
      setIsFetching(false);
    }
  };
  useEffect(() => {
    fetchProjects();
  }, [
    paginationDetails.current_page,
    paginationDetails.page_size,
    sort,
    searchString,
  ]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: paginationDetails.total_pages,
    state: {
      pagination: {
        pageIndex: paginationDetails.current_page - 1,
        pageSize: paginationDetails.page_size,
      },
    },
  });
  const handlePageChange = (page: number) => {
    setPaginationDetails((prev) => ({
      ...prev,
      current_page: page,
    }));
  };
  const handlePageSizeChange = (size: number) => {
    setPaginationDetails((prev) => ({
      ...prev,
      page_size: size,
      current_page: 1,
    }));
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchString(e.target.value);
    setPaginationDetails((prev) => ({
      ...prev,
      current_page: 1,
    }));
  };
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Today’s Agenda</h2>
        <div className="flex space-x-2">
          <Input
            type="text"
            value={searchString}
            onChange={handleSearch}
            placeholder="Find your Task..."
            className="w-64"
          />
          <Button variant="outline" size="sm">
            Status
          </Button>
          <Button variant="outline" size="sm">
            Due Date
          </Button>
          <Button className="bg-purple-600 text-white">New Task</Button>
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-left">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <span>
          Showing {data.length} of {paginationDetails.total_records} records |
          Total Pages: {paginationDetails.total_pages}
        </span>
        <div className="flex space-x-2 items-center">
          <Select
            value={paginationDetails.page_size.toString()}
            onValueChange={(value) => handlePageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[6, 12, 18, 24].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                handlePageChange(paginationDetails.current_page - 1)
              }
              disabled={paginationDetails.current_page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from(
              { length: paginationDetails.total_pages },
              (_, i) => i + 1
            )
              .slice(
                Math.max(0, paginationDetails.current_page - 2),
                Math.min(
                  paginationDetails.total_pages,
                  paginationDetails.current_page + 3
                )
              )
              .map((page) => (
                <Button
                  key={page}
                  variant={
                    paginationDetails.current_page === page
                      ? "default"
                      : "outline"
                  }
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
            {paginationDetails.current_page + 3 <
              paginationDetails.total_pages && <span>...</span>}
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                handlePageChange(paginationDetails.current_page + 1)
              }
              disabled={
                paginationDetails.current_page === paginationDetails.total_pages
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProjectTable;
