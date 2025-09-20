import dayjs from "dayjs";
import { Edit, Eye, Trash } from "lucide-react";

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
      <div style={{ textAlign: "center" }}>{props.getValue()}</div>
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
      const title = info.getValue() || "-"; // fallback
      return (
        <div className="flex items-center gap-2" style={{ textAlign: "left" }}>
          <div className="w-8 h-8 rounded-md bg-purple-500 flex items-center justify-center text-white font-bold">
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
        <div style={{ textAlign: "left" }}>
          <span className="capitalize">{title || "-"}</span>
        </div>
      );
    },
   width: "80px",
    maxWidth: "80px",
    minWidth: "80px",
    header: () => (
      <div className="flex justify-center">
        <span>User Type</span>
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
          <span className="capitalize">{title || "-"}</span>
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
      const status = info.getValue();
      const colorClass =
        statusColors[status?.toUpperCase()] || "bg-gray-100 text-gray-600";

      return (
        <div className="flex justify-start">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${colorClass}`}
          >
            {status ? status.replace("_", " ") : "-"}
          </span>
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
