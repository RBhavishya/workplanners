import { Button } from "@/components/ui/button";
import { useLocation, useNavigate, useRouter } from "@tanstack/react-router";
import {
  Edit,
  Eye,
  Filter,
  Trash,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  deleteTasksAPI,
  getAllPaginatedTasks,
  getTasksStatsAPI,
  getWeaklySummaryAPI,
} from "@/https/services/tasks";
import { addSerial } from "@/lib/helpers/addSerial";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CountUp from "react-countup";
import { DateRangePicker } from "rsuite";
import "rsuite/dist/rsuite-no-reset.min.css";
import { toast } from "sonner";
import BigCard from "../core/Cards";
import SearchFilter from "../core/SearchFilter";
import DeleteTaskDialog from "../core/TaskDeleteFilter";
import TanStackTable from "../core/Tanstacktable";
import WeeklySummary from "../core/WeakelySummary";
import { PendingIcon } from "../icons/Dashboard/PendingIcon";
import { ProgressIcon } from "../icons/Dashboard/ProgressIcon";
import { TotalTaskIcon } from "../icons/Dashboard/TotalTaskIcon";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { taskColumns } from "./TaskColumns";
import Loading from "../core/Loading";

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
  const initialSearch = searchParams.get("search") || "";
  const initialStatus = searchParams.get("task_status") || "";
  const [searchString, setSearchString] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(searchString);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [del, setDel] = useState<any>(1);
  const [time, setTime] = useState(new Date());
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

  const formatDate = (date: Date) =>
    date ? date.toLocaleDateString("en-CA") : undefined;

  const { isLoading, data, isFetching } = useQuery({
    queryKey: [
      "tasks",
      pagination,
      debouncedSearch,
      dateValue,
      del,
      selectedStatus,
    ],
    queryFn: async () => {
      if (location.pathname !== "/dashboard") {
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
      }
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
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { data: stats } = useQuery({
    queryKey: ["tasksStats"],
    queryFn: async () => {
      const response = await getTasksStatsAPI();
      return response.data;
    },
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { data: summary } = useQuery({
    queryKey: ["weeklySummary"],
    queryFn: async () => {
      const response = await getWeaklySummaryAPI();
      return response.data;
    },
    refetchOnWindowFocus: false,
    retry: false,
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

  const taskActions = [
    {
      id: "actions",
      header: () => <span>Actions</span>,
      footer: (props: any) => props.column.id,
      size: 50,
      cell: (info: any) => {
        const rowData = info.row.original;

        return (
          <div className="flex gap-3">
            <Button
              title="View"
              className="text-gray-600 hover:bg-gray-100 cursor-pointer p-0"
              variant={"ghost"}
              onClick={() => navigate({ to: `/tasks/view/${rowData.id}` })}
            >
              <Eye size={16} />
            </Button>

            <Button
              title="Edit"
              className="text-gray-600 hover:bg-gray-100 cursor-pointer p-0"
              variant={"ghost"}
              onClick={() => navigate({ to: `/tasks/edit/${rowData.id}` })}
            >
              <Edit size={16} />
            </Button>

            <Button
              title="Delete"
              className="text-gray-600 hover:bg-gray-100 cursor-pointer p-0"
              variant={"ghost"}
              onClick={() => {
                setTaskToDelete(rowData.id);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash size={16} />
            </Button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchString);
      if (searchString || selectedStatus || dateValue) {
        getAllTasks({
          pageIndex: 1,
          pageSize: pageSizeParam,
          order_by: orderBY,
        });
      } else {
        getAllTasks({
          pageIndex: pageIndexParam,
          pageSize: pageSizeParam,
          order_by: orderBY,
        });
      }
    }, 500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchString, selectedStatus, dateValue]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col overflow-hidden gap-2 m-2 rounded-md">
        <div className="flex gap-6 bg-white p-2 rounded-md">
          <div className="flex justify-around rounded gap-1">
            <div className="flex flex-wrap gap-3">
              <BigCard
                title="Total Tasks"
                value={
                  <CountUp
                    start={0}
                    end={stats?.total_tasks ?? 0}
                    duration={1.5}
                  />
                }
                icon={<TotalTaskIcon />}
              />

              <BigCard
                title="In Progress Task"
                value={
                  <CountUp
                    start={0}
                    end={stats?.total_in_progress_tasks ?? 0}
                    duration={1.5}
                  />
                }
                icon={<ProgressIcon />}
              />
              <BigCard
                title="Overdue Tasks"
                value={
                  <CountUp
                    start={0}
                    end={stats?.total_overdue_tasks ?? 0}
                    duration={1.5}
                  />
                }
                icon={<PendingIcon />}
              />
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
            className="h-8 text-sm"
          />
          <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 border px-2 py-1 rounded-md cursor-pointer text-sm h-8">
                <div className="flex items-center gap-2">
                  <Filter className="text-purple-500" size={16} />
                  <span>{selectedStatus || "Sort by"}</span>
                </div>

                {selectedStatus && (
                  <X
                    size={16}
                    className="text-gray-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStatus("");
                    }}
                  />
                )}
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-48 p-0 border rounded-md shadow-md">
              <div className="flex flex-col">
                {["New", "In_Progress", "Review", "Overdue", "Completed"].map(
                  (option) => (
                    <div
                      key={option}
                      className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setSelectedStatus(option);
                        setStatusPopoverOpen(false);
                      }}
                    >
                      {option}
                    </div>
                  )
                )}
              </div>
            </PopoverContent>
          </Popover>
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
            columns={[...taskColumns, ...taskActions]}
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
            height='calc(100vh - 260px)'
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
