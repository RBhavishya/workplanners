import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import TasksInProjectTable from "../core/Sampletable";
import { getProjectByIdAPI } from "@/https/services/project";

const Viewdetails = () => {
  const { id } = useParams({ from: "/_layout/projects/$id/" });
  const [time, setTime] = useState(new Date());
  const Navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectByIdAPI(Number(id)),
  });

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

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading project</p>;

  const projectdata = data?.data.data;
  if (!projectdata) return <p>No project found</p>;

  const handleNavigation = () => {
    Navigate({ to: `/projects/add` });
  };

  // Format date to yyyy-mm-dd
  const formatDate = (dateStr: string | null) =>
    dateStr ? new Date(dateStr).toLocaleDateString("en-CA") : "NA";

  return (
    <div className="p-4">
      {/* Clock & Date */}
      <div className="flex items-center mb-6 w-full">
        <div className="h-10 w-px bg-gray-300 mx-6"></div>
        <div className="flex flex-col justify-around w-1/4">
          <span className="text-lg font-semibold">{formattedTime}</span>
          <span className="text-sm text-gray-500">{formattedDate}</span>
        </div>
      </div>

      {/* Top Project Info Box */}
      <div className="border border-gray-300 rounded-xl p-4 mb-6 bg-gray-50">
        <div className="flex items-center gap-3 mb-2">
          {/* Logo with first char */}
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
            {projectdata.title?.charAt(0) || "P"}
          </div>
          <div className="flex items-center gap-[3px] text-xl font-semibold">
            <span>{projectdata.title}</span>
            <span className="text-sm text-gray-600">
              ({projectdata.project_status || "NA"})
            </span>
          </div>
        </div>
        {/* Description */}
        <p className="text-gray-700 mt-2">
          {projectdata.description || "No description available"}
        </p>
      </div>

      {/* Main White Container */}
      <div className="border border-gray-200 bg-white rounded-3xl shadow-lg p-6 flex gap-6 min-h-[600px]">
        {/* Table Section (2/3) */}
        <div className="w-2/3">
          <TasksInProjectTable projectId={Number(id)} />
        </div>

        {/* Details Section (1/3) */}
        <div className="w-1/3 border border-gray-200 rounded-3xl p-4">
          <div className="text-2xl font-bold mb-4">Details</div>

          {/* ✅ Created By User */}
          <div className="flex items-center gap-3 mb-4">
            {projectdata.createdByUser?.profile_pic ? (
              <img
                src={projectdata.createdByUser.profile_pic}
                alt={projectdata.createdByUser.display_name}
                className="w-10 h-10 rounded-full object-cover border"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                {projectdata.createdByUser?.display_name?.charAt(0) || "U"}
              </div>
            )}
            <div>
              <p className="font-medium">
                {projectdata.createdByUser?.display_name || "Unknown"}
              </p>
              <p className="text-xs text-gray-500">Created By</p>
            </div>
          </div>

          {/* ✅ Remaining Info */}
          <p className="mb-2">
            <strong>Updated By:</strong> {projectdata.updated_by || "NA"}
          </p>
          <p className="mb-2">
            <strong>Start Date:</strong> {formatDate(projectdata.start_date)}
          </p>
          <p className="mb-2">
            <strong>Due Date:</strong> {formatDate(projectdata.due_date)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Viewdetails;
