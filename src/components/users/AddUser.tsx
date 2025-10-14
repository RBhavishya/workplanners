import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  createUserAPI,
  getusersByIdAPI,
  UserUpdateAPI,
} from "@/https/services/users"; // <-- make sure updateUserAPI exists
import {
  ArrowLeft,
  Check,
  CheckCircle,
  ChevronDown,
  Eye,
  EyeOff,
  MoveLeft,
  X,
} from "lucide-react";
import { ProjectData } from "@/interfaces/project";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";

export interface AddUserFormProps {
  mode: "create" | "edit";
  userId?: number;
  onSave?: (data: ProjectData) => void;
  onCancel?: () => void;
}

const AddUser = ({ userId, onSave, onCancel }: AddUserFormProps) => {
  const [name, setName] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [designation, setDesignation] = useState("");
  const [userType, setUserType] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
   const [rolePopoverOpen, setRolePopoverOpen] = useState(false);
  const [designationPopoverOpen, setDesignationPopoverOpen] = useState(false);
  const [designationTriggerWidth, setDesignationTriggerWidth] = useState<
    number | null
  >(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [open, setOpen] = useState(false);
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

  const triggerRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const id = params?.id ? Number(params.id) : null;
  const mode = id ? "edit" : "create";

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);

  const {
    data: userResp,
    isLoading: loadingUser,
    isError,
  } = useQuery({
    queryKey: ["users", id],
    queryFn: () => getusersByIdAPI(Number(id)),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      setFormError(null);
      setErrors({});
      return await createUserAPI(payload);
    },
    onSuccess: (res: any) => {
      toast.success(res?.data?.message || "User created successfully");
      setSuccessMessage("User created successfully!");
      onSave?.(res?.data?.data);
      setTimeout(() => navigate({ to: "/users" }), 1000);
    },
    onError: (error: any) => {
      setErrors({});
      setFormError(null);
      if (error?.status === 422 && error?.data?.errData) {
        setErrors(error.data.errData);
      } else {
        const message = error?.data?.message || "Failed to create user";
        toast.error(message);
        setFormError(message);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      setFormError(null);
      setErrors({});
      return await UserUpdateAPI(userId!, payload);
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(res?.data?.message || "User updated successfully");
      onSave?.(res?.data?.data);
      navigate({ to: "/users" });
    },
    onError: (error: any) => {
      setErrors({});
      setFormError(null);
      if (error?.status === 422 && error?.data?.errData) {
        setErrors(error.data.errData);
      } else {
        const message = error?.data?.message || "Failed to update user";
        toast.error(message);
        setFormError(message);
      }
    },
  });

  const handleSave = () => {
    setFormError(null);
    setErrors({});
    const payload: any = {
      display_name: name,
      password: password,
      email: email,
      phone: phone,
      designation: designation,
      user_type: userType,
    };
    if (mode === "edit") {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  useEffect(() => {
    if (mode === "edit" && userResp?.data?.data) {
      setName(userResp.data?.data.display_name);
      setPassword(userResp.data?.data.password);
      setDesignation(userResp.data?.data.designation);
      setEmail(userResp.data?.data.email);
      setPhone(userResp.data?.data.phone);
      setUserType(userResp.data?.data.user_type);
    }
  }, [userResp, mode]);

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleNavigation = () => {
    navigate({ to: "/users" });
  };

  const Form_STYLES = {
    label: "text-sm 3xl:!text-base font-normal text-neutral-500",
    input: "w-full text-sm 3xl:!text-base border border-purple-200 rounded-sm shadow-none bg-gray-50 p-2 focus:outline-none focus:ring-0 focus-visible:ring-0 placeholder:text-purple-300"
  }

  return (
    <div className="mt-6 p-4 bg-white shadow rounded-xl border-none max-w-120 mx-auto">
      <div className="flex items-center justify-start mb-4">
      <span className="flex items-center">
          <button
            onClick={handleNavigation}
            className="text-gray rounded cursor-pointer mr-2"
          >
            <ArrowLeft size={20} />
          </button>
        </span>
        <span>
          <h2
            className={`text-lg 3xl:!text-xl font-medium ${
              mode === "edit" ? "text-gray-800" : "text-purple-500"
            }`}
          >
            {mode === "edit" ? "Edit User" : "Add User"}
          </h2>
        </span>
      </div>

      {formError && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm 3xl:!text-base">
          {formError}
        </div>
      )}

      {/* Name */}
      <div className="flex flex-col gap-2 mb-4">
        <label className={Form_STYLES.label}>
          Name <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearFieldError("display_name");
          }}
          className={Form_STYLES.input}
        />
        {errors.display_name && (
          <p className="text-red-500 text-xs 3xl:!text-sm mt-1">
            {errors.display_name.join(", ")}
          </p>
        )}
      </div>

      {/* Email + Phone */}
      <div className="flex gap-4 mb-4">
        <div className="flex flex-col gap-2 w-1/2">
          <label className={Form_STYLES.label}>
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            id="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError("email");
            }}
            className={Form_STYLES.input}
          />
          {errors.email && (
            <p className="text-red-500 text-xs 3xl:!text-sm mt-1">
              {errors.email.join(", ")}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-1/2">
          <label className={Form_STYLES.label}>
            Phone <span className="text-red-500">*</span>
          </label>
          <Input
            id="phone"
            placeholder="Enter Phone Number"
            value={phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 10);
              setPhone(value);
              clearFieldError("phone");
            }}
            className={Form_STYLES.input}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs 3xl:!text-sm mt-1">
              {errors.phone.join(", ")}
            </p>
          )}
        </div>
      </div>
      {mode === "create" && (
        <div className="mb-4">
          <label className="block text-sm 3xl:!text-base mb-1 font-normal text-neutral-500">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative w-full">
            <Input
              className={Form_STYLES.input}
              id="password"
              placeholder="Enter Password"
              value={password}
              name="password"
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError("password");
              }}
              type="text"
              autoComplete="off"
              style={
                {
                  WebkitTextSecurity: passwordVisible ? "none" : "disc",
                } as any
              }
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-800 cursor-pointer"
            >
              {passwordVisible ? <Eye className="w-4 h-4 text-purple-300"/> : <EyeOff className="w-4 h-4 text-purple-300"/>}
            </button>
          </div>
          {errors?.password && (
            <p className="text-xs 3xl:!text-sm pt-1 text-red-600">{errors.password[0]}</p>
          )}
        </div>
      )}
      <div className="flex flex-col gap-2 mb-4">
        <label className={Form_STYLES.label}>
          Designation <span className="text-red-500">*</span>
        </label>
 
        <Popover
          open={designationPopoverOpen}
          onOpenChange={setDesignationPopoverOpen}
        >
          <PopoverTrigger asChild>
            <div
              ref={triggerRef}
              className="rounded border border-purple-200 bg-gray-50 flex items-center justify-between px-2 py-1.5 cursor-pointer"
            >
              {designation ? (
                <div className="flex items-center px-2 py-1 rounded bg-purple-100 text-sm 3xl:!text-base gap-1">
                  <span>{designation}</span>
                  {/* Optional clear button */}
                  <button type="button" onClick={() => setDesignation("")}>
                    <X className="w-3 h-3 text-gray-500 hover:text-gray-700" />
                  </button>
                </div>
              ) : (
                <span className="text-purple-300 !font-normal">Select designation...</span>
              )}
              <ChevronDown className="text-purple-300" strokeWidth={1.5}/>
            </div>
          </PopoverTrigger>

          <PopoverContent
            align="start" // align left to the trigger
            sideOffset={4} // optional spacing from trigger
            className="p-2 max-w-150"
          >
            <div className="max-h-40 overflow-y-auto">
              {["Frontend Developer", "Backend Developer", "QA", "Mobile Developer", "Designer", "UI Developer"].map((option) => (
                <div
                  key={option}
                  className="cursor-pointer p-1 rounded hover:bg-gray-100 flex items-center justify-between"
                  onClick={() => {
                    setDesignation(option);
                    setDesignationPopoverOpen(false);
                    clearFieldError("designation");
                  }}
                >
                  <span>{option}</span>
                  {designation === option && (
                    <Check className="w-4 h-4 text-purple-500" />
                  )}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {errors.designation && (
          <p className="text-red-500 text-xs 3xl:!text-sm mt-1">
            {errors.designation.join(", ")}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 mb-4">
        <label className={Form_STYLES.label}>
          Role <span className="text-red-500">*</span>
        </label>
 
        <Popover
          open={rolePopoverOpen}
          onOpenChange={setRolePopoverOpen}
        >
          <PopoverTrigger asChild>
            <div
              ref={triggerRef}
              className="rounded border border-purple-200 bg-gray-50 flex items-center justify-between px-2 py-1.5 cursor-pointer"
            >
              {userType ? (
                <div className="flex items-center px-2 py-1 rounded bg-purple-100 text-sm 3xl:!text-base gap-1">
                  <span>{userType}</span>
                  {/* Optional clear button */}
                  <button type="button" onClick={() => setUserType("")}>
                    <X className="w-3 h-3 text-gray-500 hover:text-gray-700" />
                  </button>
                </div>
              ) : (
                <span className="text-purple-300 !font-normal">Select role...</span>
              )}
              <ChevronDown className="text-purple-300" strokeWidth={1.5}/>
            </div>
          </PopoverTrigger>

          <PopoverContent
            align="start" // align left to the trigger
            sideOffset={4} // optional spacing from trigger
            className="p-2 max-w-150"
          >
            <div className="max-h-40 overflow-y-auto">
              {["Employee", "Team Lead"].map((option) => (
                <div
                  key={option}
                  className="cursor-pointer p-1 rounded hover:bg-gray-100 flex items-center justify-between"
                  onClick={() => {
                    setUserType(option);
                    setRolePopoverOpen(false);
                    clearFieldError("userType");
                  }}
                >
                  <span>{option}</span>
                  {userType === option && (
                    <Check className="w-4 h-4 text-purple-500" />
                  )}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {errors.user_type && (
          <p className="text-red-500 text-xs 3xl:!text-sm mt-1">
            {errors.user_type.join(", ")}
          </p>
        )}
      </div>
      {/* Buttons */}
      <div className="flex justify-end gap-2 mt-8">
        <Button
          onClick={handleNavigation}
          variant="outline"
          className="px-4 py-2 text-sm 3xl:!text-base border border-purple-300 rounded-sm text-purple-500 hover:bg-gray-100 cursor-pointer shadow-none font-normal"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          variant="default"
          className="px-6 py-2 text-sm 3xl:!text-base bg-purple-600 text-white rounded-sm hover:bg-purple-700 cursor-pointer flex items-center gap-2 shadow-none font-normal"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {(createMutation.isPending || updateMutation.isPending) && (
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
            : createMutation.isPending
              ? "Saving..."
              : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default AddUser;
