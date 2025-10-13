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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "../ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search as string);
  const pageSizeParam = Number(searchParams.get("page_size")) || 25;

  const [time, setTime] = useState(new Date());
  const [todayFilter, setTodayFilter] = useState<string>("");

  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update clock every second
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

  // Dashboard Stats
  const { data: stats, isError } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await getetDashboardStatsAPI();
      return response.data;
    },
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Today Stats
  const { data: todaystats } = useQuery({
    queryKey: ["todayStats"],
    queryFn: async () => {
      const response = await getTodayStatsAPI();
      return response.data;
    },
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Today Tasks with Infinite Scroll
  const {
    data: todaytasksPages,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["todayTasks", todayFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const queryParams: SettingsHistoryQueryParams = {
        pageIndex: pageParam,
        pageSize: pageSizeParam,
        task_status: todayFilter,
      };
      const response = await getTodayTasksAPI(queryParams);
      const tasks = response?.data?.data?.records || [];
      const pagination = response?.data?.data?.pagination_info || {
        current_page: pageParam,
        total_pages: 1,
      };
      return { tasks, pagination_info: pagination };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage?.pagination_info?.current_page <
      lastPage?.pagination_info?.total_pages
        ? lastPage.pagination_info.current_page + 1
        : undefined,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const todaytasks = todaytasksPages?.pages.flatMap((page) => page.tasks) || [];

  // Intersection Observer for Infinite Scroll
  const setupObserver = useCallback(() => {
    if (isFetchingNextPage || !hasNextPage) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: containerRef.current, rootMargin: "100px", threshold: 0.5 }
    );

    if (loadMoreRef.current) observer.current.observe(loadMoreRef.current);

    return () => observer.current?.disconnect();
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  useEffect(() => {
    const cleanup = setupObserver();
    return cleanup;
  }, [setupObserver]);

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
      title: "In Progress Task",
      value: stats?.in_progress_tasks ?? 0,
      icon: <ProgressIcon />,
      status: "IN_PROGRESS",
    },
    {
      title: "Overdue Tasks",
      value: stats?.overdue_TasksCount ?? 0,
      icon: <PendingIcon />,
      status: "OVERDUE",
    },
  ];

  return (
    <div className="p-0 flex">
      {/* Left Side - Cards & Table */}
      <div className="w-3/4 m-2">
        <div className="bg-white p-2 rounded-sm shadow-none mb-2">
          <div className="flex flex-wrap gap-3">
            {isError ? (
              <p className="text-red-500">Error loading stats</p>
            ) : (
              dashboardCards.map((card) => {
                const isActive =
                  new URLSearchParams(location.search as string).get(
                    "task_status"
                  ) === card.status;

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
                      value={
                        <CountUp start={0} end={card.value} duration={1.5} />
                      }
                      icon={card.icon}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        <Statisticstable />
      </div>

      {/* Right Side - Today’s Task */}
      <div className="w-1/3 bg-white rounded-none border-l p-2 flex flex-col h-[calc(100vh-60px)] overflow-auto">
        <h2 className="text-lg font-semibold">Task Tracker</h2>
        <p className="text-sm text-gray-500 mb-4">{formattedDate}</p>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4 text-sm font-medium">
          {[
            {
              label: "All",
              count: todaystats?.total_tasks_count ?? 0,
              status: "",
            },
            {
              label: "InProgress",
              count: todaystats?.in_progress_tasks ?? 0,
              status: "IN_PROGRESS",
            },
            {
              label: "Overdue",
              count: todaystats?.overdue_TasksCount ?? 0,
              status: "OVERDUE",
            },
            {
              label: "Completed",
              count: todaystats?.completed_tasks ?? 0,
              status: "COMPLETED",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`cursor-pointer p-1 rounded-md flex gap-1 ${
                todayFilter === item.status
                  ? "text-purple-600 font-semibold"
                  : "text-gray-600 font-normal"
              }`}
              onClick={() => setTodayFilter(item.status)}
            >
              {item.label}
              <span className="text-[11px] text-white rounded-lg px-2 py-0.5 bg-neutral-400 font-normal">
                <CountUp end={item.count} duration={1} />
              </span>
            </div>
          ))}
        </div>

        {/* Tasks List */}
        <div
          ref={containerRef}
          className="space-y-2 h-[calc(100vh-250px)] overflow-y-auto pr-2"
        >
          {isFetching ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="ml-2 text-sm text-gray-500">Loading tasks...</p>
            </div>
          ) : todaytasks.filter((task) =>
              todayFilter ? task.task_status === todayFilter : true
            ).length === 0 ? (
            <p className="text-sm text-gray-500 text-center">
              {todayFilter
                ? `No ${todayFilter.toLowerCase()} tasks today`
                : "No tasks for today"}
            </p>
          ) : (
            todaytasks
              .filter((task) =>
                todayFilter ? task.task_status === todayFilter : true
              )
              .map((task, index) => {
                const visibleUsers = task.users?.slice(0, 3) || [];
                const remainingUsers = task.users?.slice(3) || [];

                return (
                  <div
                    key={index}
                    className="flex items-start gap-2 py-2 border-b border-gray-100"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-600 capitalize text-sm 3xl:text-base">
                        {task.task_title}
                      </p>

                      {/* Due Date */}
                      <p className="text-[11px] font-normal text-gray-700">
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

                      {/* Assigned Users */}
                      {task.users && task.users.length > 0 && (
                        <div className="flex -space-x-2 items-center mt-1">
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
                                      <span key={u.user_id}>
                                        {u.display_name}
                                      </span>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Task Status Icon */}
                    <div
                      className={
                        task.task_status === "COMPLETED"
                          ? "text-green-500"
                          : [
                                "IN_PROGRESS",
                                "OVERDUE",
                                "REVIEW",
                                "NEW",
                              ].includes(task.task_status)
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
                );
              })
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
