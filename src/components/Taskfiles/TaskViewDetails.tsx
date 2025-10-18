import {
  addAsignedUserAPI,
  deleteTaskAssignedUserAPI,
  getTaskAssignedUsersAPI,
  getTaskByIdAPI,
  getTasksAvailableUsersAPI,
  TasksStatusAPI,
} from "@/https/services/tasks";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { ArrowLeft, Check, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { TaskComments } from "./TaskComments";
import { statusColors } from "@/lib/helpers/statusColors";
import { statuses } from "@/lib/helpers/StatusFilter";
import dayjs from "dayjs";

export const TaskViewDetails = () => {
  const { id } = useParams({ from: "/_layout/tasks/view/$id/" });
  const queryClient = useQueryClient();
  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

  const {
    data: taskResponse,
    isLoading,
    error,
    isError
  } = useQuery({
    queryKey: ["task", id],
    queryFn: () => getTaskByIdAPI(Number(id)),
  });

  if(isError){
    toast.error(error?.message || "Failed to fetch task details");
  }

  const patchStatusMutation = useMutation({
    mutationFn: (newStatus: string) =>
      TasksStatusAPI(Number(id), { task_status: newStatus }),
    onSuccess: async () => {
      toast.success("Status updated successfully");
      await queryClient.refetchQueries({ queryKey: ["task", id] });
      await queryClient.refetchQueries({ queryKey: ["all-tasks"]});
      await queryClient.refetchQueries({ queryKey: ["todayTasks"]});
      await queryClient.refetchQueries({ queryKey: ["todayStats"]});
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
        <img src="/6-dots-scale.svg" alt="loader" width={60} height={60} />
      </div>
    );
  }

  if (error)
    return <p className="text-center text-red-500">Error loading tasks</p>;
  if (!taskdata) return <p className="text-center">No Tasks found</p>;

  return (
    <div className="flex justify-between">
      <div className="flex flex-col m-2 gap-3 w-full">
        <div className="rounded-md p-3 bg-gray-50 shadow-[0_0_5px_0_rgba(0,0,0,0.2)]">
          <div className="flex items-start gap-3">
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-blue-600 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 flex items-center justify-center rounded-sm bg-blue-600 text-white text-lg font-medium capitalize">
              {taskdata?.task_title?.charAt(0) || "T"}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-lg 3xl:!text-xl font-medium">
                <span className="capitalize">{taskdata?.task_title}</span>
                <span
                  className={`ml-2 text-sm px-2 py-1 rounded ${
                    statusColors[taskdata?.task_status] ||
                    "bg-gray-200 text-gray-800"
                  }`}
                >
                  {taskdata?.task_status === "IN_PROGRESS"
                    ? "In Progress"
                    : taskdata?.task_status?.charAt(0).toUpperCase() +
                      taskdata?.task_status?.slice(1).toLowerCase()}
                </span>
              </div>
              <p className="text-gray-700 text-sm 3xl:!text-base">
                {taskdata?.description || "No description available"}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white h-[calc(100vh-165px)] rounded-md shadow-[0_0_5px_0_rgba(0,0,0,0.2)]">
          <TaskComments />
        </div>
      </div>

      {/* Task Details */}
      <div className="w-2/5 border-l border-gray-200 p-3 bg-white">
        <div className="text-xl font-medium mb-4">Task Details</div>
        <div className="flex flex-col gap-3">
          {/* Created By */}
          <div className="flex items-center gap-3 mb-4">
            {taskdata.createdByUser?.profile_pic ? (
              <img
                src={taskdata.createdByUser.profile_pic}
                alt={taskdata.createdByUser.display_name || "User"}
                className="w-10 h-10 rounded-full object-cover border"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                {taskdata.task_title?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div>
              <p className="font-medium capitalize">
                {taskdata.task_title || "Untitled Task"}
              </p>
              <p className="text-xs text-gray-500">Task Title</p>
            </div>
          </div>

          {/* Status Selector */}
          <div className="flex items-center gap-2">
            <p className="text-base 3xl:!text-lg">Status:</p>{" "}
            <Select
              value={taskdata.task_status}
              onValueChange={(value) => handleStatusChange(value)}
            >
              <SelectTrigger className="ml-2 border rounded w-30 !h-7 focus:ring-0 focus-visible:ring-0 shadow-nonebg-gray-100 text-gray-500 cursor-pointer">
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
                Start Date
              </span>
              <span className="text-sm">{dayjs(taskdata.start_date).format("DD-MM-YYYY")}</span>
            </p>
            <p className="flex flex-col">
              <span className="text-neutral-400 text-sm 3xl:!text-base">
                Due Date
              </span>
              <span className="text-sm">{dayjs(taskdata.end_date).format("DD-MM-YYYY")}</span>
            </p>
          </div>

          {/* Assigned Users */}
          <div>
            <p className="text-base 3xl:!text-lg mb-2">Members</p>
            {/* Only MANAGERs can assign users */}
            <div className="flex items-center gap-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <div
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
                <PopoverContent className="p-0">
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
            <div className="mt-2 h-[calc(100vh-370px)] overflow-y-auto">
              {assignedUsers.length === 0 && (
                <p className="text-gray-500 text-sm 3xl:!text-base flex items-center justify-center h-full">
                  No users assigned.
                </p>
              )}
              {assignedUsers.map((user, index) => (
                <div
                  key={user.id}
                  className={cn(
                    "flex items-center justify-between gap-2 mb-1 px-2 py-1",
                    index % 2 === 0 ? "bg-sky-50" : "bg-white"
                  )}
                >
                  <span className="capitalize text-sm 3xl:!text-base">
                    {user.display_name || "-"}
                  </span>
                  <button
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
