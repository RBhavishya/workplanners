import {
  getDashboardStatistics,
  getDashboardStatsAPI,
  getTodayStatsAPI,
  getTodayTasksAPI,
  SettingsHistoryQueryParams,
} from "@/https/services/dashboard";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import CountUp from "react-countup";
import { ClockIcon } from "../icons/ClockIcon";
import { GreenThickIcon } from "../icons/GreenThickIcon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "../ui/button";
import { addSerial } from "@/lib/helpers/addSerial";
import { getStatisticsColumns } from "./StatisticsColumns";
import TanStackTable from "../core/Tanstacktable";
import SearchFilter from "../core/SearchFilter";
import { DashboardCards } from "./DashboardCards";
import { useDebounce } from "@/lib/helpers/useDebounce";
import dayjs from "dayjs";
import { NoDataIcon } from "../icons/NoIcons/NoDataIcon";

const Dashboard = () => {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search as string);
  const pageSizeParam = Number(searchParams.get("page_size")) || 25;
  const [time, setTime] = useState(new Date());
  const [todayFilter, setTodayFilter] = useState<string>("");
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 25 });
  const [searchString, setSearchString] = useState("");
  const debounceSearch = useDebounce(searchString, 500);

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
    error,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await getDashboardStatsAPI();
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

  const { data, isLoading } = useQuery({
    queryKey: [
      "dashboard-stats",
      pagination.pageIndex,
      pagination.pageSize,
      debounceSearch,
    ],
    queryFn: () =>
      getDashboardStatistics({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        search_string: debounceSearch,
      }),
    refetchOnWindowFocus: false,
    retry: false,
  });

  const statsData =
    addSerial(
      data?.data?.data?.records,
      pagination.pageIndex,
      pagination.pageSize
    ) || [];

  const getData = ({ pageIndex, pageSize, search_string, order_by }: any) => {
    setPagination({
      pageIndex: pageIndex || 1,
      pageSize: pageSize || 25,
    });
    if (search_string !== undefined) setSearchString(search_string);
  };

  const {
    data: todaytasksPages,
    fetchNextPage,
    hasNextPage,
    isLoading: todaytasksLoading,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["todayTasks", todayFilter, ],
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
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination_info) return undefined;
      const { current_page, total_pages } = lastPage.pagination_info;
      return current_page < total_pages ? current_page + 1 : undefined;
    },
  });

  const todaytasks = todaytasksPages?.pages.flatMap((page) => page.tasks) || [];

  const handleScroll = (e: any) => {
    const container = e.currentTarget as HTMLElement;
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      container.scrollTop + container.clientHeight >=
        container.scrollHeight - 20
    ) {
      fetchNextPage();
    }
  };

  const handleNavigation = () => navigate({ to: `/tasks/add` });

  return (
    <div className="p-0 flex">
      <div className="w-3/4 m-2">
        <DashboardCards stats={stats} isError={isError} error={error as any} />

        <div className="flex flex-col bg-white rounded-md">
          <div className="flex items-center justify-between m-2">
            <h2 className="text-lg 3xl:!text-xl font-normal">Statistics</h2>
            <SearchFilter
              searchString={searchString}
              setSearchString={setSearchString}
              title="Find your Users"
            />
          </div>
          <TanStackTable
            columns={getStatisticsColumns()}
            data={statsData}
            loading={isLoading}
            getData={getData}
            paginationDetails={
              data?.data?.data?.pagination_info || {
                total_records: 0,
                total_pages: 1,
                current_page: pagination.pageIndex,
                page_size: pagination.pageSize,
                next_page: null,
                prev_page: null,
              }
            }
            height="calc(100vh - 250px)"
            removeSortingForColumnIds={[
              "sno",
              "name",
              "total",
              "completed",
              "inProgress",
              "pending",
            ]}
          />
        </div>
      </div>

      <div className="w-1/3 bg-white rounded-none border-l p-2 flex flex-col h-[calc(100vh-60px)] overflow-auto">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg 3xl:!text-xl font-medium">Task's Tracker</h2>
            <p className="text-sm 3xl:!text-base text-gray-500">
              {formattedDate}
            </p>
          </div>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white h-7 rounded font-light px-3 cursor-pointer text-xs 3xl:!text-sm"
            onClick={handleNavigation}
          >
            + New Task
          </Button>
        </div>
        {/* Filters */}
        <div className="flex items-center gap-2 mb-4 text-sm 3xl:!text-base font-medium">
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
              <span className="text-[11px] 3xl:!text-xs text-white rounded-lg px-2 py-0.5 bg-neutral-400 font-normal">
                <CountUp end={item.count} duration={1} />
              </span>
            </div>
          ))}
        </div>

        {/* Tasks List */}
        <div
          onScroll={handleScroll}
          className="space-y-2 h-[calc(100vh-190px)] overflow-y-auto pr-2"
        >
          {todaytasksLoading ? (
            <div className="flex items-center justify-center py-6 h-full">
              <img
                src="/6-dots-scale.svg"
                alt="loader"
                width={60}
                height={60}
              />
            </div>
          ) : todaytasks.filter((task) =>
              todayFilter ? task.task_status === todayFilter : true
            ).length === 0 ? (
            <div className="text-base text-gray-500 flex flex-col items-center justify-center h-full gap-2">
              <NoDataIcon className="w-40 h-40"/>
              No tasks found
            </div>
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
                    className="flex flex-col items-start gap-1 p-1 border-b border-gray-200 cursor-pointer"
                    onClick={() => navigate({ to: `/tasks/view/${task.id}` })}
                  >
                    <div className="flex items-center justify-between w-full">
                      <p className="font-medium text-gray-600 capitalize text-sm 3xl:!text-base">
                        {task.task_title}
                      </p>
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
                          <GreenThickIcon className="w-4 h-4 3xl:!w-5 3xl:!h-5" />
                        ) : (
                          <ClockIcon className="w-4 h-4 3xl:!w-5 3xl:!h-5" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full">
                      {/* Due Date */}
                      <p className="text-[11px] 3xl:!text-xs font-normal text-gray-700">
                        Due Date:{" "}
                        <span className="text-gray-500 font-normal">
                          {dayjs(task.end_date).format("DD-MM-YYYY")}
                        </span>
                      </p>
                      {/* Assigned Users */}
                      {task.users && task.users.length > 0 && (
                        <div className="flex -space-x-2 items-center mt-1">
                          {visibleUsers.map((u: any) => (
                            <div
                              key={u.user_id}
                              className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] 3xl:!text-xs font-medium text-white border-2 border-white"
                              title={u.display_name}
                            >
                              {u.display_name.charAt(0).toUpperCase()}
                            </div>
                          ))}

                          {remainingUsers.length > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-xs 3xl:!text-sm font-medium text-white border-2 border-white cursor-pointer">
                                    +{remainingUsers.length}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent
                                  className="max-h-[150px] overflow-y-auto bg-white text-gray-700 rounded-md shadow-md p-2"
                                  side="top"
                                >
                                  <div className="flex flex-col gap-1">
                                    {remainingUsers.map((u: any) => (
                                      <span
                                        key={u.user_id}
                                        className="capitalize"
                                      >
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
                  </div>
                );
              })
          )}
          {isFetchingNextPage && (
            <div className="text-center py-2 text-gray-500">
              Loading more...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
