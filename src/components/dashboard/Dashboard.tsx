import BigCard from "@/components/core/Cards";
import {
  getetDashboardStatsAPI,
  getTodayStatsAPI,
  getTodayTasksAPI,
  SettingsHistoryQueryParams,
} from "@/https/services/dashboard";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import CountUp from "react-countup";
import { ClockIcon } from "../icons/ClockIcon";
import { CompletedIcon } from "../icons/Dashboard/CompletedIcon";
import { PendingIcon } from "../icons/Dashboard/PendingIcon";
import { ProgressIcon } from "../icons/Dashboard/ProgressIcon";
import { TotalTaskIcon } from "../icons/Dashboard/TotalTaskIcon";
import { GreenThickIcon } from "../icons/GreenThickIcon";
import Statisticstable from "./Statisticstable";

const Dashboard = () => {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const pageIndexParam = Number(searchParams.get("current_page")) || 1;
  const pageSizeParam = Number(searchParams.get("page_size")) || 25;
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [time, setTime] = useState(new Date());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toLocaleTimeString("en-GB");
  const options: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "2-digit",
  month: "short",
};

const parts = time.toLocaleDateString("en-GB", options).split(" ");
const formattedDate = `${parts[0]}, ${parts[1]} ${parts[2]}`;

  const {
    data: stats,
    isError,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await getetDashboardStatsAPI();
      return response.data;
    },
  });

  const { data: todaystats } = useQuery({
    queryKey: ["todayStats"],
    queryFn: async () => {
      const response = await getTodayStatsAPI();
      return response.data;
    },
  });

  const {
    data: todaytasksPages,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["todayTasks"],
    queryFn: async ({ pageParam = 1 }) => {
      const queryParams: SettingsHistoryQueryParams = {
        pageIndex: pageParam,
        pageSize: pageSizeParam,
      };
      const response = await getTodayTasksAPI(queryParams);
      const tasks = response?.data?.data?.records || [];
      const pagination = response?.data?.data?.pagination_info || {
        current_page: pageParam,
        page_size: pageSizeParam,
        total_pages: 1,
        total_records: 0,
      };
      return { tasks, pagination_info: pagination };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination_info) return undefined;
      if (
        lastPage.pagination_info.current_page <
        lastPage.pagination_info.total_pages
      ) {
        return lastPage.pagination_info.current_page + 1;
      }
      return undefined;
    },
  });

  const todaytasks = todaytasksPages?.pages.flatMap((page) => page.tasks) || [];
  const containerRef = useRef<HTMLDivElement>(null);
  const setupObserver = useCallback(() => {
    if (isFetchingNextPage || !hasNextPage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: containerRef.current,
        rootMargin: "100px",
        threshold: 0.5,
      }
    );

    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  useEffect(() => {
    const cleanup = setupObserver();
    if (!isFetchingNextPage && open) {
      const timer = setTimeout(() => {
        setupObserver();
      }, 300);

      return () => {
        clearTimeout(timer);
        cleanup && cleanup();
      };
    }

    return cleanup;
  }, [setupObserver, isFetchingNextPage]);

  return (
    <div className="p-0 flex gap-2">
      <div className="w-3/4 m-2">
        <div className="bg-white p-2 rounded-sm shadow-none mb-2">
          <div className="flex flex-wrap gap-3">
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
                  icon={<TotalTaskIcon />}
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
                  icon={<ProgressIcon />}
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

        {/* Table */}
        <Statisticstable />
      </div>

      {/* Right side - Today’s Task */}
      <div className="w-1/3 bg-white rounded-none border-l p-2 flex flex-col overflow-auto ">
        <h2 className="text-lg font-semibold mb-1">Today’s Task</h2>
        <p className="text-sm text-gray-500 mb-4">{formattedDate}</p>
        <div className="flex items-center gap-3 mb-4 text-sm font-medium">
          <span className="text-purple-600 font-normal">
            All{" "}
            <span className="text-[11px] text-white rounded-full px-2.5 py-0.5 bg-neutral-400 font-normal">
              <CountUp end={todaystats?.total_tasks_count ?? 0} duration={1} />
            </span>
          </span>

          <span className="text-gray-600 font-normal">
            InProgress{" "}
            <span className="text-[11px] text-white rounded-full px-2.5 py-0.5 bg-neutral-400 font-normal">
              <CountUp end={todaystats?.in_progress_tasks ?? 0} duration={1} />
            </span>
          </span>

          <span className="text-gray-600 font-normal">
            Completed{" "}
            <span className="text-[11px] text-white rounded-full px-2.5 py-0.5 bg-neutral-400 font-normal">
              <CountUp end={todaystats?.completed_tasks ?? 0} duration={1} />
            </span>
          </span>

          <span className="text-gray-600 font-normal">
            Pending{" "}
            <span className="text-[11px] text-white rounded-full px-2.5 py-0.5 bg-neutral-400 font-normal">
              <CountUp end={todaystats?.overdue_TasksCount ?? 0} duration={1} />
            </span>
          </span>
        </div>

        <div ref={containerRef} className="space-y-4 overflow-y-auto pr-2">
          {isFetching && !isFetchingNextPage ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="ml-2 text-sm text-gray-500">Loading tasks...</p>
            </div>
          ) : !todaytasks?.length ? (
            <p className="text-sm text-gray-500 text-center">
              No tasks for today
            </p>
          ) : (
            todaytasks.map((task: any, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{task.task_title}</p>
                  <p className="text-xs font-medium text-gray-700">
                    Due Date:{" "}
                    <span className="text-gray-500 font-normal">
                      {task.end_date
                        ? new Date(task.end_date).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "No due date"}
                    </span>
                  </p>
                </div>

                <div
                  className={
                    task.task_status === "COMPLETED"
                      ? "text-green-500"
                      : task.task_status === "IN PROGRESS" ||
                          task.task_status === "OVERDUE" ||
                          task.task_status === "REVIEW" ||
                          task.task_status === "NEW"
                        ? "text-yellow-500"
                        : "text-gray-400"
                  }
                >
                  {task.task_status === "COMPLETED" ? (
                    <GreenThickIcon className="w-4 h-4" />
                  ) : (
                    <ClockIcon className="w-4 h-4" />
                  )}
                </div>
              </div>
            ))
          )}

          <div
            ref={loadMoreRef}
            className="min-h-[100px] flex justify-center items-center"
          >
            {isFetchingNextPage && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
