import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import {
  useNavigate,
  useRouter,
  useLocation,
  useSearch,
} from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreVertical, Filter, LayoutGrid, List, X } from "lucide-react";
import { ProjectData } from "@/interfaces/project";
import { getAllPaginatedProjects } from "@/https/services/project";
import DeleteProject from "./DeleteProject";
import ProjectsTable from "./projectTable";
import { Input } from "../ui/input";
import { SearchIcon } from "../icons/SearchIcon";
import { addSerial } from "@/lib/helpers/addSerial";
import TasksPagination from "../core/TasksPagination";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";

const Projects = () => {
  const [deleteTarget, setDeleteTarget] = useState<ProjectData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const navigate = useNavigate();
  const router = useRouter();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const search = useSearch({ strict: false }) as {
    viewMode?: "table" | "grid";
  };
  const pageIndexParam = Number(searchParams.get("page")) || 1;
  const pageSizeParam = Number(searchParams.get("page_size")) || 25;
  const initialStatus = searchParams.get("project_status") || "";
  const initialSearch = searchParams.get("search") || "";
  const orderBY = searchParams.get("order_by") || "";
  const [viewMode, setViewMode] = useState<"grid" | "table">(
    search?.viewMode || "grid"
  );
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState(orderBY);
  const [pagination, setPagination] = useState({
    pageIndex: pageIndexParam,
    pageSize: pageSizeParam,
    order_by: orderBY,
  });
  const [search_string, setSearchString] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(search_string);

  const statusColors: Record<string, string> = {
    NEW: "bg-purple-100 text-purple-600",
    IN_PROGRESS: "bg-blue-100 text-blue-600",
    REVIEW: "bg-yellow-100 text-yellow-700",
    OVERDUE: "bg-red-100 text-red-600",
    COMPLETED: "bg-green-100 text-green-600",
  };

  const { isLoading, isError, error, data, isFetching } = useQuery({
    queryKey: [
      "projects",
      pagination,
      viewMode,
      debouncedSearch,
      selectedStatus,
      selectedSort,
    ],
    queryFn: async () => {
      const response = await getAllPaginatedProjects({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        viewMode,
        search_string: debouncedSearch,
        order_by: selectedSort,
        project_status: selectedStatus,
      });
      return response;
    },
  });

  const projectsData =
    addSerial(
      data?.data?.data?.records,
      data?.data?.data?.pagination_info?.current_page,
      data?.data?.data?.pagination_info?.page_size
    ) || [];

  const capturePageNum = (pageIndex: number) =>
    setPagination((prev) => ({ ...prev, pageIndex }));
  const captureRowPerItems = (pageSize: number) =>
    setPagination((prev) => ({ ...prev, pageIndex: 1, pageSize }));

  const handleNavigation = () => navigate({ to: `/projects/add` });
  const handleView = (id: number) => navigate({ to: `/projects/${id}` });

  if (isError) {
    return (
      <p className="text-red-500 p-4">
        Error fetching projects: {error?.message || "Unknown error"}
      </p>
    );
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search_string);
      if (search_string) {
        setPagination((prev) => ({ ...prev, pageIndex: 1 }));
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [search_string, selectedStatus]);

  useEffect(() => {
    router.navigate({
      to: "/projects",
      search: {
        page: pagination.pageIndex,
        page_size: pagination.pageSize,
        viewMode: viewMode || undefined,
        order_by: selectedSort || undefined,
        project_status: selectedStatus || undefined,
        search: debouncedSearch || undefined,
      },
    });
  }, [pagination, viewMode, selectedSort, selectedStatus, debouncedSearch]);

  return (
    <div className="relative overflow-x-auto border rounded-xl p-4 h-[calc(100vh-110px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <h2 className="font-bold text-2xl">Projects</h2>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative w-64 h-10 border border-[#D1D1D1] bg-[#F6F6F6] rounded-sm shadow-none flex items-center px-2">
            <Input
              type="search"
              value={search_string}
              onChange={(e) => setSearchString(e.target.value)}
              placeholder="Search by Title"
              className="pl-3 pr-8 h-full w-full border-none rounded text-black font-normal text-sm 3xl:!text-base shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0 placeholder:text-sm"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <SearchIcon className="w-5 h-5 text-gray-500" />
            </span>
          </div>

          {/* Status Filter */}
          <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 border px-2 py-1 rounded-md cursor-pointer text-sm h-8">
                <div className="flex items-center gap-2">
                  <Filter className="text-purple-500" size={16} />
                  <span>{selectedStatus || "Sort by"}</span>
                </div>

                {selectedStatus && (
                  <X
                    size={16}
                    className="text-gray-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation(); 
                      setSelectedStatus("");
                    }}
                  />
                )}
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-48 p-0 border rounded-md shadow-md">
              <div className="flex flex-col">
                {["New", "In_Progress", "Review", "Overdue", "Completed"].map(
                  (option) => (
                    <div
                      key={option}
                      className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setSelectedStatus(option);
                        setStatusPopoverOpen(false);
                      }}
                    >
                      {option}
                    </div>
                  )
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg cursor-pointer ${viewMode === "grid" ? "bg-purple-100 text-purple-600" : ""}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg cursor-pointer ${viewMode === "table" ? "bg-purple-100 text-purple-600" : ""}`}
            >
              <List size={18} />
            </button>
          </div>

          {/* New Project */}
          <Button
            onClick={handleNavigation}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer"
          >
            + New Project
          </Button>
        </div>
      </div>

      <hr className="mb-4" />

      {/* Projects Section */}
      {viewMode === "grid" ? (
        <div className="relative flex-1 h-[calc(100vh-200px)] overflow-y-auto">
          {/* Loading Spinner */}
          {(isLoading || isFetching) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Grid Cards */}
          {projectsData.length === 0 && !isLoading ? (
            <p className="text-gray-500 text-center py-6">
              No projects available.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 h-[calc(100vh-290px)] overflow-y-auto lg:grid-cols-4 gap-4">
              {projectsData.map((project: ProjectData) => (
                <Card
                  key={project.id}
                  className="w-full h-52 shadow-lg rounded-2xl hover:shadow-xl relative flex flex-col justify-center items-center cursor-pointer"
                  onClick={() => navigate({ to: `/projects/${project.id}` })}
                >
                  {/* Menu */}
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded-full hover:bg-gray-100 cursor-pointer">
                          <MoreVertical size={18} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                        className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate({ to: `/projects/edit/${project.id}` });
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                        className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(project);
                            setShowDeleteDialog(true);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Card Content */}
                  <CardContent className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-white font-bold text-xl mb-4">
                      {project.title?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <h2 className="text-lg font-semibold break-words text-center px-2">
                      {project.title || "Untitled"}
                    </h2>
                    <span
                      className={`mt-2 text-xs px-3 py-1 rounded-full font-medium ${
                        statusColors[
                          project.project_status?.toUpperCase() || ""
                        ] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {project.project_status || "Unknown"}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="w-full flex justify-center mt-4">
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
        </div>
      ) : (
        <div className="w-full">
          <ProjectsTable
            debouncedSearch={debouncedSearch}
            selectedSort={selectedSort}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            setSelectedSort={setSelectedSort}
            page={pagination.pageIndex}
            pageSize={pagination.pageSize}
            setPage={capturePageNum}
            setPageSize={captureRowPerItems}
            onDelete={(project) => {
              setDeleteTarget(project);
              setShowDeleteDialog(true);
            }}
          />
        </div>
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && deleteTarget && (
        <DeleteProject
          data={deleteTarget}
          onClose={() => {
            setShowDeleteDialog(false);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
};

export default Projects;
