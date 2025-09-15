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
  width: "10px",
  maxWidth: "10px",
  minWidth: "10px",
  cell: (props: any) => (
    <div>{props.getValue()}</div>
  ),
},
  {
  accessorFn: (row: any) => row.task_title,
  id: "task_name",
  cell: (info: any) => {
    const title = info.getValue();
    return (
      <div className="flex items-center=">
        <span className="capitalize">{title || "-"}</span>
      </div>
    );
  },
  width: "40px",
  maxWidth: "40px",
  minWidth: "40px",
  header: () => (
     <div className="flex items-center justify-end pr-2">
    <span>Task Name</span>
  </div>
  ),
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
  width: "20px",
  maxWidth: "20px",
  minWidth: "20px",
  header: () => <span>Task Brief</span>,
  footer: (props: any) => props.column.id,
},
  {
  accessorFn: (row: any) => row.designation,
  id: "project_name",
  cell: (info: any) => {
    const title = info.getValue();
    return (
      <div style={{ textAlign: "left" }}>
        <span className="capitalize">{title || "-"}</span>
      </div>
    );
  },
  width: "30px",
  maxWidth: "30px",
  minWidth: "30px",
  header: () => (
    <div className="flex justify-center">
      <span>Project Name</span>
    </div>
  ),
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
  width: "50px",
  maxWidth: "50px",
  minWidth: "50px",
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
        width: "50px",
        maxWidth: "50px",
        minWidth: "50px",
        header: () => <span>Due Date</span>,
        footer: (props: any) => props.column.id,
      },
];
