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
  CheckCircle,
  MoveLeft,
  Check,
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
import { ProjectData, UsersDropdownResponse } from "@/interfaces/project";

import { createProjectAPI, getAllUsersAPI, getProjectByIdAPI, updateProjectAPI } from "@/https/services/project";
import { toast } from "sonner";

export interface AddProjectFormProps {
  mode: "create" | "edit";
  nextId: number | null;
  projectId?: number;
  onSave?: (data: ProjectData) => void;
  onCancel?: () => void;
}

const AddProjectForm = ({
  mode,
  nextId,
  projectId,
  onSave,
  onCancel,
}: AddProjectFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [assignedUsers, setAssignedUsers] = useState<number[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
    queryFn: () => getAllUsersAPI(search),
    enabled: true,
  });

  const mutation = useMutation({
  mutationFn: (newProject: ProjectData) => createProjectAPI(newProject),
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ["projects"] });

    // ✅ Success toast
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
});

const updateMutation = useMutation({
  mutationFn: (updatedProject: ProjectData) =>
    updateProjectAPI(projectId!, updatedProject),
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["project", projectId] });
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
});
  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

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
    const projectData: ProjectData = {
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

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLinks([]);
    setLinkInput("");
    setStartDate(undefined);
    setDueDate(undefined);
    setAssignedUsers([]);
    setSearch("");
    setFormError(null);
    setErrors({});
  };

  const handleNavigation = () => {
    navigate({ to: "/projects" });
  };

  return (
    <div className="mt-6 ml-62 p-6 bg-white shadow rounded-xl border max-w-lg">
      <div className="flex items-center justify-start gap-3 mb-4">
        <span>
          <button
            onClick={handleNavigation}
            className="px-2 py-2 text-gray rounded cursor-pointer"
          >
            <MoveLeft className="mr-2" size={20} />
          </button>
        </span>
        <span>
          <h2 className="text-lg font-semibold ml-30">
            {mode === "edit" ? "Edit Project" : "Add Project"}
          </h2>
        </span>
      </div>
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
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-sm font-medium">Project Title</label>
        <input
          type="text"
          placeholder="Enter Project Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-purple-500"
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title.join(", ")}</p>
        )}
      </div>
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-sm font-medium">Project Description</label>
        <textarea
          placeholder="Enter Project Description"
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
      <div className="flex gap-4 mb-4">
        {/* Start Date Picker */}
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-sm font-medium">Start Date</label>
          <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  "w-full flex items-center gap-2 border rounded-lg p-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors",
                  !startDate && "text-muted-foreground"
                )}
                onClick={() => setStartDateOpen(true)}
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
                className="rounded-md border bg-white shadow-sm"
              />
            </PopoverContent>
          </Popover>
          {errors?.start_date && (
            <p className="text-red-500 text-xs mt-1">
              {errors.start_date.join(", ")}
            </p>
          )}
        </div>

        {/* Due Date Picker */}
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-sm font-medium">Due Date</label>
          <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  "w-full flex items-center gap-2 border rounded-lg p-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors",
                  !dueDate && "text-muted-foreground",
                  !startDate && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => startDate && setDueDateOpen(true)}
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
                className="rounded-md border bg-white shadow-sm"
              />
            </PopoverContent>
          </Popover>
          {errors?.due_date && (
            <p className="text-red-500 text-xs mt-1">
              {errors.due_date.join(", ")}
            </p>
          )}
        </div>
      </div>
      {mode === "create" && (
        <div className="flex flex-col gap-2 mb-4">
          <label className="text-sm font-medium">Assign Users</label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div
                ref={triggerRef}
                className="rounded border flex items-center justify-between px-2 py-2 cursor-pointer"
              >
                <div className="flex flex-wrap gap-1">
                  {assignedUsers.length === 0 ? (
                    <span className="text-gray-400">Select users...</span>
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
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList className="max-h-60 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-2 text-gray-500">Loading...</div>
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
          {errors.assigned_users && (
            <p className="text-red-500 text-xs mt-1">
              {errors.assigned_users.join(", ")}
            </p>
          )}
        </div>
      )}
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-sm font-medium">Project Reference Links</label>
        <div className="border rounded-lg p-2 flex flex-wrap gap-2 min-h-[48px]">
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
          <input
            type="text"
            placeholder="Add a link and press Enter"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={handleAddLink}
            className="flex-1 outline-none bg-transparent text-sm"
          />
        </div>
        {errors.links && (
          <p className="text-red-500 text-xs mt-1">{errors.links.join(", ")}</p>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={handleNavigation}
          className="px-4 py-2 border rounded-lg text-purple-500 hover:bg-gray-100 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer"
          disabled={mutation.isPending || updateMutation.isPending}
        >
          {mode === "edit"
            ? updateMutation.isPending
              ? "Updating..."
              : "Update"
            : mutation.isPending
              ? "Saving..."
              : "Save"}
        </button>
      </div>
    </div>
  );
};

export default AddProjectForm;
