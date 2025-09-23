import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Check, ChevronDown, Move, MoveLeft } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";

const Viewdetails = () => {
  const { id } = useParams({ from: "/_layout/projects/$id/" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

  // --- Queries ---
  const {
    data: projectResponse,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectByIdAPI(Number(id)),
  });

  const { data: assignedUsersData } = useQuery({
    queryKey: ["assignedUsers", id],
    queryFn: () => getAssignedUsersAPI(Number(id)),
  });

  const { data: availableUsersData } = useQuery({
    queryKey: ["availableUsers", id],
    queryFn: () => getAvailableUsersAPI(Number(id)),
  });

  const { data: status } = useQuery({
    queryKey: ["taskStatusCounts", id],
    queryFn: () => getTaskStatusCountsAPI(Number(id)),
  });

  // --- Initialize assigned users ---
  useEffect(() => {
    if (assignedUsersData?.data?.data) {
      setAssignedUsers(assignedUsersData.data.data);
    }
  }, [assignedUsersData]);

  // --- Get trigger width for popover ---
  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [triggerRef.current]);
  const patchStatusMutation = useMutation({
    mutationFn: (newStatus: string) =>
      patchProjectStatusAPI(Number(id), { project_status: newStatus }),
    onSuccess: () => {
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
      setSelectedUsers([]);
      queryClient.invalidateQueries({ queryKey: ["assignedUsers", id] });
      queryClient.invalidateQueries({ queryKey: ["availableUsers", id] });
    },
    onError: (err: any) => {
      toast.error(err?.data?.message || "Failed to assign user");
    },
  });

  // --- Handlers ---
  const handleStatusChange = (newStatus: string) => {
    patchStatusMutation.mutate(newStatus);
  };

  const handleRemoveUser = (userId: number) => {
    deleteUserMutation.mutate(userId);
  };

  const toggleUserSelect = (user: any) => {
    if (selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleAssignUsers = () => {
    selectedUsers.forEach((user) => assignUserMutation.mutate(user.id));
    setSelectedUsers([]);
    setOpen(false);
  };

  const projectdata = projectResponse?.data?.data;
  const availableUsers = availableUsersData?.data?.data || [];

  const statusColors: Record<string, string> = {
  NEW: "bg-purple-100 text-purple-600",
  IN_PROGRESS: "bg-blue-100 text-blue-600",
  REVIEW: "bg-yellow-100 text-yellow-700",
  OVERDUE: "bg-red-100 text-red-600",
  COMPLETED: "bg-green-100 text-green-600",
};

  const formatDate = (dateStr: string | null) =>
    dateStr ? new Date(dateStr).toLocaleDateString("en-CA") : "NA";

  // --- Loading state in center ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error)
    return <p className="text-center text-red-500">Error loading project</p>;
  if (!projectdata) return <p className="text-center">No project found</p>;

  // --- JSX ---
  return (
    <div className="p-4">
      {/* Status Cards */}
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

      {/* Project Info */}
      <div className="border border-gray-300 rounded-xl p-4 mb-6 bg-gray-50">
        <button
          onClick={() => window.history.back()}
          className="text-gray-600 hover:text-blue-600 cursor-pointer"
        >
          <MoveLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
            {projectdata.title?.charAt(0) || "P"}
          </div>
          <div className="flex items-center gap-[3px] text-xl font-semibold">
            <span>{projectdata.title}</span>
            <span
              className={`ml-2 text-sm px-2 py-1 rounded ${
                statusColors[projectdata.project_status] ||
                "bg-gray-200 text-gray-800"
              }`}
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
        {/* Tasks Table */}
        <div className="w-2/3">
          <TasksInProjectTable projectId={Number(id)} />
        </div>

        {/* Project Details */}
        <div className="w-1/3 border border-gray-200 rounded-3xl p-4">
          <div className="text-2xl font-bold mb-4">Details</div>

          {/* Created By */}
          <div className="flex items-center gap-3 mb-4">
            {projectdata.createdByUser?.profile_pic ? (
              <img
                src={projectdata.createdByUser.profile_pic}
                alt={projectdata.createdByUser.display_name || "User"}
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

          {/* Status Selector */}
          <div className="mb-4">
            <strong>Status:</strong>{" "}
            <select
              value={projectdata.project_status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="ml-2 border rounded p-1 cursor-pointer"
            >
              <option value="NEW">NEW</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="OVERDUE">OVERDUE</option>
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
              {assignedUsers.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between gap-2 mb-1 px-2 py-1 rounded border"
                >
                  <span>{user.display_name || "Unnamed"}</span>
                  <button
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                    onClick={() => handleRemoveUser(user.id)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            {/* Assign Users Popover */}
            <div className="flex items-center gap-2 mt-3">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <div
                    ref={triggerRef}
                    className="rounded border flex items-center justify-between px-2 py-2 cursor-pointer flex-1"
                  >
                    <span className="text-gray-500">
                      {selectedUsers.length > 0
                        ? selectedUsers
                            .map((u) => u.display_name || "Unnamed")
                            .join(", ")
                        : "Select users..."}
                    </span>
                    <ChevronDown />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  style={{ width: triggerWidth ? `${triggerWidth}px` : "auto" }}
                  className="p-0"
                >
                  <Command>
                    <CommandInput
                      placeholder="Search users..."
                      value={search}
                      onValueChange={setSearch}
                    />
                    <CommandList className="max-h-60 overflow-y-auto">
                      {availableUsers
                        .filter(
                          (u) => !assignedUsers.find((au) => au.id === u.id)
                        )
                        .filter((u) =>
                          (u.display_name || "")
                            .toLowerCase()
                            .includes(search.toLowerCase())
                        )
                        .map((user) => (
                          <CommandItem
                            key={user.id}
                            onSelect={() => toggleUserSelect(user)}
                          >
                            <span>{user.display_name || "Unnamed"}</span>
                            <Check
                              className={cn(
                                "h-4 w-4 ml-auto",
                                selectedUsers.find((u) => u.id === user.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      {availableUsers.filter(
                        (u) => !assignedUsers.find((au) => au.id === u.id)
                      ).length === 0 && (
                        <CommandEmpty>No users found</CommandEmpty>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <button
                onClick={handleAssignUsers}
                disabled={
                  selectedUsers.length === 0 || assignUserMutation.isPending
                }
                className="px-3 py-1 bg-purple-600 text-white rounded disabled:opacity-50 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {assignUserMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Add"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Viewdetails;
