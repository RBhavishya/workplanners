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
import DeleteProject from "./DeleteProject";
import { NoProjectIcon } from "../icons/NoIcons/NoProjectIcon";
import TanStackTable from "../core/Tanstacktable";
import { getProjectColumns } from "./projectColumns";
import { getAllUsersProjects } from "@/https/services/project";
import { TruncatedText } from "../core/TruncatedText";
import { SelectStatus } from "../core/SelectStatus";
import { statusColors } from "@/lib/helpers/statusColors";
import { useDebounce } from "@/lib/helpers/useDebounce";

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
  const orderBY = searchParams.get("order_by")
    ? searchParams.get("order_by")
    : "";
  const [viewMode, setViewMode] = useState<"grid" | "table">(
    search?.viewMode || "grid"
  );
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("project_status") || '');
  const [pagination, setPagination] = useState({
    pageIndex: pageIndexParam,
    pageSize: pageSizeParam,
    order_by: orderBY,
  });
  const [searchString, setSearchString] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(searchString, 500);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { isLoading, isError, error, data, isFetching } = useQuery({
    queryKey: [
      "projects",
      pagination,
      viewMode,
      debouncedSearch,
      selectedStatus,
    ],
    queryFn: async () => {
      const response = await getAllUsersProjects({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        viewMode,
        search_string: debouncedSearch,
        order_by: pagination.order_by,
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


    const getAllProjects = async ({ pageIndex, pageSize, order_by }: any) => {
    setPagination({ pageIndex, pageSize, order_by });
  };

  const handleNavigation = () => navigate({ to: `/projects/add` });

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    if (newStatus !== "") {
      setSelectedStatus(newStatus);
    }
  }

  useEffect(() => {
    router.navigate({
      to: "/projects",
      search: {
         page: Number(pagination.pageIndex),
        page_size: Number(pagination.pageSize),
        viewMode: viewMode || undefined,
        order_by: pagination.order_by || undefined,
        project_status: selectedStatus || undefined,
        search: debouncedSearch || undefined,
      },
    });
  }, [pagination, viewMode, selectedStatus, debouncedSearch]);

  return (
    <div className="relative overflow-x-auto rounded-xl p-2 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <h2 className="font-medium text-xl 3xl:!text-2xl">Projects</h2>

        <div className="flex items-center gap-3">
          <SearchFilter
            searchString={searchString}
            setSearchString={setSearchString}
            title="Search by Title"
          />
          <SelectStatus selectedStatus={selectedStatus} handleStatusChange={handleStatusChange} />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
                            {project.project_name?.charAt(0).toUpperCase() ||
                              "?"}
                          </div>
                          <h2 className="text-sm 3xl:!text-base font-medium px-2 capitalize">
                            <TruncatedText text={project.project_name || "-"} />
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
                        {project.project_status === "IN_PROGRESS"
                          ? "In Progress"
                          : project.project_status?.charAt(0).toUpperCase() +
                            (project.project_status as string)?.slice(1).toLowerCase() || '-'}
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
            columns={getProjectColumns(
              navigate,
              user,
              (project: ProjectData) => {
                setDeleteTarget(project);
                setShowDeleteDialog(true);
              }
            )}
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
            getData={getAllProjects}
            loading={isLoading}
            removeSortingForColumnIds={["serial", "actions"]}
            height="calc(100vh - 155px)"
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
