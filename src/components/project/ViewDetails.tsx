import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import TasksInProjectTable from "../core/Sampletable";
import {
    assignUserAPI,
    deleteAssignedUserAPI,
    getAssignedUsersAPI,
  getAvailableUsersAPI,
  getProjectByIdAPI,
  getTaskStatusCountsAPI,
  patchProjectStatusAPI,

} from "@/https/services/project";
import SmallCard from "../core/StatusCard";


const Viewdetails = () => {
  const { id } = useParams({ from: "/_layout/projects/$id/" });
  const [selectedUser, setSelectedUser] = useState<number | "">("");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch project details
  const {
    data: projectResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectByIdAPI(Number(id)),
  });

  // Fetch assigned users
  const { data: assignedUsersData } = useQuery({
    queryKey: ["assignedUsers", id],
    queryFn: () => getAssignedUsersAPI(Number(id)),
  });

  // Fetch available users
  const { data: availableUsersData } = useQuery({
    queryKey: ["availableUsers", id],
    queryFn: () => getAvailableUsersAPI(Number(id)),
  });

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    REVIEW: "bg-orange-100 text-orange-800",
    COMPLETED: "bg-green-100 text-green-800",
  };
  const { data: status } = useQuery({
    queryKey: ["taskStatusCounts", id],
    queryFn: () => getTaskStatusCountsAPI(Number(id)),
  }) as {
    data: {
      data: {
        total_count: number;
        completed_count: number;
        inProgress_count: number;
        new_count: number;
        review_count: number;
        pending_count: number;
      };
    };
  };
  // Mutations
  const patchStatusMutation = useMutation({
    mutationFn: (newStatus: string) =>
      patchProjectStatusAPI(Number(id), { project_status: newStatus }),
    onSuccess: (res: any) => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["project", id] });
    },
    onError: (err: any) => {
      toast.error(err?.data?.message || "Failed to update status");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => deleteAssignedUserAPI(Number(id), userId),
    onSuccess: () => {
      toast.success("User removed successfully");
      queryClient.invalidateQueries({ queryKey: ["assignedUsers", id] });
      queryClient.invalidateQueries({ queryKey: ["availableUsers", id] });
    },
    onError: (err: any) => {
      toast.error(err?.data?.message || "Failed to remove user");
    },
  });

  const assignUserMutation = useMutation({
    mutationFn: (userId: number) => assignUserAPI(Number(id), userId),
    onSuccess: () => {
      toast.success("User assigned successfully");
      setSelectedUser("");
      queryClient.invalidateQueries({ queryKey: ["assignedUsers", id] });
      queryClient.invalidateQueries({ queryKey: ["availableUsers", id] });
    },
    onError: (err: any) => {
      toast.error(err?.data?.message || "Failed to assign user");
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading project</p>;

  const projectdata = projectResponse?.data?.data;
  if (!projectdata) return <p>No project found</p>;

  const assignedUsers = assignedUsersData?.data?.data || [];
  const availableUsers = availableUsersData?.data?.data || [];

  // Helpers
  const formatDate = (dateStr: string | null) =>
    dateStr ? new Date(dateStr).toLocaleDateString("en-CA") : "NA";

  const handleStatusChange = (newStatus: string) => {
    patchStatusMutation.mutate(newStatus);
  };

  const handleRemoveUser = (userId: number) => {
    deleteUserMutation.mutate(userId);
  };

  const handleAssignUser = () => {
    if (selectedUser) {
      assignUserMutation.mutate(Number(selectedUser));
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center mb-6 w-full">
        <SmallCard
          cards={[
            { title: "Total Tasks", value: status?.data?.total_count },
            { title: "Completed Tasks", value: status?.data?.completed_count },
            {
              title: "In Progress Task",
              value: status?.data?.inProgress_count,
            },
            { title: "New Tasks", value: status?.data?.new_count },
            { title: "Review Tasks", value: status?.data?.review_count },
            { title: "Pending Tasks", value: status?.data?.pending_count },
          ]}
        />
      </div>

      {/* Title + Description */}
      <div className="border border-gray-300 rounded-xl p-4 mb-6 bg-gray-50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
            {projectdata.title?.charAt(0) || "P"}
          </div>
          <div className="flex items-center gap-[3px] text-xl font-semibold">
            <span>{projectdata.title}</span>
            <span
              className={`ml-2 text-sm px-2 py-1 rounded ${statusColors[projectdata.project_status] || "bg-gray-200 text-gray-800"}`}
            >
              {projectdata.project_status}
            </span>
          </div>
        </div>
        <p className="text-gray-700 mt-2">
          {projectdata.description || "No description available"}
        </p>
      </div>

      {/* Main Layout */}
      <div className="border border-gray-200 bg-white rounded-3xl shadow-lg p-6 flex gap-6 min-h-[600px]">
        {/* Left: Tasks Table */}
        <div className="w-2/3">
          <TasksInProjectTable projectId={Number(id)} />
        </div>

        {/* Right: Details */}
        <div className="w-1/3 border border-gray-200 rounded-3xl p-4">
          <div className="text-2xl font-bold mb-4">Details</div>

          {/* Created By */}
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

          {/* Status */}
          <div className="mb-4">
            <strong>Status:</strong>{" "}
            <select
              value={projectdata.project_status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="ml-2 border rounded p-1"
            >
              <option value="NEW">NEW</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="OVER_DUE">PENDING</option>
              <option value="REVIEW">REVIEW</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>

          {/* Dates */}
          <p className="mb-2">
            <strong>Start Date:</strong> {formatDate(projectdata.start_date)}
          </p>
          <p className="mb-2">
            <strong>Due Date:</strong> {formatDate(projectdata.due_date)}
          </p>

          {/* Assigned Users */}
          <div className="mt-6">
            <strong>Assigned Users:</strong>
            <ul className="mt-2">
              {assignedUsers.length === 0 && (
                <li className="text-gray-500">No users assigned.</li>
              )}
              {assignedUsers.map((user: any) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between gap-2 mb-1 px-2 py-1 rounded border"
                >
                  <span>{user.display_name}</span>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveUser(user.id)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            {/* Assign New User */}
            <div className="flex items-center gap-2 mt-3">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(Number(e.target.value))}
                className="border rounded p-1 flex-1"
              >
                <option value="">Select user...</option>
                {availableUsers.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.display_name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssignUser}
                disabled={!selectedUser}
                className="px-3 py-1 bg-purple-600 text-white rounded disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Viewdetails;