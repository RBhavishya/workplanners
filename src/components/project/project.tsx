import { Card, CardContent } from "@/components/ui/card";
import { ProjectData } from "@/interfaces/project";
import { addSerial } from "@/lib/helpers/addSerial";
import { useQuery } from "@tanstack/react-query";
import {
  useLocation,
  useNavigate,
  useRouter,
  useSearch,
} from "@tanstack/react-router";
import { Filter, LayoutGrid, List, MoreVertical, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import SearchFilter from "../core/SearchFilter";
import TasksPagination from "../core/TasksPagination";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import DeleteProject from "./DeleteProject";
import { NoProjectIcon } from "../icons/NoIcons/NoProjectIcon";
import TanStackTable from "../core/Tanstacktable";
import { getProjectColumns } from "./projectColumns";
import { getAllUsersProjects } from "@/https/services/project";

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
  const [searchString, setSearchString] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(searchString);

  const statusColors: Record<string, string> = {
    NEW: "bg-purple-100 text-purple-600",
    IN_PROGRESS: "bg-blue-100 text-blue-600",
    REVIEW: "bg-yellow-100 text-yellow-700",
    OVERDUE: "bg-red-100 text-red-600",
    COMPLETED: "bg-green-100 text-green-600",
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
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
      const response = await getAllUsersProjects({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        viewMode,
        search_string: debouncedSearch,
        order_by: selectedSort,
        project_status: selectedStatus,
      });
      return response;
    },
    retry: false,
    refetchOnWindowFocus: false,
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

  const getData = (params: any) => {
    setPagination({
      pageIndex: params.pageIndex || 1,
      pageSize: params.pageSize || 25,
      order_by: params.order_by || "",
    });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchString);
      if (searchString === "") {
        setPagination((prev) => ({ ...prev, pageIndex: 1 }));
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchString, selectedStatus]);

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
    <div className="relative overflow-x-auto rounded-xl p-2 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-medium text-xl 3xl:!text-2xl">Projects</h2>

        <div className="flex items-center gap-3 flex-wrap">
          <SearchFilter
            searchString={searchString}
            setSearchString={setSearchString}
            title="Search by Title"
          />

          {/* Status Filter */}
          <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 border border-neutral-300 bg-white px-2 py-1 rounded-sm cursor-pointer text-sm h-7">
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
          <div className="flex items-center bg-white p-0 border border-neutral-300 rounded-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`cursor-pointer rounded-l p-1 ${viewMode === "grid" ? "text-white bg-violet-600" : ""}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`cursor-pointer rounded-r p-1 ${viewMode === "table" ? "text-white bg-violet-600" : ""}`}
            >
              <List size={18} />
            </button>
          </div>

          {/* New Project */}
          {user?.user_type !== "EMPLOYEE" && (
            <Button
              onClick={handleNavigation}
              className="px-2 py-0 h-7 bg-violet-600 hover:bg-violet-700 text-white rounded-sm cursor-pointer font-light"
            >
              <Plus /> New Project
            </Button>
          )}
        </div>
      </div>

      {/* Projects Section */}
      {viewMode === "grid" ? (
        <div className="relative flex-1 h-[calc(100vh-120px)] overflow-y-auto">
          {(isLoading || isFetching) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
              <img
                src="/6-dots-scale.svg"
                alt="loader"
                width={60}
                height={60}
              />
            </div>
          )}

          {/* Grid Cards */}
          {projectsData.length === 0 && !isLoading ? (
             <div className="flex flex-col items-center justify-center gap-2 bg-white h-[calc(100vh-165px)]">
             <NoProjectIcon />
             <p className="text-base 3xl:!text-lg text-[#828282] font-normal">
               No Project found
             </p>
           </div>
          ) : (
            <div className="h-[calc(100vh-165px)] overflow-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {projectsData?.map((project: ProjectData) => (
                  <Card
                    key={project.id}
                    className="w-full shadow-lg rounded-2xl hover:shadow-xl relative flex flex-col cursor-pointer pb-5 pt-3"
                    onClick={() => navigate({ to: `/projects/${project.id}` })}
                  >
                    {/* Card Content */}
                    <CardContent className="flex flex-col px-4 gap-3">
                      <div className="flex gap-1 items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded bg-purple-500 flex items-center justify-center text-white text-lg font-normal">
                            {project.project_name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <h2 className="text-sm 3xl:!text-base font-medium break-words px-2 capitalize">
                            {project.project_name || "Untitled"}
                          </h2>
                        </div>
                        {user?.user_type !== "EMPLOYEE" && (
                          <div>
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
                                    navigate({
                                      to: `/projects/edit/${project.id}`,
                                    });
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
                        )}
                      </div>
                      <span
                        className={`mt-2 text-xs 3xl:!text-sm px-3 py-1 rounded-md font-medium w-fit ${
                          statusColors[
                            project.project_status?.toUpperCase() || ""
                          ] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {project.project_status || ""}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="w-full flex justify-center bg-white mt-2">
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
          <TanStackTable
              data={projectsData}
              columns={getProjectColumns(navigate, user, (project: ProjectData) => {
                setDeleteTarget(project);
                setShowDeleteDialog(true);
              })}
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
              getData={getData}
              loading={isLoading}
              removeSortingForColumnIds={[
                "serial",
                "actions",
              ]}
              height='calc(100vh - 120px)'
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
