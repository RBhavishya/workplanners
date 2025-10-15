import { useParams } from "@tanstack/react-router";
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
import { ArrowLeft, Check, ChevronDown, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import Loading from "../core/Loading";

const statuses = [
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "REVIEW", label: "Review" },
];

const Viewdetails = () => {
  const { id } = useParams({ from: "/_layout/projects/$id/" });
  const queryClient = useQueryClient();
  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

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
        <img src="/6-dots-scale.svg" alt="loader" width={60} height={60} />
      </div>
    );
  }

  if (error)
    return <p className="text-center text-red-500">Error loading project</p>;
  if (!projectdata) return <p className="text-center">No project found</p>;

  return (
    <div className="flex">
      <div className="flex flex-col m-2 gap-3">
        <div className="rounded-md p-3 bg-gray-50 shadow-[0_0_5px_0_rgba(0,0,0,0.2)]">
          <div className="flex items-start gap-3">
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-blue-600 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 flex items-center justify-center rounded-sm bg-blue-600 text-white text-lg font-medium capitalize">
              {projectdata.title?.charAt(0) || "P"}
            </div>
            <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-lg 3xl:!text-xl font-medium">
              <span className="capitalize">{projectdata.title}</span>
              <span
                className={`ml-2 text-sm px-2 py-1 rounded ${
                  statusColors[projectdata.project_status] ||
                  "bg-gray-200 text-gray-800"
                }`}
              >
                {projectdata.project_status}
              </span>
            </div>
          <p className="text-gray-700 text-sm 3xl:!text-base">
            {projectdata.description || "No description available"}
          </p>
          </div>
        </div>
      </div>

        <div className="flex flex-col bg-white">
          <p className="text-base 3xl:!text-lg font-medium px-2 pt-1">Tasks</p>
          <div className="flex items-center w-full p-2 rounded-sm">
            <SmallCard
              cards={[
                { title: "Total", value: status?.data?.total_count },
                { title: "New", value: status?.data?.new_count },
                {
                  title: "In Progress",
                  value: status?.data?.inProgress_count,
                },
                {
                  title: "Completed",
                  value: status?.data?.completed_count,
                },
                { title: "Review", value: status?.data?.review_count },
                { title: "Overdue", value: status?.data?.pending_count },
              ]}
            />
          </div>
        </div>

        {/* Tasks Table */}
        <div className="w-full">
          <TasksInProjectTable projectId={Number(id)} />
        </div>
      </div>

      {/* Project Details */}
      <div className="w-90 border-l border-gray-200 p-3 bg-white">
        <div className="text-xl font-medium mb-4">Project Details</div>
        <div className="flex flex-col gap-3">
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
          <div className="flex items-center">
            <p className="text-base 3xl:!text-lg">Status:</p>{" "}
            <Select
              value={projectdata.project_status}
              onValueChange={(value) => handleStatusChange(value)}
              disabled={loggedInUser.user_type === "EMPLOYEE"}
            >
              <SelectTrigger
                className={cn(
                  "ml-2 border rounded w-30 !h-7 cursor-pointer focus:ring-0 focus-visible:ring-0 shadow-none",
                  loggedInUser.user_type === "EMPLOYEE" &&
                    "bg-gray-100 text-gray-500 cursor-not-allowed"
                )}
              >
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem value={status.value} key={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Dates */}
          <div className="flex items-center justify-between">
            <p className="flex flex-col">
              <span className="text-neutral-400 text-sm 3xl:!text-base">
                Start Date:
              </span>
              <span className="text-sm">
                {formatDate(projectdata.start_date)}
              </span>
            </p>
            <p className="flex flex-col">
              <span className="text-neutral-400 text-sm 3xl:!text-base">
                Due Date:
              </span>
              <span className="text-sm">
                {formatDate(projectdata.due_date)}
              </span>
            </p>
          </div>

          {/* Assigned Users */}
          <div>
            <p className="text-base 3xl:!text-lg mb-2">Members</p>
            {/* Only MANAGERs can assign users */}
            {loggedInUser.user_type === "MANAGER" && (
              <div className="flex items-center gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <div
                      ref={triggerRef}
                      className="rounded border flex items-center justify-between px-2 py-1 cursor-pointer flex-1"
                    >
                      <span className="text-gray-500">
                        {selectedUsers.length > 0
                          ? selectedUsers
                              .map((u) => u.display_name || "Unnamed")
                              .join(", ")
                          : "Select users..."}
                      </span>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    style={{
                      width: triggerWidth ? `${triggerWidth}px` : "auto",
                    }}
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
                              <span className="capitalize">
                                {user.display_name || "Unnamed"}
                              </span>
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
                  className="w-13 h-8 bg-purple-600 text-white rounded disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {assignUserMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Add"
                  )}
                </button>
              </div>
            )}
            <div className="mt-2 h-[calc(100vh-370px)] overflow-y-auto">
              {assignedUsers.length === 0 && (
                <p className="text-gray-500">No users assigned.</p>
              )}
              {assignedUsers.map((user) => (
                <p
                  key={user.id}
                  className="flex items-center justify-between gap-2 mb-1 px-2 py-1"
                >
                  <span className="capitalize text-sm 3xl:!text-base">
                    {user.display_name || "Unnamed"}
                  </span>
                  <button
                    disabled={loggedInUser.user_type === "EMPLOYEE"}
                    onClick={() => handleRemoveUser(user.id)}
                    className={cn(
                      "cursor-pointer",
                      loggedInUser.user_type === "EMPLOYEE"
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-violet-700"
                    )}
                    title={
                      loggedInUser.user_type === "EMPLOYEE"
                        ? "Employees cannot remove users"
                        : "Remove user"
                    }
                  >
                    <X className="w-4 h-4" />
                  </button>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Viewdetails;
