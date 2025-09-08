import {
  Search,
  ClipboardList,
  ClipboardCheck,
  ClipboardPenLine,
  FileClock,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query"; // ✅ import react-query
import Statisticstable from "./Statisticstable";
import BigCard from "@/components/core/Cards";
import { getetDashboardStatsAPI } from "@/https/services/dashboard";
import CountUp from "react-countup";


const Dashboard = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  // Month pickers
  const [startMonth, setStartMonth] = useState<Date | null>(new Date());
  const [endMonth, setEndMonth] = useState<Date | null>(new Date());

  // Live clock
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

  // ✅ Fetch dashboard stats

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await getetDashboardStatsAPI();
      return response.data;
    },
  });
  return (
    <div className="p-4">
      {/* Search + Clock */}
      <div className="flex items-center mb-6 w-full">
        <div className="flex items-center w-3/4 rounded-full border border-gray-300 bg-gray-50 px-4 py-3 shadow-sm">
          <Search className="w-5 h-5 text-gray-500 mr-3" />
          <input
            type="text"
            placeholder="Find your Task, Projects.."
            className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-500"
          />
        </div>

        <div className="h-10 w-px bg-gray-300 mx-6"></div>

        <div className="flex flex-col justify-around w-1/4">
          <span className="text-lg font-semibold">{formattedTime}</span>
          <span className="text-sm text-gray-500">{formattedDate}</span>
        </div>
      </div>

      <div className="w-full h-7 border-t border-gray-200"></div>

      {/* Cards + Month Pickers */}
      <div className="w-3/4">
        <div className="bg-white p-2 rounded-xl shadow gap-2">
          {/* Month Range Picker */}
          <div className="flex justify-end py-2">
            <div
              className="inline-flex rounded items-center gap-4"
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #D5B8FF",
                background: "#FFF",
              }}
            >
              <div>
                <label className="block text-sm mb-1">Start Month</label>
                <DatePicker
                  selected={startMonth}
                  onChange={(date) => setStartMonth(date)}
                  dateFormat="MMM yyyy"
                  showMonthYearPicker
                  className="border rounded p-2"
                />
              </div>
              <span className="font-medium">to</span>
              <div>
                <label className="block text-sm mb-1">End Month</label>
                <DatePicker
                  selected={endMonth}
                  onChange={(date) => setEndMonth(date)}
                  dateFormat="MMM yyyy"
                  showMonthYearPicker
                  className="border rounded p-2"
                />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
         <div className="flex rounded gap-4">
  <div className="flex flex-wrap gap-4">
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
          icon={<ClipboardList />}
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
          icon={<ClipboardCheck />}
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
          icon={<ClipboardPenLine />}
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
          icon={<FileClock />}
        />
      </>
    )}
  </div>
</div>
        </div>

        {/* Table */}
        <Statisticstable />
      </div>
    </div>
  );
};

export default Dashboard;
