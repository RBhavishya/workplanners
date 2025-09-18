import React, { useEffect, useState, useRef } from "react";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronDown,
  MoveLeft,
  X,
  Check,
  Loader2,
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
  getSingleDropDownForAssignedUsersAPI,
  gettasksByIdAPI,
  updateTasksAPI,
} from "@/https/services/tasks";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Calendar } from "../ui/calendar";

const formatDate = (date?: Date) =>
  date ? dayjs(date).format("YYYY-MM-DD") : "";

const AddTaskForm = ({
  taskId = null,
  taskData = null,
  open,
  onClose,
  onSave,
}: {
  mode?: "create" | "edit";
  taskId?: any;
  taskData?: any;
  open?: boolean;
  onClose?: any;
  onSave?: (data: any) => void;
}) => {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const id = params?.id ? Number(params.id) : null;
  const mode = id ? "edit" : "create";

  // States
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [title, setTitle] = useState(taskData?.task_title || "");
  const [description, setDescription] = useState(taskData?.description || "");
  const [startDate, setStartDate] = useState<Date | undefined>(
    taskData?.start_date ? new Date(taskData.start_date) : undefined
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    taskData?.end_date ? new Date(taskData.end_date) : undefined
  );

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [projectPopoverOpen, setProjectPopoverOpen] = useState(false);
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState<number | null>(
    taskData?.project_id || null
  );
  const [assignedUsers, setAssignedUsers] = useState<number[]>(
    taskData?.assigned_users || []
  );
  const [searchProjects, setSearchProjects] = useState("");
  const [searchUsers, setSearchUsers] = useState("");

  const triggerRef = useRef<HTMLDivElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

  const {
    data: taskResp,
    isLoading: loadingTask,
    isError,
  } = useQuery({
    queryKey: ["task", id],
    queryFn: () => gettasksByIdAPI(Number(id)),
    enabled: !!id,
  });

  // Fetch Projects
  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await getDropDownForProjectsTasksAPI();
      return res.data?.data ?? [];
    },
  });

  // Fetch Users for selected project (only create mode)
  const { data: usersResp = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["assignedUsers", selectedProject],
    queryFn: async () => {
      if (!selectedProject) return [];
      const res = await getSingleDropDownForAssignedUsersAPI(selectedProject);
      return res.data?.data ?? [];
    },
    enabled: mode === "create" && !!selectedProject,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      setFormError("");
      setErrors({});
      return await createTaskAPI(payload);
    },
    onSuccess: (res: any) => {
      toast.success(res?.data?.message || "Task created successfully");
      setSuccessMessage("Task created successfully!");
      onSave?.(res?.data?.data);
      setTimeout(() => navigate({ to: "/tasks" }), 1000);
    },
    onError: (error: any) => {
      setErrors({});
      setFormError(null);
      if (error?.status === 422 && error?.data?.errData) {
        setErrors(error.data.errData);
      } else {
        const message = error?.data?.message || "Failed to create task";
        toast.error(message);
        setFormError(message);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      taskId,
      payload,
    }: {
      taskId: number;
      payload: any;
    }) => {
      console.log("Updating task with:", taskId, payload);
      return await updateTasksAPI(taskId, payload);
    },
    onSuccess: (res: any) => {
      toast.success(res?.message || "Task updated successfully!");
      navigate({ to: "/tasks" });
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      toast.error(error?.data?.message || "Failed to update task");
    },
  });

  const handleNavigation = () => navigate({ to: "/tasks" });

  const handleSave = () => {
    setFormError(null);
    setErrors({});
    setSuccessMessage("");

    const payload: any = {
      task_title: title,
      description,
      // project_id: selectedProject,
       ...(mode === "create" ? { project_id:selectedProject} : {}),
      start_date: startDate ? formatDate(startDate) : null,
      end_date: dueDate ? formatDate(dueDate) : null,
      ...(mode === "create" ? { assigned_users: assignedUsers } : {}),
    };

    if (mode === "edit" && id) {
      updateMutation.mutate({ taskId: Number(id), payload });
    } else {
      createMutation.mutate(payload);
    }
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
  ) => setList((prev) => prev.filter((i) => i !== id));

  const removeAll = (setList: React.Dispatch<React.SetStateAction<number[]>>) =>
    setList([]);

  useEffect(() => {
    if (triggerRef.current) setTriggerWidth(triggerRef.current.offsetWidth);
  }, [projectPopoverOpen, userPopoverOpen]);

  useEffect(() => {
    if (mode === "edit" && taskResp?.data?.data) {
      setTitle(taskResp.data?.data.task_title);
      setDescription(taskResp.data?.data.description);
      setStartDate(
        taskResp.data?.data.start_date
          ? new Date(taskResp.data?.data.start_date)
          : undefined
      );
      setDueDate(
        taskResp.data?.data.end_date
          ? new Date(taskResp.data?.data.end_date)
          : undefined
      );
      // setSelectedProject(taskResp.data?.data.project_id);
      // setAssignedUsers(taskResp.data.assigned_users || []);
    }
  }, [taskResp, mode]);

  console.log(taskResp, "taskResp");
  return (
    <div className="mt-6 ml-62 p-6 bg-white shadow rounded-xl border max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-start gap-3 mb-4">
        <button
          type="button"
           onClick={() => window.history.back()}
          className="px-2 py-2 text-gray-600 rounded cursor-pointer"
        >
          <MoveLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold">
          {mode === "edit" ? "Edit Task" : "Add Task"}
        </h2>
      </div>

      {/* Form Errors */}
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

      {/* Task Title */}
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
        {errors.task_title && (
          <p className="text-red-500 text-xs mt-1">
            {errors.task_title.join(", ")}
          </p>
        )}
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
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">
            {errors.description.join(", ")}
          </p>
        )}
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
                  if (date && dueDate && dayjs(dueDate).isBefore(dayjs(date)))
                    setDueDate(undefined);
                }}
                disabled={(date) => dayjs(date).isBefore(dayjs(), "day")}
              />
            </PopoverContent>
          </Popover>
          {errors.start_date && (
            <p className="text-red-500 text-xs mt-1">
              {errors.start_date.join(", ")}
            </p>
          )}
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
          {errors.end_date && (
            <p className="text-red-500 text-xs mt-1">
              {errors.end_date.join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* Select Project */}
       {mode === "create" && (
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-sm font-medium">
          Select Project <span className="text-red-500">*</span>
        </label>
        <Popover open={projectPopoverOpen} onOpenChange={setProjectPopoverOpen}>
          <PopoverTrigger asChild>
            <div
              ref={triggerRef}
              className="rounded border flex items-center justify-between px-2 py-2 cursor-pointer"
            >
              {selectedProject ? (
                (() => {
                  const project = projects.find(
                    (p: any) => p.id === selectedProject
                  );
                  return (
                    <div className="flex items-center px-2 py-1 rounded bg-purple-100 text-sm gap-1">
                      <span>
                        {project?.title ?? `Project ${selectedProject}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedProject(null)}
                      >
                        <X className="w-3 h-3 text-gray-500 hover:text-gray-700" />
                      </button>
                    </div>
                  );
                })()
              ) : (
                <span className="text-gray-400">Select project...</span>
              )}
              <ChevronDown />
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
                ) : projects.length === 0 ? (
                  <CommandEmpty>No projects found.</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {projects.map((p: any) => (
                      <CommandItem
                        key={p.id}
                        onSelect={() => setSelectedProject(p.id)}
                      >
                        <span>{p.title}</span>
                        <Check
                          className={cn(
                            "h-4 w-4 ml-auto",
                            selectedProject === p.id
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
        {errors.project_id && (
          <p className="text-red-500 text-xs mt-1">
            {errors.project_id.join(", ")}
          </p>
        )}
      </div>
         )}

      {/* Assign Users (Create mode only) */}
      {mode === "create" && (
        <div className="flex flex-col gap-2 mb-4">
          <label className="text-sm font-medium">Assign Users</label>
          <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
            <PopoverTrigger asChild>
              <div className="rounded border flex items-center justify-between px-2 py-2 cursor-pointer">
                <div className="flex flex-wrap gap-1">
                  {assignedUsers.length === 0 ? (
                    <span className="text-gray-400">Select users...</span>
                  ) : (
                    assignedUsers.map((id) => {
                      const user = usersResp.find((u: any) => u.id === id);
                      return (
                        <div
                          key={id}
                          className="flex items-center px-2 py-1 rounded bg-purple-100 text-sm gap-1"
                        >
                          <span>{user?.display_name ?? `User ${id}`}</span>
                          <button
                            type="button"
                            onClick={() => removeOne(id, setAssignedUsers)}
                          >
                            <X className="w-3 h-3 text-gray-500 hover:text-gray-700" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {assignedUsers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => removeAll(setAssignedUsers)}
                    >
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
                  ) : usersResp.length === 0 ? (
                    <CommandEmpty>No users found.</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {usersResp.map((u: any) => (
                        <CommandItem
                          key={u.id}
                          onSelect={() =>
                            toggleSelection(
                              u.id,
                              assignedUsers,
                              setAssignedUsers
                            )
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
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={handleNavigation}
          className="px-4 py-2 border rounded-lg text-purple-500 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={
            mode === "edit"
              ? updateMutation.isPending
              : createMutation.isPending
          }
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
        >
          {mode === "edit" ? (
            updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Updating...
              </>
            ) : (
              "Update"
            )
          ) : createMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </div>
  );
};

export default AddTaskForm;
