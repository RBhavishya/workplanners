import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import {
  useLocation,
  useNavigate,
  useRouter,
  useSearch,
} from "@tanstack/react-router";
import { Pagination } from "../core/Pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreVertical, Filter, LayoutGrid, List } from "lucide-react";
import { ProjectData } from "@/interfaces/project";
import {
  getAllPaginatedProjects,
  getProjectByIdAPI,
} from "@/https/services/project";

import DeleteProject from "./DeleteProject";
import ProjectsTable from "./projectTable";
import { Input } from "../ui/input";
import { SearchIcon } from "../icons/SearchIcon";
import { addSerial } from "@/lib/helpers/addSerial";
import TasksPagination from "../core/TasksPagination";
import TaskSearchFilter from "../core/TasksSearchFilter";

const Projects = () => {
  const [time, setTime] = useState(new Date());
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
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
  const pageSizeParam = Number(searchParams.get("page_size")) || 10;
  const orderBY = searchParams.get("order_by") || "";
  const initialSearch = searchParams.get("search") || "";

  const [viewMode, setViewMode] = useState<"table" | "grid">(
    search?.viewMode || "grid"
  );
  const [selectedSort, setSelectedSort] = useState(orderBY);
  const [pagination, setPagination] = useState({
    pageIndex: pageIndexParam,
    pageSize: pageSizeParam,
    order_by: orderBY,
  });
  const [search_string, setSearchString] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(search_string);

  // live clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  const formattedTime = time.toLocaleTimeString("en-GB");
  const formattedDate = time.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search_string);
      if (search_string) {
        setPagination({
          ...pagination,
          pageIndex: 1,
        });
      }
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [search_string, selectedSort]);

  // ✅ update URL whenever pagination/search/sort changes
  const { isLoading, isError, error, data, isFetching } = useQuery({
    queryKey: ["projects", pagination, viewMode, debouncedSearch, selectedSort],
    queryFn: async () => {
      const response = await getAllPaginatedProjects({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        viewMode,
        search_string: debouncedSearch,
        order_by: selectedSort,
      });

      router.navigate({
        to: "/projects",
        search: {
          page: pagination.pageIndex,
          page_size: pagination.pageSize,
          viewMode: viewMode || undefined,
          order_by: selectedSort || undefined,
          search: debouncedSearch || undefined,
        },
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

  const capturePageNum = (pageIndex: number) => {
    setPagination((prev) => ({ ...prev, pageIndex }));
  };

  const captureRowPerItems = (pageSize: number) => {
    setPagination((prev) => ({ ...prev, pageIndex: 1, pageSize }));
  };

  const {
    data: selectedProjectData,
    isLoading: loadingProject,
    isError: errorProject,
    error: projectError,
  } = useQuery({
    queryKey: ["project", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return null;
      return await getProjectByIdAPI(selectedProjectId);
    },
    enabled: !!selectedProjectId,
  });

  const handleNavigation = () => navigate({ to: `/projects/add` });
  const handleView = (id: number) => navigate({ to: `/projects/${id}` });

  if (isError) {
    return (
      <p className="text-red-500">
        Error fetching projects: {error?.message || "Unknown error"}
      </p>
    );
  }

  return (
    <div className="w-full p-4">
      {/* Top Bar (Timer) */}
      <div className="flex items-center mb-6 w-full">
        <div className="h-10 w-px bg-gray-300 mx-6"></div>
        <div className="flex flex-col justify-around w-1/4">
          <span className="text-lg font-semibold">{formattedTime}</span>
          <span className="text-sm text-gray-500">{formattedDate}</span>
        </div>
      </div>
      <div className="flex items-center justify-between mb-7 px-4">
        <h2 className="font-bold text-2xl">Projects</h2>
        <div className="flex items-center gap-4">
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
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 border px-4 py-2 rounded-lg cursor-pointer">
                <Filter className="text-purple-500" size={18} />
                {selectedSort || "Sort by"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {["New", "In_Progress", "Review", "Overdue", "Done"].map(
                (option) => (
                  <DropdownMenuItem
                    key={option}
                    className="cursor-pointer"
                    onClick={() => setSelectedSort(option)}
                  >
                    {option}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg cursor-pointer ${
                viewMode === "grid" ? "bg-purple-100 text-purple-600" : ""
              }`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg cursor-pointer ${
                viewMode === "table" ? "bg-purple-100 text-purple-600" : ""
              }`}
            >
              <List size={18} />
            </button>
          </div>

          {/* New Project */}
          <button
            onClick={handleNavigation}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer"
          >
            + New Project
          </button>
        </div>
      </div>

      <hr className="mb-4" />

      {/* Projects Section */}
      <div className="flex gap-6">
        {viewMode === "grid" ? (
          <>
            {/* Grid Cards */}
            <div className="w-2/3 grid grid-cols-1 md:grid-cols-4 gap-2 relative">
              {(isLoading || isFetching) && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20 rounded-lg">
                  <div className="w-12 h-12 border-4 border-purple-500 border-dashed rounded-full animate-spin"></div>
                </div>
              )}

              {projectsData.length === 0 && !isLoading ? (
                <p className="text-gray-500 col-span-3 text-center py-6">
                  No projects available.
                </p>
              ) : (
                projectsData.map((project: ProjectData) => (
                  <Card
                    key={project.id}
                    className="w-[180px] h-[180px] shadow-lg rounded-2xl hover:shadow-xl relative flex flex-col justify-center items-center cursor-pointer"
                    onClick={() => setSelectedProjectId(project.id ?? null)}
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
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Right side - Project Details */}
            <div className="w-1/3 flex justify-center items-start ">
              {!selectedProjectId ? (
                <p className="text-gray-500 mt-10">
                  Select a project to view details
                </p>
              ) : loadingProject ? (
                <div className="flex items-center justify-center h-[400px] w-full">
                  <div className="w-12 h-12 border-4 border-purple-500 border-dashed rounded-full animate-spin"></div>
                </div>
              ) : errorProject ? (
                <p className="text-red-500 mt-10">
                  Error loading project: {projectError?.message || "Unknown"}
                </p>
              ) : (
                <div className="w-full max-w-sm mx-auto bg-white shadow-lg rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-blue-100 flex items-center justify-center">
                    <span className="text-3xl text-blue-500 font-bold">
                      {selectedProjectData?.data?.data?.title
                        ?.charAt(0)
                        .toUpperCase() || ""}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {selectedProjectData?.data?.data?.title || "Unknown"}
                  </h2>
                  <button
                    onClick={() => handleView(selectedProjectId!)}
                    className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition my-4 cursor-pointer"
                  >
                    View
                  </button>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">
                      About Project
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed max-h-60 overflow-y-auto">
                      {selectedProjectData?.data?.data?.description ||
                        "No description available."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="w-full">
            <ProjectsTable
              debouncedSearch={debouncedSearch}
              selectedSort={selectedSort}
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
      </div>

      {/* Pagination (only for grid view) */}
      {viewMode === "grid" && (
        <div className="w-full flex justify-center mt-6">
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
