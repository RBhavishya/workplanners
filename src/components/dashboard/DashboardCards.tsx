import BigCard from "@/components/core/Cards";
import { useNavigate } from "@tanstack/react-router";
import CountUp from "react-countup";
import { TotalTaskIcon } from "../icons/Dashboard/TotalTaskIcon";
import { CompletedIcon } from "../icons/Dashboard/CompletedIcon";
import { ProgressIcon } from "../icons/Dashboard/ProgressIcon";
import { PendingIcon } from "../icons/Dashboard/PendingIcon";
import { toast } from "sonner";

interface DashboardCardsProps {
  stats?: {
    total_tasks_count?: number;
    completed_tasks?: number;
    in_progress_tasks?: number;
    overdue_TasksCount?: number;
  };
  isError?: boolean;
  error?: {
    message?: string;
  };
}

export const DashboardCards = ({ stats, isError, error }: DashboardCardsProps) => {
  const navigate = useNavigate();
  const pageSizeParam = 25;

  const dashboardCards = [
    {
      title: "Total Tasks",
      value: stats?.total_tasks_count ?? 0,
      icon: <TotalTaskIcon />,
      status: "",
    },
    {
      title: "Completed Tasks",
      value: stats?.completed_tasks ?? 0,
      icon: <CompletedIcon />,
      status: "COMPLETED",
    },
    {
      title: "In Progress Tasks",
      value: stats?.in_progress_tasks ?? 0,
      icon: <ProgressIcon className = "text-blue-700"/>,
      status: "IN_PROGRESS",
    },
    {
      title: "Overdue Tasks",
      value: stats?.overdue_TasksCount ?? 0,
      icon: <PendingIcon />,
      status: "OVERDUE",
    },
  ];

  if(isError){
    toast.error(error?.message || "Something went wrong");
  }

  return (
    <div className="bg-white p-2 rounded-sm shadow-none mb-2">
      <div className="flex flex-wrap gap-3">
        {dashboardCards.map((card) => {
          const isActive =
            new URLSearchParams(location.search as string).get("task_status") ===
            card.status;

          return (
            <div
              key={card.title}
              className={`cursor-pointer ${
                isActive ? "border border-purple-600 rounded-md" : ""
              }`}
              onClick={() =>
                navigate({
                  to: "/tasks",
                  search: {
                    page: 1,
                    page_size: pageSizeParam,
                    task_status: card.status || undefined,
                  },
                })
              }
            >
              <BigCard
                title={card.title}
                value={<CountUp start={0} end={card.value} duration={1.5} />}
                icon={card.icon}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
