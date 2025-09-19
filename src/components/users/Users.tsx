import { getAllPaginatedUsers } from "@/https/services/users";
import { addSerial } from "@/lib/helpers/addSerial";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useRouter } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import TaskSearchFilter from "../core/TasksSearchFilter";
import TanStackTable from "../core/TasksTanstacktable";
import { taskColumns } from "../Taskfiles/TaskColumns";
import { usersColumns } from "./UsersColumns";
import { Edit, Eye, Trash } from "lucide-react";

const UsersDetais = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const router = useRouter();
  const searchParams = new URLSearchParams(location.search);
  const pageIndexParam = Number(searchParams.get("page")) || 1;
  const pageSizeParam = Number(searchParams.get("page_size")) || 25;
  const orderBY = searchParams.get("order_by")
    ? searchParams.get("order_by")
    : "";
  const initialSearch = searchParams.get("search") || "";

  const [searchString, setSearchString] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(searchString);
  const [del, setDel] = useState<any>(1);
  const [pagination, setPagination] = useState({
    pageIndex: pageIndexParam,
    pageSize: pageSizeParam,
    order_by: orderBY,
  });
  const { isLoading, isError, data, error, isFetching } = useQuery({
    queryKey: ["tasks", pagination, debouncedSearch, del],
    queryFn: async () => {
      const response = await getAllPaginatedUsers({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        order_by: pagination.order_by,
        search_string: debouncedSearch,
      });

      if (location.pathname !== "/dashboard") {
        router.navigate({
          to: "/users",
          search: {
            page: Number(pagination.pageIndex),
            page_size: Number(pagination.pageSize),
            order_by: pagination.order_by || undefined,
            search: debouncedSearch || undefined,
          },
        });
      }

      return response;
    },
  });
  const users =
    addSerial(
      data?.data?.data?.records,
      data?.data?.data?.pagination_info?.current_page,
      data?.data?.data?.pagination_info?.page_size
    ) || [];

  const getAllUsers = async ({ pageIndex, pageSize, order_by }: any) => {
    setPagination({ pageIndex, pageSize, order_by });
  };

    const handleNavigation = () => navigate({ to: `/tasks/add` });

      useEffect(() => {
        const handler = setTimeout(() => {
          setDebouncedSearch(searchString);
          if (searchString || orderBY) {
            getAllUsers({
              pageIndex: 1,
              pageSize: pageSizeParam,
              order_by: orderBY,
            });
          } else {
            getAllUsers({
              pageIndex: pageIndexParam,
              pageSize: pageSizeParam,
              order_by: orderBY,
            });
          }
        }, 500);
        return () => {
          clearTimeout(handler);
        };
      }, [searchString, orderBY]);
    

  const userActions = [
      {
        id: "actions",
        header: () => <span>Actions</span>,
        footer: (props: any) => props.column.id,
        size: 90,
        cell: (info: any) => {
          const rowData = info.row.original;
  
          return (
            <div className="flex gap-2">
              <button
                className="border border-gray-400 rounded px-2 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
                // onClick={() => navigate({ to: `/tasks/view/${rowData.id}` })}
              >
                <Eye size={16} />
              </button>
  
              <button
                className="border border-gray-400 rounded px-2 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
                // onClick={() => navigate({ to: `/tasks/edit/${rowData.id}` })}
              >
                <Edit size={16} />
              </button>
  
              <button
                className="border border-gray-400 rounded px-2 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
                // onClick={() => {
                //   setTaskToDelete(rowData.id);
                //   setDeleteDialogOpen(true);
                // }}
              >
                <Trash size={16} />
              </button>
            </div>
          );
        },
      },
    ];
  return (
    <div className="flex flex-col bg-gray-100 h-full overflow-hidden gap-3">
      <div className="bg-white rounded-md ">
        <div className="flex justify-end items-center my-2 gap-3">
          <TaskSearchFilter
            searchString={searchString}
            setSearchString={setSearchString}
            title="Find your Users"
          />
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white h-7 rounded font-light px-3 cursor-pointer"
            onClick={handleNavigation}
          >
            + Add User
          </Button>
        </div>
        <div className="bg-white relative">
          {(isLoading || isFetching) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          <TanStackTable
            data={users}
            columns={[...usersColumns,...userActions]}
            paginationDetails={data?.data?.data?.pagination_info}
            getData={getAllUsers}
            loading={isLoading}
            removeSortingForColumnIds={[
              "serial",
              "actions",
              "project_name",
              "task_brief",
              "task_status",
              "actions",
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default UsersDetais;
