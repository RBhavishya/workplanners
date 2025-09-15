import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Statisticstable from "./Statisticstable";
import BigCard from "@/components/core/Cards";
import { getetDashboardStatsAPI } from "@/https/services/dashboard";
import CountUp from "react-countup";
import { TasksIcon } from "../icons/TasksIcon";
import { InProgressIcon } from "../icons/InProgressIcon";
import { PendingIcon } from "../icons/PendingIcon";
import { CompletedIcon } from "../icons/CompletedIcon";

const Dashboard = () => {
  const [time, setTime] = useState(new Date());
  const [startMonth, setStartMonth] = useState<Date | null>(new Date());
  const [endMonth, setEndMonth] = useState<Date | null>(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toLocaleTimeString("en-GB");
  const formattedDate = time.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });

  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await getetDashboardStatsAPI();
      return response.data;
    },
  });
  return (
    <div>
      <div className="w-3/4">
        <div className="bg-white p-2 rounded-xl shadow-none gap-2">
          <div className="flex justify-end py-1 mb-2">
            <div className="inline-flex rounded items-center gap-4 border p-1 border-violet-300">
              <div>
                <DatePicker
                  selected={startMonth}
                  onChange={(date) => setStartMonth(date)}
                  dateFormat="MMM yyyy"
                  showMonthYearPicker
                  className="border rounded max-w-20 text-center bg-[rgba(237,239,252,0.80)] text-purple-700 text-sm 3xl:!text-base"
                />
                <span> -- </span>
                <DatePicker
                  selected={endMonth}
                  onChange={(date) => setEndMonth(date)}
                  dateFormat="MMM yyyy"
                  showMonthYearPicker
                  className="border rounded max-w-20 text-center bg-[rgba(237,239,252,0.80)] text-purple-700 text-sm 3xl:!text-base"
                />
              </div>
            </div>
          </div>

          <div className="flex rounded gap-4">
            <div className="flex flex-wrap gap-4 mx-auto">
              {isError ? (
                <p className="text-red-500">Error loading stats</p>
              ) : (
                <>
                  <BigCard
                    title="Total Tasks"
                    value={
                      <CountUp
                        start={0}
                        end={stats?.total_tasks_count ?? 0}
                        duration={1.5}
                      />
                    }
                    icon={<TasksIcon />}
                  />
                  <BigCard
                    title="Completed Tasks"
                    value={
                      <CountUp
                        start={0}
                        end={stats?.completed_tasks ?? 0}
                        duration={1.5}
                      />
                    }
                    icon={<CompletedIcon />}
                  />
                  <BigCard
                    title="In Progress Task"
                    value={
                      <CountUp
                        start={0}
                        end={stats?.in_progress_tasks ?? 0}
                        duration={1.5}
                      />
                    }
                    icon={<InProgressIcon />}
                  />
                  <BigCard
                    title="Pending Tasks"
                    value={
                      <CountUp
                        start={0}
                        end={stats?.overdue_TasksCount ?? 0}
                        duration={1.5}
                      />
                    }
                    icon={<PendingIcon />}
                  />
                </>
              )}
            </div>
          </div>
        </div>
        <Statisticstable />
      </div>
    </div>
  );
};

export default Dashboard;
