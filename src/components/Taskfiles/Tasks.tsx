import { Button } from "@/components/ui/button";
import {
  deleteTasksAPI,
  getAllPaginatedTasks,
  getTasksStatsAPI,
  getWeaklySummaryAPI,
} from "@/https/services/tasks";
import { addSerial } from "@/lib/helpers/addSerial";
import { useDebounce } from "@/lib/helpers/useDebounce";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { DateRangePicker } from "rsuite";
import "rsuite/dist/rsuite-no-reset.min.css";
import { toast } from "sonner";
import BigCard from "../core/Cards";
import SearchFilter from "../core/SearchFilter";
import { SelectStatus } from "../core/SelectStatus";
import TanStackTable from "../core/Tanstacktable";
import DeleteTaskDialog from "../core/TaskDeleteFilter";
import WeeklySummary from "../core/WeakelySummary";
import { PendingIcon } from "../icons/Dashboard/PendingIcon";
import { ProgressIcon } from "../icons/Dashboard/ProgressIcon";
import { TotalTaskIcon } from "../icons/Dashboard/TotalTaskIcon";
import { taskColumns } from "./TaskColumns";
import { getTaskActions } from "./TaskActions";

const Tasks = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = new URLSearchParams(location.search);
  const pageIndexParam = Number(searchParams.get("page")) || 1;
  const pageSizeParam = Number(searchParams.get("page_size")) || 25;
  const orderBY = searchParams.get("order_by")
    ? searchParams.get("order_by")
    : "";
  const initialStartDate = searchParams.get("from_date") || null;
  const initialEndDate = searchParams.get("to_date") || null;
  const [searchString, setSearchString] = useState(
    searchParams.get("search") || ""
  );
  const [selectedStatus, setSelectedStatus] = useState(
    searchParams.get("task_status") || ""
  );
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [del, setDel] = useState<any>(1);
  const [pagination, setPagination] = useState({
    pageIndex: pageIndexParam,
    pageSize: pageSizeParam,
    order_by: orderBY,
  });
  const [dateValue, setDateValue] = useState<any>(
    initialStartDate && initialEndDate
      ? [new Date(initialStartDate), new Date(initialEndDate)]
      : null
  );
  const debouncedSearch = useDebounce(searchString, 500);

  const formatDate = (date: Date) =>
    date ? date.toLocaleDateString("en-CA") : undefined;

  const { isLoading, data } = useQuery({
    queryKey: [
      "tasks",
      pagination,
      debouncedSearch,
      dateValue,
      del,
      selectedStatus,
    ],
    queryFn: async () => {
      const response = await getAllPaginatedTasks({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        order_by: pagination.order_by,
        search_string: debouncedSearch,
        task_status: selectedStatus,
        from_date:
          dateValue?.length && dateValue[0]
            ? formatDate(dateValue[0])
            : undefined,
        to_date:
          dateValue?.length && dateValue[1]
            ? formatDate(dateValue[1])
            : undefined,
      });
      return response;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["tasksStats"],
    queryFn: async () => {
      const response = await getTasksStatsAPI();
      return response.data;
    },
  });

  const { data: summary } = useQuery({
    queryKey: ["weeklySummary"],
    queryFn: async () => {
      const response = await getWeaklySummaryAPI();
      return response.data;
    },
  });

  const { mutate: deleteTask, isPending: deleteLoading } = useMutation({
    mutationFn: (id: number) => deleteTasksAPI(id),
    onSuccess: (res: any) => {
      toast.success(res?.data?.message || "Task deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      let message = "Failed to delete project.";
      if (error?.status === 409) {
        message = error?.message || "Conflict: Project cannot be deleted.";
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(message);
      setDeleteDialogOpen(false);
    },
  });
  const handleDeleteClick = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    if (newStatus !== "") {
      setSelectedStatus(newStatus);
    }
  };

  const handleNavigation = () => navigate({ to: `/tasks/add` });

  const taksDataAfterSerial =
    addSerial(
      data?.data?.data?.records,
      data?.data?.data?.pagination_info?.current_page,
      data?.data?.data?.pagination_info?.page_size
    ) || [];

  const getAllTasks = async ({ pageIndex, pageSize, order_by }: any) => {
    setPagination({ pageIndex, pageSize, order_by });
  };

  const countData = [
    {
      title: "Total Tasks",
      value: stats?.total_tasks ?? 0,
      icon: <TotalTaskIcon />,
    },
    {
      title: "In Progress Tasks",
      value: stats?.total_in_progress_tasks ?? 0,
      icon: <ProgressIcon className="text-blue-700" />,
    },
    {
      title: "Overdue Tasks",
      value: stats?.total_overdue_tasks ?? 0,
      icon: <PendingIcon />,
    },

  ]

  useEffect(() => {
      router.navigate({
        to: "/tasks",
        search: {
          page: Number(pagination.pageIndex),
          page_size: Number(pagination.pageSize),
          order_by: pagination.order_by || undefined,
          search: debouncedSearch || undefined,
          from_date:
            dateValue?.length && dateValue[0]
              ? formatDate(dateValue[0])
              : undefined,
          to_date:
            dateValue?.length && dateValue[1]
              ? formatDate(dateValue[1])
              : undefined,
          task_status: selectedStatus || undefined,
        },
      });
  }, [ pagination, debouncedSearch, dateValue, selectedStatus]);

  return (
    <div className="flex flex-col overflow-hidden gap-2 m-2 rounded-md">
      <div className="flex gap-6 bg-white p-2 rounded-md">
        <div className="flex justify-around rounded gap-1">
          <div className="flex flex-wrap gap-3">
            {countData.map((item, index) => (
              <BigCard
                key={index}
                title={item.title}
                value={
                  <CountUp
                    start={0}
                    end={item.value}
                    duration={1.5}
                  />
                }
                icon={item.icon}
              />
            ))}
          </div>
        </div>
        <WeeklySummary data={summary} />
      </div>
      <div className="bg-white rounded-md ">
        <div className="flex justify-end items-center m-1 gap-3">
          <SearchFilter
            searchString={searchString}
            setSearchString={setSearchString}
            title="Find your Task"
          />
          <DateRangePicker
            placement="bottomEnd"
            value={dateValue}
            onChange={(range) => setDateValue(range)}
            placeholder="Select Date Range"
            className="!h-8 text-sm"
          />
          <SelectStatus
            selectedStatus={selectedStatus}
            handleStatusChange={handleStatusChange}
            />
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white h-7 rounded font-light px-3 cursor-pointer"
            onClick={handleNavigation}
          >
            + New Task
          </Button>
        </div>
        <div className="bg-white relative">
          <TanStackTable
            data={taksDataAfterSerial}
            columns={[...taskColumns, ...getTaskActions({
              navigate,
              setTaskToDelete,
              setDeleteDialogOpen,
            }),]}
            paginationDetails={data?.data?.data?.pagination_info}
            getData={getAllTasks}
            loading={isLoading}
            removeSortingForColumnIds={[
              "serial",
              "actions",
              "project_name",
              "task_brief",
              "task_status",
              "actions",
            ]}
            height="calc(100vh - 295px)"
          />
        </div>
        <DeleteTaskDialog
          openOrNot={deleteDialogOpen}
          onCancelClick={() => setDeleteDialogOpen(false)}
          label="Are you sure you want to delete this task?"
          onOKClick={handleDeleteClick}
          deleteLoading={deleteLoading}
        />
      </div>
    </div>
  );
};

export default Tasks;
