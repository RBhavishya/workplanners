import dayjs from "dayjs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

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
    width: "20px",
    maxWidth: "20px",
    minWidth: "20px",
    cell: (props: any) => (
      <div>{props.getValue()}</div>
    ),
  },
  {
    accessorFn: (row: any) => row.task_title,
    id: "task_title",
    header: () => (
      <div className="flex justify-center">
        <span>Task Name</span>
      </div>
    ),
    cell: (info: any) => {
      const title = info.getValue() || "-";
      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-purple-400 flex items-center justify-center text-white font-normal shrink-0 text-sm">
            {title !== "-" ? title.charAt(0).toUpperCase() : "-"}
          </div>

          {/* Tooltip for long text */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="capitalize font-medium truncate max-w-[150px] cursor-default"
                  title={title} // fallback for browsers without tooltip lib
                >
                  {title}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
    footer: (props: any) => props.column.id,
    width: 80,
    minWidth: 80,
    maxWidth: 80,
  },
  {
    accessorFn: (row: any) => row.project?.title,
    id: "project_name",
    cell: (info: any) => {
      const title = info.getValue();
      return (
        <div>
          <span className="capitalize">{title || "-"}</span>
        </div>
      );
    },
    width: "100px",
    maxWidth: "100px",
    minWidth: "100px",
    header: () => (
      <div className="flex justify-center">
        <span>Project Name</span>
      </div>
    ),
    footer: (props: any) => props.column.id,
  },
  {
    accessorFn: (row: any) => row.task_status,
    id: "task_status",
    cell: (info: any) => {
      const status = info.getValue();
      const colorClass =
        statusColors[status?.toUpperCase()] || "bg-gray-100 text-gray-600";

      return (
        <div className="flex justify-start">
          <span
            className={`px-2 py-0.5 rounded-md !text-xs font-medium capitalize ${colorClass}`}
          >
            {status || "-"}
          </span>
        </div>
      );
    },
    width: "70px",
    maxWidth: "70px",
    minWidth: "70px",
    header: () => <span>Status</span>,
    footer: (props: any) => props.column.id,
  },
  {
    accessorFn: (row: any) => row.start_date,
    id: "start_date",
    cell: (info: any) => {
      const date: string = info.getValue();
      return <span>{date ? dayjs(date).format("DD-MM-YYYY") : "-"}</span>;
    },
    width: "90px",
    maxWidth: "90px",
    minWidth: "90px",
    header: () => <span>Start Date</span>,
    footer: (props: any) => props.column.id,
  },
  {
    accessorFn: (row: any) => row.end_date,
    id: "end_date",
    cell: (info: any) => {
      const date: string = info.getValue();
      return <span>{date ? dayjs(date).format("DD-MM-YYYY") : "-"}</span>;
    },
    width: "50px",
    maxWidth: "50px",
    minWidth: "50px",
    header: () => <span>Due Date</span>,
    footer: (props: any) => props.column.id,
  },
];
