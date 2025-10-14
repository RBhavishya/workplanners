import { updateUserStatusAPI } from "@/https/services/users";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-600",
  INACTIVE: "bg-red-100 text-red-600",
};

export const usersColumns = [
  {
    accessorFn: (row: any) => row.serial,
    id: "serial",
    header: () => <span>S.No</span>,
    footer: (props: any) => props.column.id,
    width: "50px",
    maxWidth: "50px",
    minWidth: "50px",
    cell: (props: any) => (
      <div className="pl-2">{props.getValue()}</div>
    ),
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
        <div className="flex items-center gap-2" style={{ textAlign: "left" }}>
          <div className="w-6 h-6 rounded bg-purple-400 flex items-center justify-center text-white font-normal shrink-0 text-sm">
            {title !== "-" ? title.charAt(0).toUpperCase() : "-"}
          </div>
          <span className="capitalize font-medium">{title}</span>
        </div>
      );
    },
    footer: (props: any) => props.column.id,
    width: "150px",
    maxWidth: "150px",
    minWidth: "150px",
  },
  {
    accessorFn: (row: any) => row.designation,
    id: "designation",
    cell: (info: any) => {
      const title = info.getValue();
      return (
        <div style={{ textAlign: "left" }}>
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
      const title = info.getValue();
      return (
        <div>
          <span>{title.charAt(0).toUpperCase() + title.slice(1).toLowerCase() || "-"}</span>
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
          <span>{title || "-"}</span>
        </div>
      );
    },
    width: "200px",
    maxWidth: "200px",
    minWidth: "200px",
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
    width: "130px",
    maxWidth: "130px",
    minWidth: "130px",
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

      useEffect(() => {
        const handleClickOutside = (event: any) => {
          if (
            popoverRef.current &&
            !popoverRef.current.contains(event.target)
          ) {
            setIsOpen(false);
          }
        };

        if (isOpen) {
          document.addEventListener("mousedown", handleClickOutside);
        } else {
          document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, [isOpen]);

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              color: isActive ? "#28A745" : "#A71D2A",
              background: isActive ? "#28A74533" : "#A71D2A33",
            }}
            className="rounded-full cursor-pointer flex items-center py-0 px-3 min-w-[100px]"
            onClick={togglePopover}
          >
            <span
              style={{
                height: "8px",
                width: "8px",
                borderRadius: "50%",
                backgroundColor: isActive ? "green" : "red",
                marginRight: "8px",
              }}
            ></span>
            {isActive ? "Active" : "Inactive"}
          </div>
          {isOpen && (
            <div
              ref={popoverRef}
              style={{
                position: "absolute",
                top: "100%",
                left: "0",
                marginTop: "5px",
                padding: "5px",
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                zIndex: 100,
              }}
            >
              <div
                style={{
                  padding: "5px 10px",
                  cursor: "pointer",
                  color: "green",
                }}
                onClick={() => updateUserStatus(true)}
              >
                Active
              </div>
              <div
                style={{
                  padding: "5px 10px",
                  cursor: "pointer",
                  color: "red",
                }}
                onClick={() => updateUserStatus(false)}
              >
                Inactive
              </div>
            </div>
          )}
        </div>
      );
    },
    width: "100px",
    maxWidth: "115px",
    minWidth: "150px",
    header: () => <span>Status</span>,
    footer: (props: any) => props.column.id,
  },
];
