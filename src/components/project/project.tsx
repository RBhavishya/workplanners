import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Pagination } from "../core/Pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreVertical, Filter, LayoutGrid, List } from "lucide-react";
import { ProjectData } from "@/interfaces/project";
import { getAllProjectsAPI, getProjectByIdAPI } from "@/https/services/project";
import ProjectsTable from "./projectTable";
import DeleteProject from "./DeleteProject";

const Projects = () => {
  const [time, setTime] = useState(new Date());
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("New");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<ProjectData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [showDetails, setShowDetails] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  //  Fetch all projects
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["projects", page, pageSize, search, sortBy],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (page) queryParams.append("page", page.toString());
      if (pageSize) queryParams.append("page_size", pageSize.toString());
      if (search) queryParams.append("search_string", search);
      if (sortBy) queryParams.append("sort_by", sortBy.toLowerCase());

      const result = await getAllProjectsAPI(queryParams.toString());
      return result;
    },
    retry: 3,
    refetchOnMount: true,
  });

  //  Fetch single project
  const {
    data: selectedProjectData,
    isLoading: loadingProject,
    isError: errorProject,
    error: projectError,
  } = useQuery({
    queryKey: ["project", selectedProjectId],
    queryFn: async () => {
      const result = await getProjectByIdAPI(selectedProjectId!);
      return result;
    },
    enabled: !!selectedProjectId,
  });

  const existingProjects: ProjectData[] =
    data?.data?.data?.records && Array.isArray(data.data.data.records)
      ? data.data.data.records
      : [];

  const paginationDetails = {
    total_records: data?.data?.data?.pagination_info?.total_records || 0,
    total_pages: data?.data?.data?.pagination_info?.total_pages || 1,
    current_page: data?.data?.data?.pagination_info?.current_page || 1,
    page_size: data?.data?.data?.pagination_info?.page_size || 25,
    next_page: data?.data?.data?.pagination_info?.next_page || null,
    prev_page: data?.data?.data?.pagination_info?.prev_page || null,
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    console.error("Query Error:", error);
    return (
      <p className="text-red-500">
        Error fetching projects: {error?.message || "Unknown error"}
      </p>
    );
  }

  const handleNavigation = () => navigate({ to: `/projects/add` });
  const handleView = (id: number) => navigate({ to: `/projects/${id}` });

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

      <div className="w-full h-7 border-t border-gray-200"></div>

      {/* Title & Controls */}
      <div className="flex items-center justify-between mb-7 px-4">
        <h2 className="font-bold text-2xl">Projects</h2>
        <div className="flex items-center gap-3 flex-1 justify-end">
          {/* Search */}
          <input
            type="text"
            placeholder="Search project..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border px-3 py-2 rounded-lg w-1/4"
          />

          {/* Sort By Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 border px-4 py-2 rounded-lg">
                <Filter className="text-purple-500" size={18} />
                Sort by
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {["New", "In Progress", "Review", "Overdue", "Done"].map(
                (option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => setSortBy(option)}
                  >
                    {option}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Toggle */}
          <div className="flex items-center gap-2 px-1 py-1">
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
              className={`p-2 rounded-lg  cursor-pointer${
                viewMode === "table" ? "bg-purple-100 text-purple-600" : ""
              }`}
            >
              <List size={18} />
            </button>
          </div>

          {/* New Project Button */}
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
      <div className="flex gap-6 pb-24">
        {viewMode === "grid" ? (
          <>
            {/* Left side - Project Cards */}
            <div className="w-2/3 grid grid-cols-1 md:grid-cols-4 gap-2">
              {existingProjects.length === 0 ? (
                <p className="text-gray-500 col-span-3 text-center py-6">
                  No projects available.
                </p>
              ) : (
                existingProjects.map((project: ProjectData) => (
                  <Card
                    key={project.id}
                    className="w-[180px] h-[180px] shadow-lg rounded-2xl hover:shadow-xl relative flex flex-col justify-center items-center cursor-pointer"
                    onClick={() => {
                      setSelectedProjectId(project.id ?? null);
                      setShowDetails(false);
                    }}
                  >
                    {/* 3-dots menu */}
                    <div className="absolute top-3 right-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded-full hover:bg-gray-100 cursor-pointer">
                            <MoreVertical size={18} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate({ to: `/projects/edit/${project.id}` });
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation(); // prevent card click
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

            <div className="w-1/3 flex justify-center items-start">
              {!selectedProjectId ? (
                <p className="text-gray-500 mt-10">
                  Select a project to view details
                </p>
              ) : loadingProject ? (
                <p className="mt-10">Loading project details...</p>
              ) : errorProject ? (
                <p className="text-red-500 mt-10">
                  Error loading project:{" "}
                  {projectError?.message || "Unknown error"}
                </p>
              ) : (
                <div className="w-full max-w-sm mx-auto bg-white shadow-lg rounded-2xl p-6 text-center">
                  {/* Project Logo / Icon */}
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-blue-100 flex items-center justify-center">
                    <span className="text-3xl text-blue-500 font-bold">
                      {selectedProjectData?.data?.data?.title
                        ?.charAt(0)
                        .toUpperCase() || ""}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-semibold text-gray-800 break-words">
                    {selectedProjectData?.data?.data?.title || "Unknown"}
                  </h2>

                  {/* View Button */}
                  <button
                    onClick={() => handleView(selectedProjectId!)}
                    className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition my-4 cursor-pointer"
                  >
                    View
                  </button>

                  {/* About Project */}
                  <div className="text-left">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">
                      About Project
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed break-words whitespace-pre-wrap max-h-60 overflow-y-auto">
                      {selectedProjectData?.data?.data?.description ||
                        "No description available."}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {/* Pagination */}
            <div
              className="pb-4 px-4 cursor-pointer"
              style={{
                position: "fixed",
                bottom: 0,
                overflow: "hidden",
              }}
            >
              <Pagination
                paginationDetails={paginationDetails}
                pageSize={pageSize}
                setPage={setPage}
                setPageSize={setPageSize}
              />
            </div>
          </>
        ) : (
          <div className="w-full">
            <ProjectsTable/>
          </div>
        )}
      </div>
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
