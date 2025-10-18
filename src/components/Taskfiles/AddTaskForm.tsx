import React, { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  X,
  Check,
  Loader2,
  ArrowLeft,
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createTaskAPI,
  getDropDownForProjectsTasksAPI,
  getSingleDropDownForAssignedUsersAPI,
  getTaskByIdAPI,
  updateTasksAPI,
} from "@/https/services/tasks";
import { useNavigate, useParams, useRouter } from "@tanstack/react-router";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const formatDate = (date?: Date) =>
  date ? dayjs(date).format("YYYY-MM-DD") : "";

export const AddTaskForm = ({
  taskData = null,
  onSave,
}: {
  mode?: "create" | "edit";
  taskData?: any;
  onSave?: (data: any) => void;
}) => {
  const params = useParams({ strict: false });
  const id = params?.id ? Number(params.id) : null;
  const mode = id ? "edit" : "create";
  const queryClient = useQueryClient();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [visibleMonth, setVisibleMonth] = useState<Date>(dayjs().toDate());
  const [visibleDueMonth, setVisibleDueMonth] = useState<Date | undefined>();
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

  const {
    data: taskResp,
    isError,
    error
  } = useQuery({
    queryKey: ["task", id],
    queryFn: () => getTaskByIdAPI(Number(id)),
    enabled: !!id,
  });

  if(isError) toast.error(error?.message || "Failed to fetch task details");

  const { data: projects = [], isLoading: loadingProjects, isError: isErrorProjects, error: errorProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await getDropDownForProjectsTasksAPI();
      return res.data?.data ?? [];
    },
  });

  if(isErrorProjects) toast.error(errorProjects?.message || "Failed to fetch projects");

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
    onSuccess: async (res: any) => {
      toast.success(res?.data?.message || "Task created successfully");
      setSuccessMessage("Task created successfully!");
      onSave?.(res?.data?.data);
      router.history.back();
      await queryClient.refetchQueries({ queryKey: ["all-tasks"] });
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
      return await updateTasksAPI(taskId, payload);
    },
    onSuccess: async (res: any) => {
      toast.success(res?.message || "Task updated successfully!");
      router.history.back();
      await queryClient.refetchQueries({ queryKey: ["all-tasks"] });
    },
    onError: (error: any) => {
      setErrors({});
      setFormError(null);

      if (error?.status === 422 && error?.data?.errData) {
        setErrors(error.data.errData);
      } else {
        const message = error?.data?.message || "Failed to update task";
        toast.error(message);
        setFormError(message);
      }
    },
  });

  const handleNavigation = () => router.history.back();

  const handleSave = () => {
    setFormError(null);
    setErrors({});
    setSuccessMessage("");

    const payload: any = {
      task_title: title,
      description,
      // project_id: selectedProject,
      ...(mode === "create" ? { project_id: selectedProject } : {}),
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
    }
  }, [taskResp, mode]);

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const Form_STYLES = {
    label: "text-sm 3xl:!text-base font-normal text-neutral-500",
    input: "w-full border text-sm 3xl:!text-base border-purple-200 rounded-sm shadow-none bg-gray-50 p-2 focus:outline-none focus:ring-0 focus-visible:ring-0 placeholder:text-purple-300"
  }

  return (
    <div className="mt-6 mx-auto p-4 bg-white shadow rounded-xl border-none max-w-lg">
      <div className="flex items-center justify-start mb-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-2 py-2 text-gray-600 rounded cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg 3xl:!text-xl font-semibold">
          {mode === "edit" ? "Edit Task" : "Add Task"}
        </h2>
      </div>

      {/* Task Title */}
      <div className="flex flex-col gap-2 mb-4">
        <label className={Form_STYLES.label}>
          Task Title <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          placeholder="Enter Task Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            clearFieldError("task_title");
          }}
          className={Form_STYLES.input}
        />
        {errors.task_title && (
          <p className="text-red-500 text-xs 3xl:!text-sm">
            {errors.task_title.join(", ")}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2 mb-4">
        <label className={Form_STYLES.label}>
          Task Description <span className="text-red-500">*</span>
        </label>
        <textarea
          placeholder="Enter Task Description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            clearFieldError("description"); 
          }}
          className={`${Form_STYLES.input} resize-none h-20`}
        />
        {errors.description && (
          <p className="text-red-500 text-xs 3xl:!text-sm">
            {errors.description.join(", ")}
          </p>
        )}
      </div>

      {/* Dates */}
      <div className="flex gap-4 mb-4">
        {/* Start Date */}
        <div className="flex flex-col gap-2 flex-1">
          <label className={Form_STYLES.label}>
            Start Date <span className="text-red-500">*</span>
          </label>
          <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  `${Form_STYLES.input} flex gap-2 items-center`,
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                {startDate ? formatDate(startDate) : <span className="text-purple-300">Pick a date</span>}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                month={visibleMonth}
                onMonthChange={setVisibleMonth}
                selected={startDate}
                onSelect={(date) => {
                  if (date) {
                    setStartDate(date);
                    setVisibleMonth(date);
                    setStartDateOpen(false);

                    clearFieldError("start_date");
                    if (dueDate && dayjs(dueDate).isBefore(dayjs(date))) {
                      setDueDate(undefined);
                      clearFieldError("end_date");
                    }
                  }
                }}
                disabled={(date) => dayjs(date).isBefore(dayjs(), "day")}
                className="rounded-md border bg-white shadow-sm"
              />
            </PopoverContent>
          </Popover>
          {errors.start_date && (
            <p className="text-red-500 text-xs 3xl:!text-sm">
              {errors.start_date.join(", ")}
            </p>
          )}
        </div>

        {/* Due Date */}
        <div className="flex flex-col gap-2 flex-1">
          <label className={Form_STYLES.label}>
            Due Date <span className="text-red-500">*</span>
          </label>
          <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  `${Form_STYLES.input} flex gap-2 items-center`,
                  !dueDate && "text-muted-foreground",
                  !startDate && "opacity-50 cursor-not-allowed"
                )}
              >
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                {dueDate ? formatDate(dueDate) : <span className="text-purple-300">Pick a due date</span>}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                month={visibleDueMonth || startDate || undefined} 
                onMonthChange={(month) => setVisibleDueMonth(month)}
                onSelect={(date) => {
                  if (date) {
                    setDueDate(date);
                    setVisibleDueMonth(date);
                    setDueDateOpen(false);
                    clearFieldError("end_date");
                  }
                }}
                disabled={(date) =>
                  !startDate || dayjs(date).isBefore(dayjs(startDate), "day")
                }
              />
            </PopoverContent>
          </Popover>
          {errors.end_date && (
            <p className="text-red-500 text-xs 3xl:!text-sm">
              {errors.end_date.join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* Select Project */}
      {mode === "create" && (
        <div className="flex flex-col gap-2 mb-4">
          <label className={Form_STYLES.label}>
            Select Project <span className="text-red-500">*</span>
          </label>
          <Popover
            open={projectPopoverOpen}
            onOpenChange={setProjectPopoverOpen}
          >
            <PopoverTrigger asChild>
              <div
                className="rounded border border-purple-300 bg-gray-50 flex items-center justify-between px-2 py-2 cursor-pointer"
              >
                {selectedProject ? (
                  (() => {
                    const project = projects.find(
                      (p: any) => p.id === selectedProject
                    );
                    return (
                      <div className="flex items-center px-2 py-1 rounded bg-purple-100 text-sm 3xl:!text-base gap-1">
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
                  <span className="text-purple-300">Select project...</span>
                )}
                <ChevronDown className="text-purple-300" strokeWidth={1.5}/>
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="p-0"
            >
              <Command>
                <CommandInput
                  placeholder="Search projects..."
                  value={searchProjects}
                  onValueChange={setSearchProjects}
                  className="text-sm 3xl:!text-base"
                />
                <CommandList className="max-h-60 overflow-y-auto">
                  {loadingProjects ? (
                    <div className="flex items-center justify-center min-h-100">
                    <img src="/6-dots-scale.svg" alt="loader" width={60} height={60} />
                  </div>
                  ) : projects.length === 0 ? (
                    <CommandEmpty>No projects found.</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {projects.map((p: any) => (
                        <CommandItem
                          key={p.id}
                          onSelect={() => {
                            setSelectedProject(p.id);
                            clearFieldError("project_id");
                          }}
                        >
                          <span className="capitalize text-sm 3xl:!text-base">{p.title}</span>
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
            <p className="text-red-500 text-xs 3xl:!text-sm">
              {errors.project_id.join(", ")}
            </p>
          )}
        </div>
      )}

      {mode === "create" && (
        <div className="flex flex-col gap-2 mb-4">
          <label className={Form_STYLES.label}>Assign Users</label>
          <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
            <PopoverTrigger asChild>
              <div className="rounded border border-purple-300 bg-gray-50 flex items-center justify-between px-2 py-2 cursor-pointer">
                <div className="flex flex-wrap gap-1">
                  {assignedUsers.length === 0 ? (
                    <span className="text-purple-300 text-sm 3xl:!text-base">Select users...</span>
                  ) : (
                    assignedUsers.map((id) => {
                      const user = usersResp.find((u: any) => u.id === id);
                      return (
                        <div
                          key={id}
                          className="flex items-center px-2 py-1 rounded bg-purple-100 gap-1"
                        >
                          <span className="capitalize text-sm 3xl:!text-base">{user?.display_name ?? `User ${id}`}</span>
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
                  <ChevronDown className="text-purple-300" strokeWidth={1.5}/>
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="p-0"
            >
              <Command>
                <CommandInput
                  placeholder="Search users..."
                  value={searchUsers}
                  onValueChange={setSearchUsers}
                  className="text-sm 3xl:!text-base"
                />
                <CommandList className="max-h-60 overflow-y-auto">
                  {loadingUsers ? (
                    <div className="flex items-center justify-center min-h-100">
                    <img src="/6-dots-scale.svg" alt="loader" width={60} height={60} />
                  </div>
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
        <Button
          type="button"
          variant="outline"
          onClick={handleNavigation}
          className="px-4 py-2 text-sm 3xl:!text-base border rounded-sm text-purple-500 hover:bg-gray-100 cursor-pointer font-normal shadow-none"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="default"
          onClick={handleSave}
          disabled={
            mode === "edit"
              ? updateMutation.isPending
              : createMutation.isPending
          }
          className={`px-6 py-2 text-sm 3xl:!text-base bg-purple-600 text-white rounded-sm flex items-center gap-2 
    hover:bg-purple-700 font-normal
    ${
      mode === "edit"
        ? updateMutation.isPending
          ? "cursor-not-allowed"
          : "cursor-pointer"
        : createMutation.isPending
          ? "cursor-not-allowed"
          : "cursor-pointer"
    } 
    disabled:opacity-50`}
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
        </Button>
      </div>
    </div>
  );
};
