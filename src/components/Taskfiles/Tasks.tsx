import * as React from "react";
import { useLocation, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  ClipboardList,
  ClipboardPenLine,
  Columns,
  FileClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import BigCard from "../core/Cards";
import AddTaskForm from "./AddTaskForm";
import SmallCard from "../core/StatusCard";
import { useQuery } from "@tanstack/react-query";
import { getAllPaginatedTasks } from "@/https/services/tasks";
import { addSerial } from "@/lib/helpers/addSerial";
import TanStackTable from "../core/TasksTanstacktable";
import { taskColumns } from "./TaskColumns";
import TaskSearchFilter from "../core/TasksSearchFilter";

const Tasks = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const router = useRouter();
  // const dispatch = useDispatch();

  const searchParams = new URLSearchParams(location.search);
  const pageIndexParam = Number(searchParams.get("page")) || 1;
  const pageSizeParam = Number(searchParams.get("page_size")) || 25;
  const orderBY = searchParams.get("order_by")
    ? searchParams.get("order_by")
    : "";
  const initialSearch = searchParams.get("search") || "";
  const initialStatus = searchParams.get("status") || "";
  const initialPrioritys = searchParams.get("priority") || "";
  const intialProject = searchParams.get("project_id") || "";
  const [searchString, setSearchString] = useState<any>(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(searchString);
  const [selectedDate, setSelectedDate] = useState<any>(new Date());
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedProject, setSelectedProject] = useState<any>(intialProject);
  const [selectedpriority, setSelectedpriority] = useState(initialPrioritys);
  const [dateValue, setDateValue] = useState<any>(null);
  const [del, setDel] = useState<any>(1);
  const [time, setTime] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: pageIndexParam,
    pageSize: pageSizeParam,
    order_by: orderBY,
  });

  const { isLoading, isError, data, error, isFetching } = useQuery({
    queryKey: [
      "tasks",
      pagination,
      debouncedSearch,
      selectedDate,
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
        status: selectedStatus,
        priority: selectedpriority,
        project_id: selectedProject,
        from_date: selectedDate?.length ? selectedDate[0] : null,
        to_date: selectedDate?.length ? selectedDate[1] : null,
      });
      const queryParams = {
        current_page: +pagination.pageIndex,
        page_size: +pagination.pageSize,
        order_by: pagination.order_by ? pagination.order_by : undefined,
        search_string: debouncedSearch || undefined,
        from_date: selectedDate?.length ? selectedDate[0] : undefined,
        to_date: selectedDate?.length ? selectedDate[1] : undefined,
        status: selectedStatus || undefined,
        project_id: selectedProject || undefined,
        priority: selectedpriority || undefined,
      };

      {
        location.pathname == "/dashboard"
          ? ""
          : router.navigate({
              to: "/tasks",
              search: queryParams,
            });
      }
      // dispatch(setRefId(response.data?.data?.records[0]?.ref_id));

      return response;
    },
  });

  const taksDataAfterSerial =
    addSerial(
      data?.data?.data?.records,
      data?.data?.data?.pagination_info?.current_page,
      data?.data?.data?.pagination_info?.page_size
    ) || [];

  const getAllTasks = async ({ pageIndex, pageSize, order_by }: any) => {
    setPagination({ pageIndex, pageSize, order_by });
  };

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
    <div className="flex flex-col bg-gray-100 h-screen">
     

        {/* 🔹 Task Summary Cards */}
        <div className="w-full p-2 bg-white rounded-sm">
          <h1 className="flex text-bold text-xl">Tasks</h1>
          <div className="flex gap-6">
            <div className="flex justify-around rounded gap-7 px-4 py-1">
              <div className="flex gap-4 mt-10">
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
              <div
                className="bg-gray rounded-xl shadow-md p-4 w-110 h-30 mt-7"
                style={{ border: "1px solid  #ddb8ffff" }}
              ></div>
            </div>
          </div>
        </div>

        <hr />

        {/* 🔹 New Task Button aligned right */}

        {/* 🔹 Task Table */}
        <div className="bg-white">
          <div className="flex justify-end items-center my-2 gap-3">
            <TaskSearchFilter
              searchString={debouncedSearch}
              setSearchString={setSearchString}
              title="Find your Task"
            />

            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setOpen(true)}
            >
              + New Task
            </Button>
          </div>
          <TanStackTable
            data={taksDataAfterSerial}
            columns={taskColumns}
            paginationDetails={pagination}
            getData={getAllTasks}
            loading={isLoading}
            removeSortingForColumnIds={[
              "serial",
              "actions",
              "project_name",
              "task_name",
              "task_brief",
              "status",
              "end_date",
            ]}
          />
        </div>

        {/* 🔹 Modal */}
        <AddTaskForm open={open} onClose={() => setOpen(false)} />
      </div>
  );
};

export default Tasks;
