import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  CalendarIcon,
  ChevronDown,
  X,
  MoveLeft,
  Check,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { useNavigate } from "@tanstack/react-router";
import { AddProjectData, ProjectData, UsersDropdownResponse } from "@/interfaces/project";
import {
  createProjectAPI,
  getAllUsersAPI,
  getProjectByIdAPI,
  updateProjectAPI,
} from "@/https/services/project";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export interface AddProjectFormProps {
  mode: "create" | "edit";
  nextId: number | null;
  projectId?: number;
  onSave?: (data: ProjectData) => void;
}

const AddProjectForm = ({
  mode,
  nextId,
  projectId,
  onSave,
}: AddProjectFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [assignedUsers, setAssignedUsers] = useState<number[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [visibleDueMonth, setVisibleDueMonth] = useState<Date | undefined>();
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const { data: projectResp, isLoading: loadingProject } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectByIdAPI(projectId!),
    enabled: mode === "edit" && !!projectId,
  });

  useEffect(() => {
    if (mode === "edit" && projectResp?.data?.data) {
      const p = projectResp.data.data;
      setTitle(p.title || "");
      setDescription(p.description || "");
      setLinks(p.links || []);
      setStartDate(p.start_date ? dayjs(p.start_date).toDate() : undefined);
      setDueDate(p.due_date ? dayjs(p.due_date).toDate() : undefined);
      setAssignedUsers(p.assigned_users || []);
    }
  }, [mode, projectResp]);

  const { data: usersResp, isLoading } = useQuery<UsersDropdownResponse>({
    queryKey: ["users", search],
    queryFn: () => getAllUsersAPI(),
    enabled: true,
  });

  const mutation = useMutation({
    mutationFn: (newProject: AddProjectData) => createProjectAPI(newProject),
    onSuccess: async (data) => {
      await queryClient.refetchQueries({ queryKey: ["projects"] });
      toast.success(data.message || "Project created successfully");

      navigate({ to: "/projects" });
      onSave?.(data.data);
    },
    onError: (error: any) => {
      setErrors({});
      setFormError(null);

      if (error?.status === 422 && error?.data?.errData) {
        setErrors(error.data.errData);
      } else {
        const message = error?.data?.message || "Failed to save project";
        toast.error(message);
        setFormError(message);
      }
    },
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: (updatedProject: AddProjectData) =>
      updateProjectAPI(projectId!, updatedProject),
    onSuccess: async (data) => {
      await queryClient.refetchQueries({ queryKey: ["projects"] });
      await queryClient.refetchQueries({ queryKey: ["project", projectId] });
      toast.success(data.message || "Project updated successfully");
      onSave?.(data.data);
      navigate({ to: "/projects" });
    },
    onError: (error: any) => {
      setErrors({});
      setFormError(null);

      if (error?.status === 422 && error?.data?.errData) {
        setErrors(error.data.errData);
      } else {
        const message = error?.data?.message || "Failed to update project";
        toast.error(message);
        setFormError(message);
      }
    },
    retry: false,
  });

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleUser = (id: number) => {
    setAssignedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const removeUser = (id: number) =>
    setAssignedUsers((prev) => prev.filter((uid) => uid !== id));

  const removeAll = () => setAssignedUsers([]);

  const handleAddLink = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && linkInput.trim() !== "") {
      e.preventDefault();
      setLinks([...links, linkInput.trim()]);
      setLinkInput("");
    }
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const formatDate = (date?: Date) => {
    if (!date) return "";
    return dayjs(date).format("YYYY-MM-DD");
  };

  const handleSave = () => {
    setFormError(null);
    setErrors({});
    const projectData: AddProjectData = {
      id: projectId ?? nextId ?? 0,
      title,
      description,
      links: links.length ? links : [],
      created_by: String(user.name),
      start_date: formatDate(startDate),
      due_date: formatDate(dueDate),
      assigned_users: assignedUsers,
    };
    if (mode === "edit") {
      updateMutation.mutate(projectData);
    } else {
      mutation.mutate(projectData);
    }
  };

  const handleNavigation = () => {
    navigate({ to: "/projects" });
  };

  const Form_STYLES = {
    label: "text-sm 3xl:!text-base font-normal text-neutral-500",
    input: "w-full border text-sm 3xl:!text-base border-purple-200 rounded-sm shadow-none bg-gray-50 p-2 focus:outline-none focus:ring-0 focus-visible:ring-0 placeholder:text-purple-300"
  }

  return (
    <div className="mt-6 mx-auto p-4 bg-white shadow rounded-xl border-none max-w-lg">
      <div className="flex items-center justify-start mb-4">
        <span>
          <button
            onClick={() => window.history.back()}
            className="px-2 py-2 text-gray rounded cursor-pointer"
          >
            <ArrowLeft className="mr-2" size={20} />
          </button>
        </span>
        <span>
          <h2 className="text-lg 3xl:!text-xl font-semibold">
            {mode === "edit" ? "Edit Project" : "Add Project"}
          </h2>
        </span>
      </div>
      
      <div className="flex flex-col gap-2 mb-4">
        <label className={Form_STYLES.label}>
          Project Title <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          placeholder="Enter project title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            clearFieldError("title");
          }}
          className={Form_STYLES.input}
        />
        {errors.title && (
          <p className="text-red-500 text-xs 3xl:!text-sm">{errors.title.join(", ")}</p>
        )}
      </div>
      <div className="flex flex-col gap-2 mb-4">
        <label className={Form_STYLES.label}>
          Project Description
        </label>
        <textarea
          placeholder="Enter project description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            clearFieldError("description");
          }}
          className={`${Form_STYLES.input} resize-none placeholder:font-normal h-20`}
        />
        {errors.description && (
          <p className="text-red-500 text-xs 3xl:!text-sm">
            {errors.description.join(", ")}
          </p>
        )}
      </div>
      <div className="flex gap-4 mb-4">
        {/* Start Date Picker */}
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
                onClick={() => setStartDateOpen(true)}
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
          {errors?.start_date && (
            <p className="text-red-500 text-xs 3xl:!text-sm">
              {errors.start_date.join(", ")}
            </p>
          )}
        </div>

        {/* Due Date Picker */}
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
                onClick={() => startDate && setDueDateOpen(true)}
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
                    clearFieldError("due_date");
                  }
                }}
                disabled={(date) =>
                  !startDate || dayjs(date).isSame(dayjs(startDate), "day") || dayjs(date).isBefore(dayjs(startDate), "day")
                }
              />
            </PopoverContent>
          </Popover>
          {errors?.due_date && (
            <p className="text-red-500 text-xs 3xl:!text-sm">
              {errors.due_date.join(", ")}
            </p>
          )}
        </div>
      </div>
      {mode === "create" && (
        <div className="flex flex-col gap-2 mb-4">
          <label className={Form_STYLES.label}>Assign Users</label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div
                className="rounded border border-purple-300 bg-gray-50 flex items-center justify-between px-2 py-2 cursor-pointer"
              >
                <div className="flex flex-wrap gap-1">
                  {assignedUsers.length === 0 ? (
                    <span className="text-purple-300">Select users...</span>
                  ) : (
                    assignedUsers.map((id) => {
                      const user = Array.isArray(usersResp?.data?.data)
                        ? usersResp.data.data.find((u) => u.id === id)
                        : null;
                      return (
                        <div
                          key={id}
                          className="flex items-center px-2 py-1 rounded bg-purple-100 text-sm gap-1"
                        >
                          <span>{user?.display_name ?? `User ${id}`}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeUser(id);
                            }}
                          >
                            <X className="w-3 h-3 text-gray-500 hover:text-gray-700 cursor-pointer" />
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
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAll();
                      }}
                    >
                      <X className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
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
                  value={search}
                  onValueChange={setSearch}
                  className="placeholder:text-purple-300"
                />
                <CommandList className="max-h-60 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center min-h-100">
                    <img src="/6-dots-scale.svg" alt="loader" width={60} height={60} />
                  </div>
                  ) : !Array.isArray(usersResp?.data.data) ||
                    usersResp?.data.data.length === 0 ? (
                    <CommandEmpty>No users found.</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {usersResp.data.data.map((u) => (
                        <CommandItem
                          key={u.id}
                          onSelect={() => toggleUser(u.id)}
                        >
                          <span className="capitalize">{u.display_name}</span>
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
          {errors.assigned_users && (
            <p className="text-red-500 text-xs">
              {errors.assigned_users.join(", ")}
            </p>
          )}
        </div>
      )}
      <div className="flex flex-col mb-4 gap-2">
        <label className={Form_STYLES.label}>Project Reference Links</label>
        <div className="border-none rounded-sm flex flex-wrap gap-2 min-h-[50px]">
          {links.map((link, index) => (
            <span
              key={index}
              className="flex items-center gap-2 bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-sm"
            >
              {link}
              <button
                type="button"
                className="text-xs text-purple-500 hover:text-purple-700 cursor-pointer"
                onClick={() => handleRemoveLink(index)}
              >
                ✕
              </button>
            </span>
          ))}
          <Input
            type="text"
            placeholder="Add a link and press Enter"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={handleAddLink}
            className={`${Form_STYLES.input}`}
          />
        </div>
        {errors.links && (
          <p className="text-red-500 text-xs">{errors.links.join(", ")}</p>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button
          onClick={handleNavigation}
          variant="outline"
          className="px-4 py-2 border shadow-none rounded-sm text-sm 3xl:!text-base text-purple-500 hover:bg-gray-100 cursor-pointer font-normal"
          disabled={mutation.isPending || updateMutation.isPending}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          variant={mode === "edit" ? "outline" : "default"}
          className="px-6 py-2 bg-purple-600 text-white hover:text-white text-sm 3xl:!text-base rounded-sm hover:bg-purple-700 cursor-pointer flex items-center gap-2 font-normal"
          disabled={mutation.isPending || updateMutation.isPending}
        >
          {(mutation.isPending || updateMutation.isPending) && (
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          )}
          {mode === "edit"
            ? updateMutation.isPending
              ? "Updating..."
              : "Update"
            : mutation.isPending
              ? "Saving..."
              : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default AddProjectForm;
