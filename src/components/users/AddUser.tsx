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
  Loader2,
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

import {
  createProjectAPI,
  getAllUsersAPI,
  getProjectByIdAPI,
  updateProjectAPI,
} from "@/https/services/project";
import { toast } from "sonner";

export interface AddProjectFormProps {
  mode: "create" | "edit";
  nextId: number | null;
  projectId?: number;
  onSave?: (data: ProjectData) => void;
  onCancel?: () => void;
}

const AddUser = ({
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
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [assignedUsers, setAssignedUsers] = useState<number[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
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

  const handleNavigation = () => {
    navigate({ to: "/users" });
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
          <h2
            className={`text-lg font-semibold ml-30 ${
              mode === "edit" ? "text-gray-800" : "text-purple-600"
            }`}
          >
            {mode === "edit" ? "Edit Project" : "Add User"}
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
        <label className="text-sm font-medium">
          Name <span className="text-red-500">*</span>
        </label>
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
      <div className="flex gap-4 mb-4">
        {/* Email */}
        <div className="flex flex-col gap-2 w-1/2">
          <label className="text-sm font-medium">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-purple-500"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">
              {errors.email.join(", ")}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-2 w-1/2">
          <label className="text-sm font-medium">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-purple-500"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">
              {errors.phone.join(", ")}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-sm font-medium">
          Desigination <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Enter Designation"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-purple-500"
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title.join(", ")}</p>
        )}
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <label className="text-sm font-medium">
          Password<span className="text-red-500">*</span>
        </label>
        <input
          id="password"
          placeholder="Enter Password"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-purple-500"
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title.join(", ")}</p>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={handleNavigation}
          className="px-4 py-2 border rounded-lg text-purple-500 hover:bg-gray-100 cursor-pointer"
          disabled={mutation.isPending || updateMutation.isPending}
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer flex items-center gap-2"
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
        </button>
      </div>
    </div>
  );
};

export default AddUser;
