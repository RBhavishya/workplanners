import dayjs from "dayjs";
import { Edit, Eye, Trash } from "lucide-react";


const statusColors: Record<string, string> = {
  NEW: "bg-purple-100 text-purple-600",
  IN_PROGRESS: "bg-blue-100 text-blue-600",
  REVIEW: "bg-yellow-100 text-yellow-700",
  OVERDUE: "bg-red-100 text-red-600",
  COMPLETED: "bg-green-100 text-green-600",
};

export const taskColumns = [
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
    accessorFn: (row: any) => row.task_title,
    id: "task_name",
    cell: (info: any) => {
      const title = info.getValue();
      const profilePicUrl = info.row.original.profile_pic_url;
      return (
        <div
          style={{ display: "flex", alignItems: "center", textAlign: "left" }}
        >
          {profilePicUrl ? (
            <img
              src={profilePicUrl}
              alt="Profile"
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                marginRight: 8,
              }}
            />
          ) : (
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                backgroundColor: "#ccc",
                marginRight: 8,
              }}
            />
          )}
          <span className="capitalize">{title ? title : "-"}</span>
        </div>
      );
    },
    width: "150px",
    maxWidth: "150px",
    minWidth: "150px",
    header: () => <span>Task Name</span>,
    footer: (props: any) => props.column.id,
  },
{
  accessorFn: (row: any) => row.description,
  id: "task_brief",
  cell: (info: any) => {
    const title = info.getValue();
    return (
      <span
        className="truncate block max-w-[200px]"
        title={title || "-"}
      >
        {title ? title : "-"}
      </span>
    );
  },
  width: "200px",
  maxWidth: "200px",
  minWidth: "200px",
  header: () => <span>Task Brief</span>,
  footer: (props: any) => props.column.id,
},
  {
    accessorFn: (row: any) => row.designation,
    id: "project_name",
    cell: (info: any) => {
      let title = info.getValue();
      return (
        <div style={{ textAlign: "left" }}>
          <span className="capitalize">{title ? title : "-"}</span>
        </div>
      );
    },
    width: "120px",
    maxWidth: "120px",
    minWidth: "120px",
    header: () => <span>Project Name</span>,
    footer: (props: any) => props.column.id,
  },
{
  accessorFn: (row: any) => row.task_status,
  id: "status",
  cell: (info: any) => {
    const status = info.getValue();
    const colorClass = statusColors[status?.toUpperCase()] || "bg-gray-100 text-gray-600";

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
  width: "120px",
  maxWidth: "120px",
  minWidth: "120px",
  header: () => <span>Status</span>,
  footer: (props: any) => props.column.id,
},
 {
        accessorFn: (row: any) => row.end_date,
        id: "end_date",
        cell: (info: any) => {
          const date: string = info.getValue();
          return <span>{date ? dayjs(date).format("MM-DD-YYYY") : "-"}</span>;
        },
        width: "90px",
        maxWidth: "90px",
        minWidth: "90px",
        header: () => <span>Due Date</span>,
        footer: (props: any) => props.column.id,
      },
];
