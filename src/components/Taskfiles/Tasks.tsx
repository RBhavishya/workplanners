import * as React from "react";
import { useLocation, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ClipboardList,
  ClipboardPenLine,
  FileClock,
  Eye,
  Edit,
  Trash,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import BigCard from "../core/Cards";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteTasksAPI,
  getAllPaginatedTasks,
  gettasksByIdAPI,
} from "@/https/services/tasks";
import { addSerial } from "@/lib/helpers/addSerial";
import TanStackTable from "../core/TasksTanstacktable";
import { taskColumns } from "./TaskColumns";
import TaskSearchFilter from "../core/TasksSearchFilter";
import { toast } from "sonner";
import DeleteTaskDialog from "../core/TaskDeleteFilter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { DateRangePicker } from "rsuite";
import "rsuite/dist/rsuite-no-reset.min.css";

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
  const initialPrioritys = searchParams.get("priority") || "";
  const intialProject = searchParams.get("project_id") || "";

  const [searchString, setSearchString] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(searchString);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedProject, setSelectedProject] = useState<any>(intialProject);
  const [selectedpriority, setSelectedpriority] = useState(initialPrioritys);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [del, setDel] = useState<any>(1);
  const [time, setTime] = useState(new Date());
  const [pagination, setPagination] = useState({
    pageIndex: pageIndexParam,
    pageSize: pageSizeParam,
    order_by: orderBY,
  });
  const [selectedDate, setSelectedDate] = useState<any>();

  const [dateValue, setDateValue] = useState<any>(
    initialStartDate && initialEndDate
      ? [new Date(initialStartDate), new Date(initialEndDate)]
      : null
  );

    const formatDate = (date: Date) =>
    date ? date.toLocaleDateString("en-CA") : undefined;

  const { isLoading, isError, data, error, isFetching } = useQuery({
    queryKey: [
      "tasks",
      pagination,
      debouncedSearch,
      dateValue,
      del,
      selectedStatus,
      selectedpriority,
      selectedProject,
    ],
    queryFn: async () => {
      const response = await getAllPaginatedTasks({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        order_by: pagination.order_by,
        search_string: debouncedSearch,
        task_status: selectedStatus,
        priority: selectedpriority,
        project_id: selectedProject,
       from_date:
        dateValue?.length && dateValue[0] ? formatDate(dateValue[0]) : undefined,
      to_date:
        dateValue?.length && dateValue[1] ? formatDate(dateValue[1]) : undefined,
    });

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
            project_id: selectedProject || undefined,
            priority: selectedpriority || undefined,
          },
        });
      }

      return response;
    },
  });

  const { mutate: deleteTask, isPending: deleteLoading } = useMutation({
    mutationFn: (id: number) => deleteTasksAPI(id),
    onSuccess: (res: any) => {
      toast.success(res?.data?.message || "Task deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      setDeleteDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete task");
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
      size: 90,
      cell: (info: any) => {
        const rowData = info.row.original;

        return (
          <div className="flex gap-2">
            <button className="border border-gray-400 rounded px-2 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer">
              <Eye size={16} />
            </button>

            <button
              className="border border-gray-400 rounded px-2 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
              onClick={() => navigate({ to: `/tasks/edit/${rowData.id}` })}
            >
              <Edit size={16} />
            </button>

            <button
              className="border border-gray-400 rounded px-2 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setTaskToDelete(rowData.id);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash size={16} />
            </button>
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

  const formattedTime = time.toLocaleTimeString("en-GB");
  const formattedDate = time.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="flex flex-col bg-gray-100 h-full overflow-hidden gap-3">
      <div className="w-full p-2 bg-white rounded-md">
        <h1 className="flex text-bold text-2xl">Tasks</h1>
        <div className="flex gap-6 ">
          <div className="flex justify-around rounded gap-1 ml-10 mt-5">
            <div className="flex flex-wrap gap-3">
              <BigCard
                title="Total Tasks"
                value={29}
                icon={<ClipboardList />}
              />

              <BigCard
                title="In Progress Task"
                value={3}
                icon={<ClipboardPenLine />}
              />
              <BigCard title="Pending Tasks" value={1} icon={<FileClock />} />
            </div>
          </div>
          <div
            className=" bg-gray rounded-xl shadow-md p-2 w-120 h-30 "
            style={{ border: "1px solid  #ddb8ffff" }}
          ></div>
        </div>
      </div>
      <div className="bg-white rounded-md ">
        <div className="flex justify-end items-center my-2 gap-3">
          <TaskSearchFilter
            searchString={searchString}
            setSearchString={setSearchString}
            title="Find your Task"
          />
          <DateRangePicker
            placement="auto"
            value={dateValue}
            onChange={(range) => setDateValue(range)}
            placeholder="Select Date Range"
            className="h-8 text-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 border px-2 py-1 rounded-md cursor-pointer text-sm h-8">
                <Filter className="text-purple-500" size={16} />
                {selectedStatus || "Sort by"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {["New", "In_Progress", "Review", "Overdue", "Done"].map(
                (option) => (
                  <DropdownMenuItem
                    key={option}
                    className="cursor-pointer"
                    onClick={() => setSelectedStatus(option)}
                  >
                    {option}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white h-7 rounded font-light px-3"
            onClick={handleNavigation}
          >
            + New Task
          </Button>
        </div>
        <div className="bg-white relative">
          {(isLoading || isFetching) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

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
              "actions",
            ]}
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
