import React, { useEffect, useState, useRef } from "react";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronDown,
  MoveLeft,
  X,
  Check,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createTaskAPI,
  getDropDownForProjectsTasksAPI,
  // <-- make sure you have this
} from "@/https/services/tasks";
import { useNavigate } from "@tanstack/react-router";
import { Calendar } from "../ui/calendar";

// Utility to format dates
const formatDate = (date: Date) => dayjs(date).format("DD/MM/YYYY");

const AddTaskForm = () => {
  const navigate = useNavigate();
  const [mode] = useState<"create" | "edit">("create");

  // Form states
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [dueDate, setDueDate] = useState<Date | undefined>();

  // Popovers
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [projectPopoverOpen, setProjectPopoverOpen] = useState(false);
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);

  // States for Projects & Users
  const [taskProjects, setTaskProjects] = useState<number[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<number[]>([]);
  const [searchProjects, setSearchProjects] = useState("");
  const [searchUsers, setSearchUsers] = useState("");

  const triggerRef = useRef<HTMLDivElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [projectPopoverOpen, userPopoverOpen]);

  // Fetch Projects
  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await getDropDownForProjectsTasksAPI();
      return response.data?.data;
    },
  });

  // Fetch Users
  const { data: usersResp, isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await getDropDownForProjectsTasksAPI();
      return response.data?.data;
    },
  });

  // --- API integration ---
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: any) => {
      setFormError("");
      return await createTaskAPI(payload);
    },
    onSuccess: (response: any) => {
      if (response?.status === 200 || response?.status === 201) {
        toast.success(response?.data?.message || "Task created successfully");
        setSuccessMessage("Task created successfully!");
        setTimeout(() => navigate({ to: "/tasks" }), 1000);
      } else if (response?.status === 422 || response?.status === 409) {
        setFormError(response?.data?.message || "Validation failed.");
      }
    },
    onError: () => {
      toast.error("An error occurred. Please try again.");
    },
  });

  // --- Handlers ---
  const handleNavigation = () => navigate({ to: "/tasks" });

  const handleSave = () => {
    if (!title.trim() || !description.trim() || !startDate || !dueDate) {
      setFormError("Please fill in all required fields.");
      return;
    }

    const payload = {
      task_title: title,
      description,
      start_date: dayjs(startDate).format("YYYY-MM-DD"),
      due_date: dayjs(dueDate).format("YYYY-MM-DD"),
      projects: taskProjects,
      assigned_users: assignedUsers,
    };

    mutate(payload);
  };

  const toggleSelection = (
    id: number,
    list: number[],
    setList: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    setList((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const removeOne = (
    id: number,
    setList: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    setList((prev) => prev.filter((i) => i !== id));
  };

  const removeAll = (setList: React.Dispatch<React.SetStateAction<number[]>>) =>
    setList([]);

  return (
    <div className="mt-6 ml-62 p-6 bg-white shadow rounded-xl border max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-start gap-3 mb-4">
        <button
          onClick={handleNavigation}
          className="px-2 py-2 text-gray-600 rounded cursor-pointer"
        >
          <MoveLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold">
          {mode === "edit" ? "Edit Task" : "Add Task"}
        </h2>
      </div>

      {/* Errors */}
      {formError && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {formError}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-sm font-medium">
          Task Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Enter Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-sm font-medium">
          Task Description <span className="text-red-500">*</span>
        </label>
        <textarea
          placeholder="Enter Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Dates */}
      <div className="flex gap-4 mb-4">
        {/* Start Date */}
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-sm font-medium">
            Start Date <span className="text-red-500">*</span>
          </label>
          <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  "w-full flex items-center gap-2 border rounded-lg p-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                {startDate ? formatDate(startDate) : "Pick a date"}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                  setStartDateOpen(false);
                  if (date && dueDate && dayjs(dueDate).isBefore(dayjs(date))) {
                    setDueDate(undefined);
                  }
                }}
                disabled={(date) => dayjs(date).isBefore(dayjs(), "day")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Due Date */}
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-sm font-medium">
            Due Date <span className="text-red-500">*</span>
          </label>
          <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  "w-full flex items-center gap-2 border rounded-lg p-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors",
                  !dueDate && "text-muted-foreground",
                  !startDate && "opacity-50 cursor-not-allowed"
                )}
              >
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                {dueDate ? formatDate(dueDate) : "Pick a due date"}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(date) => {
                  setDueDate(date);
                  setDueDateOpen(false);
                }}
                disabled={(date) =>
                  !startDate || dayjs(date).isBefore(dayjs(startDate), "day")
                }
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Select Projects */}
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-sm font-medium">Select Projects</label>
        <Popover open={projectPopoverOpen} onOpenChange={setProjectPopoverOpen}>
          <PopoverTrigger asChild>
            <div
              ref={triggerRef}
              className="rounded border flex items-center justify-between px-2 py-2 cursor-pointer"
            >
              <div className="flex flex-wrap gap-1">
                {taskProjects.length === 0 ? (
                  <span className="text-gray-400">Select Projects...</span>
                ) : (
                  taskProjects.map((id) => {
                    const project = Array.isArray(projects)
                      ? projects.find((p: any) => p.id === id)
                      : null;
                    return (
                      <div
                        key={id}
                        className="flex items-center px-2 py-1 rounded bg-purple-100 text-sm gap-1"
                      >
                        <span>{project?.title ?? `Project ${id}`}</span>
                        <button onClick={() => removeOne(id, setTaskProjects)}>
                          <X className="w-3 h-3 text-gray-500 hover:text-gray-700" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex items-center gap-1">
                {taskProjects.length > 0 && (
                  <button onClick={() => removeAll(setTaskProjects)}>
                    <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                  </button>
                )}
                <ChevronDown />
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent
            style={{ width: triggerWidth ? `${triggerWidth}px` : "auto" }}
            className="p-0"
          >
            <Command>
              <CommandInput
                placeholder="Search projects..."
                value={searchProjects}
                onValueChange={setSearchProjects}
              />
              <CommandList className="max-h-60 overflow-y-auto">
                {loadingProjects ? (
                  <div className="p-2 text-gray-500">Loading...</div>
                ) : !Array.isArray(projects) || projects.length === 0 ? (
                  <CommandEmpty>No projects found.</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {projects.map((p: any) => (
                      <CommandItem
                        key={p.id}
                        onSelect={() =>
                          toggleSelection(p.id, taskProjects, setTaskProjects)
                        }
                      >
                        <span>{p.title}</span>
                        <Check
                          className={cn(
                            "h-4 w-4 ml-auto",
                            taskProjects.includes(p.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Assign Users */}
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-sm font-medium">Assign Users</label>
        <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
          <PopoverTrigger asChild>
            <div
              className="rounded border flex items-center justify-between px-2 py-2 cursor-pointer"
            >
              <div className="flex flex-wrap gap-1">
                {assignedUsers.length === 0 ? (
                  <span className="text-gray-400">Select users...</span>
                ) : (
                  assignedUsers.map((id) => {
                    const user = Array.isArray(usersResp)
                      ? usersResp.find((u: any) => u.id === id)
                      : null;
                    return (
                      <div
                        key={id}
                        className="flex items-center px-2 py-1 rounded bg-purple-100 text-sm gap-1"
                      >
                        <span>{user?.display_name ?? `User ${id}`}</span>
                        <button onClick={() => removeOne(id, setAssignedUsers)}>
                          <X className="w-3 h-3 text-gray-500 hover:text-gray-700" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex items-center gap-1">
                {assignedUsers.length > 0 && (
                  <button onClick={() => removeAll(setAssignedUsers)}>
                    <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                  </button>
                )}
                <ChevronDown />
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent
            style={{ width: triggerWidth ? `${triggerWidth}px` : "auto" }}
            className="p-0"
          >
            <Command>
              <CommandInput
                placeholder="Search users..."
                value={searchUsers}
                onValueChange={setSearchUsers}
              />
              <CommandList className="max-h-60 overflow-y-auto">
                {loadingUsers ? (
                  <div className="p-2 text-gray-500">Loading...</div>
                ) : !Array.isArray(usersResp) || usersResp.length === 0 ? (
                  <CommandEmpty>No users found.</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {usersResp.map((u: any) => (
                      <CommandItem
                        key={u.id}
                        onSelect={() =>
                          toggleSelection(u.id, assignedUsers, setAssignedUsers)
                        }
                      >
                        <span>{u.display_name}</span>
                        <Check
                          className={cn(
                            "h-4 w-4 ml-auto",
                            assignedUsers.includes(u.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={handleNavigation}
          className="px-4 py-2 border rounded-lg text-purple-500 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default AddTaskForm;
