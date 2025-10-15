import { updateUserStatusAPI } from "@/https/services/users";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TruncatedText } from "../core/TruncatedText";

export const usersColumns = [
  {
    accessorFn: (row: any) => row.serial,
    id: "serial",
    header: () => <span>S.No</span>,
    footer: (props: any) => props.column.id,
    width: "50px",
    maxWidth: "50px",
    minWidth: "50px",
    cell: (props: any) => <div className="pl-2">{props.getValue()}</div>,
  },
  {
    accessorFn: (row: any) => row.display_name,
    id: "display_name",
    header: () => (
      <div className="flex justify-center">
        <span>User Name</span>
      </div>
    ),
    cell: (info: any) => {
      const title = info.getValue() || "-";
      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-purple-400 flex items-center justify-center text-white font-normal shrink-0 text-sm">
            {title !== "-" ? title.charAt(0).toUpperCase() : "-"}
          </div>
          <span className="capitalize font-medium">{title}</span>
        </div>
      );
    },
    footer: (props: any) => props.column.id,
    width: "200px",
    maxWidth: "200px",
    minWidth: "200px",
  },
  {
    accessorFn: (row: any) => row.designation,
    id: "designation",
    cell: (info: any) => {
      const title = info.getValue();
      return (
        <div>
          <span className="capitalize">{title || "-"}</span>
        </div>
      );
    },
    width: "120px",
    maxWidth: "120px",
    minWidth: "120px",
    header: () => (
      <div className="flex justify-center">
        <span>Designation</span>
      </div>
    ),
    footer: (props: any) => props.column.id,
  },

  {
    accessorFn: (row: any) => row.user_type,
    id: "user_type",
    cell: (info: any) => {
      const title = info.getValue() || "";
      // Convert "team_lead" -> "Teamlead"
      const formattedTitle = title
        .split("_")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" "); // join without space
      return (
        <div>
          <span>{formattedTitle || "-"}</span>
        </div>
      );
    },
    width: "80px",
    maxWidth: "80px",
    minWidth: "80px",
    header: () => (
      <div className="flex justify-center">
        <span>Role</span>
      </div>
    ),
    footer: (props: any) => props.column.id,
  },

  {
    accessorFn: (row: any) => row.email,
    id: "email",
    cell: (info: any) => {
      const title = info.getValue();
      return (
        <div style={{ textAlign: "left" }}>
          <span>
            <TruncatedText text={title || "-"} /></span>
        </div>
      );
    },
    width: "150px",
    maxWidth: "150px",
    minWidth: "150px",
    header: () => (
      <div className="flex justify-center">
        <span>Email</span>
      </div>
    ),
    footer: (props: any) => props.column.id,
  },
  {
    accessorFn: (row: any) => row.phone,
    id: "phone",
    cell: (info: any) => {
      const title = info.getValue();
      return (
        <div className="text-left">
          <span className="capitalize">{title || "-"}</span>
        </div>
      );
    },
    width: "100px",
    maxWidth: "100px",
    minWidth: "100px",
    header: () => (
      <div className="flex justify-center">
        <span>Phone Number</span>
      </div>
    ),
    footer: (props: any) => props.column.id,
  },
  {
    accessorFn: (row: any) => row.user_status,
    id: "user_status",
    cell: (info: any) => {
      const [isActive, setIsActive] = useState(info.getValue() === "ACTIVE");
      const [isOpen, setIsOpen] = useState(false);
      const popoverRef = useRef<HTMLDivElement>(null);
      const userId = info.row.original.id;
      const togglePopover = () => setIsOpen(!isOpen);
      const queryClient = useQueryClient();
      const [loading, setLoading] = useState(false);
      const updateUserStatus = async (status: boolean) => {
        try {
          setLoading(true);
          const body = {
            user_status: status ? "ACTIVE" : "INACTIVE",
          };

          const response = await updateUserStatusAPI(userId, body);
          if (response?.status === 200 || response?.status === 201) {
            toast.success(
              status
                ? "User activated successfully"
                : "User deactivated successfully"
            );
            setIsActive(status);
            queryClient.invalidateQueries({ queryKey: ["users"] });
          } else {
            toast.error("Failed to change status");
          }
        } catch (err: any) {
          toast.error(err?.message || "Something went wrong");
          console.error(err);
        } finally {
          setLoading(false);
          setIsOpen(false);
        }
      };
      useEffect(() => {
        setIsActive(info.getValue() === "ACTIVE");
      }, [info.getValue()]);

      return (
        <div className="flex items-center relative">
      <Select
        value={isActive ? "active" : "inactive"}
        onValueChange={(value) => updateUserStatus(value === "active")}
      >
        <SelectTrigger
          className={`w-fit !h-5 text-xs rounded-full border-none cursor-pointer flex items-center gap-1 ${
            isActive
              ? "text-green-600 bg-emerald-100"
              : "text-red-600 bg-red-100"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isActive ? "bg-green-600" : "bg-red-600"
            }`}
          ></span>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>

        <SelectContent align="start" className="w-fit">
          <SelectItem
            value="active"
            className="text-green-600 cursor-pointer hover:bg-gray-100 rounded"
          >
            Active
          </SelectItem>
          <SelectItem
            value="inactive"
            className="text-red-600 cursor-pointer hover:bg-gray-100 rounded"
          >
            Inactive
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
      );
    },
    width: "80px",
    maxWidth: "80px",
    minWidth: "80px",
    header: () => <span>Status</span>,
    footer: (props: any) => props.column.id,
  },
];
