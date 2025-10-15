import { Eye, Edit, Trash } from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import dayjs from "dayjs";

const statusColors: Record<string, string> = {
  NEW: "bg-purple-100 text-purple-600",
  IN_PROGRESS: "bg-blue-100 text-blue-600",
  REVIEW: "bg-yellow-100 text-yellow-700",
  OVERDUE: "bg-red-100 text-red-600",
  COMPLETED: "bg-green-100 text-green-600",
};

export const getProjectColumns = (navigate: any, user: any, onDelete: any) => {
  return [
    {
      id: "serial",
      header: "S. No",
      accessorKey: "serial",
      cell: ({ row }: any) => row.original.serial,
      width: "50px",
      enableSorting: false,
    },
    {
      id: "title",
      header: "Project Name",
      accessorKey: "project_name",
      cell: ({ row }: any) => {
        const project = row.original;
        const name = project.project_name || "-";

        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-purple-400 flex items-center justify-center text-white font-normal shrink-0 text-sm">
              {name !== "-" ? name.charAt(0).toUpperCase() : "-"}
            </div>
            <p className="capitalize">{name}</p>
          </div>
        );
      },
      width: "350px",
    },
    {
      id: "users",
      header: "Assigned Users",
      accessorKey: "users",
      cell: ({ row }: any) => {
        const users = row.original.users || [];
        if (users.length === 0)
          return <span className="text-black-400 text-sm">-</span>;

        const visibleUsers = users.slice(0, 3);
        const remainingUsers = users.slice(3);

        return (
          <div className="flex -space-x-2 items-center">
            {visibleUsers.map((u: any) => (
              <div
                key={u.user_id}
                className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-[11px] font-medium text-white border-2 border-white"
                title={u.display_name}
              >
                {u.display_name.charAt(0).toUpperCase()}
              </div>
            ))}

            {remainingUsers.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-xs font-medium text-white border-2 border-white cursor-pointer">
                      +{remainingUsers.length}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    className="max-h-[150px] overflow-y-auto bg-white text-gray-700 rounded-md shadow-md p-2"
                    side="top"
                  >
                    <div className="flex flex-col gap-1">
                      {remainingUsers.map((u: any) => (
                        <span key={u.user_id} className="capitalize">
                          {u.display_name}
                        </span>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
      width: "180px",
      enableSorting: false,
    },
    {
      id: "start_date",
      header: "Start Date",
      accessorKey: "project_start_date",
      cell: ({ row }: any) => {
        const date = row.original.project_start_date;
        return <span>{date ? dayjs(date).format("DD-MM-YYYY") : "-"}</span>;
      },
      width: "150px",
    },
    {
      id: "due_date",
      header: "Due Date",
      accessorKey: "project_end_date",
      cell: ({ row }: any) => {
        const date = row.original.project_end_date;
        return <span>{date ? dayjs(date).format("DD-MM-YYYY") : "-"}</span>;
      },
      width: "150px",
    },
    {
      id: "project_status",
      header: "Status",
      accessorKey: "project_status",
      cell: ({ row }: any) => {
        const status = row.original.project_status?.toUpperCase();
        const cls = statusColors[status] || "bg-gray-100 text-gray-600";
        return (
          <span className={`px-3 py-1 rounded-md text-xs font-medium ${cls}`}>
           {status === 'IN_PROGRESS' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() || "-"}
          </span>
        );
      },
      width: "150px",
      enableSorting: false,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const project = row.original;
        return (
          <div className="flex gap-3">
            <Button
              title="View"
              className="p-0 text-gray-600 cursor-pointer"
              variant="ghost"
              onClick={() => navigate({ to: `/projects/${project.id}` })}
            >
              <Eye size={16} />
            </Button>
            {user?.user_type !== "EMPLOYEE" && (
              <>
                <Button
                  title="Edit"
                  className="p-0 text-gray-600 cursor-pointer"
                  variant="ghost"
                  onClick={() =>
                    navigate({ to: `/projects/edit/${project.id}` })
                  }
                >
                  <Edit size={16} />
                </Button>
                <Button
                  title="Delete"
                  className="p-0 text-gray-600 cursor-pointer"
                  variant="ghost"
                  onClick={() => onDelete(project)}
                >
                  <Trash size={16} />
                </Button>
              </>
            )}
          </div>
        );
      },
      width: "150px",
      enableSorting: false,
    },
  ];
};
