import React, { useEffect, useState, useRef } from "react";
import { Check, ChevronDown, MoveLeft } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addAsignedUserAPI,
  deleteTaskAssignedUserAPI,
  getTaskAssignedUsersAPI,
  getTaskByIdAPI,
  getTasksAvailableUsersAPI,
  TasksStatusAPI,
} from "@/https/services/tasks";
import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils"; // utility for conditional classes

const TaskViewDetails = () => {
  const { id } = useParams({ from: "/_layout/tasks/view/$id/" });
  const queryClient = useQueryClient();

  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    REVIEW: "bg-orange-100 text-orange-800",
    COMPLETED: "bg-green-100 text-green-800",
  };

  const {
    data: taskResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getTaskByIdAPI(Number(id)),
  });

  const patchStatusMutation = useMutation({
    mutationFn: (newStatus: string) =>
      TasksStatusAPI(Number(id), { task_status: newStatus }),
    onSuccess: () => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["project", id] });
    },
    onError: (err: any) => {
      toast.error(err?.data?.message || "Failed to update status");
    },
  });

  const { data: assignedUsersData } = useQuery({
    queryKey: ["assignedUsers", id],
    queryFn: () => getTaskAssignedUsersAPI(Number(id)),
  });

  const { data: availableUsersData } = useQuery({
    queryKey: ["availableUsers", id],
    queryFn: () => getTasksAvailableUsersAPI(Number(id)),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) =>
      deleteTaskAssignedUserAPI(Number(id), userId),
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
    mutationFn: (userId: number) => addAsignedUserAPI(Number(id), userId),
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

  const taskdata = taskResponse?.data?.data || {};
  const availableUsers = availableUsersData?.data?.data || [];

  const formatDate = (dateStr: string | null) =>
    dateStr ? new Date(dateStr).toLocaleDateString("en-CA") : "NA";

  const handleStatusChange = (newStatus: string) => {
    patchStatusMutation.mutate(newStatus);
  };

  const handleRemoveUser = (userId: number) => {
    deleteUserMutation.mutate(userId);
  };

  const handleAssignUsers = () => {
    selectedUsers.forEach((user) => assignUserMutation.mutate(user.id));
    setSelectedUsers([]);
    setOpen(false);
  };

  const toggleUserSelect = (user: any) => {
    setSelectedUsers((prev) =>
      prev.find((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  };

  useEffect(() => {
    if (assignedUsersData?.data?.data) {
      setAssignedUsers(assignedUsersData.data.data);
    }
  }, [assignedUsersData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error)
    return <p className="text-center text-red-500">Error loading tasks</p>;
  if (!taskdata) return <p className="text-center">No Tasks found</p>;

  return (
    <div className="p-4">
      {/* Header with Back */}
      <div className="border border-gray-300 rounded-xl p-4 mb-6 bg-gray-50">
        <button
          onClick={() => window.history.back()}
          className="text-gray-600 hover:text-blue-600 cursor-pointer"
        >
          <MoveLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
            {taskdata.task_title?.charAt(0) || "P"}
          </div>
          <div className="flex items-center gap-[3px] text-xl font-semibold">
            <span>{taskdata.task_title}</span>
            <span
              className={`ml-2 text-sm px-2 py-1 rounded ${
                statusColors[taskdata.task_status] ||
                "bg-gray-200 text-gray-800"
              }`}
            >
              {taskdata.task_status}
            </span>
          </div>
        </div>
        <p className="text-gray-700 mt-2">
          {taskdata.description || "No description available"}
        </p>
      </div>

      {/* Main Layout */}
      <div className="border border-gray-200 bg-white rounded-3xl shadow-lg p-6 flex gap-6 min-h-[600px]">
        {/* Project Details */}
        <div className="w-1/3 border border-gray-200 rounded-3xl p-4 ml-auto">
          <div className="text-2xl font-bold mb-4">Details</div>

          {/* Created By */}
          <div className="flex items-center gap-3 mb-4">
            {taskdata.createdByUser?.profile_pic ? (
              <img
                src={taskdata.createdByUser.profile_pic}
                alt={taskdata.task_title || "User"}
                className="w-10 h-10 rounded-full object-cover border"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                {taskdata.task_title?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div>
              {/* ✅ Task Title */}
              <p className="font-medium">
                {taskdata.task_title || "Untitled Task"}
              </p>
              <p className="text-xs text-gray-500">Task Title</p>
            </div>
          </div>
          {/* Status Selector */}
          <div className="mb-4">
            <strong>Status:</strong>{" "}
            <select
              value={taskdata.task_status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="ml-2 border rounded p-1 cursor-pointer"
            >
              <option value="NEW">NEW</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="PENDING">PENDING</option>
              <option value="REVIEW">REVIEW</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>

          {/* Dates */}
          <p className="mb-2">
            <strong>Start Date:</strong> {formatDate(taskdata.start_date)}
          </p>
          <p className="mb-2">
            <strong>Due Date:</strong> {formatDate(taskdata.end_date)}
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
                        : "Select"}
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

export default TaskViewDetails;
