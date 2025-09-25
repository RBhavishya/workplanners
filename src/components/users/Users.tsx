import {
  deleteUserAPI,
  getAllPaginatedUsers,
  resetPasswordUsersAPI,
} from "@/https/services/users";
import { addSerial } from "@/lib/helpers/addSerial";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useRouter } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import TaskSearchFilter from "../core/TasksSearchFilter";
import TanStackTable from "../core/TasksTanstacktable";
import { usersColumns } from "./UsersColumns";
import DeleteTaskDialog from "../core/TaskDeleteFilter";
import { toast } from "sonner";
import ResetPasswordDialog from "../core/ResetPasswordDialoge";

const UsersDetais = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<number | null>(
    null
  );
  const [del, setDel] = useState<any>(1);
  const [pagination, setPagination] = useState({
    pageIndex: pageIndexParam,
    pageSize: pageSizeParam,
    order_by: orderBY,
  });
  const { isLoading, data, isFetching } = useQuery({
    queryKey: ["users", pagination, debouncedSearch, del],
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

  const { mutate: deleteTask, isPending: deleteLoading } = useMutation({
    mutationFn: (id: number) => deleteUserAPI(id),
    onSuccess: (res: any) => {
      toast.success(res?.data?.message || "User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      let message = "Failed to delete User.";
      if (error?.status === 409) {
        message = error?.message || "Conflict: User cannot be deleted.";
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(message);
      setDeleteDialogOpen(false);
    },
  });

  const { mutate: resetPassword, isPending: resetLoading } = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      resetPasswordUsersAPI(id.toString(), { password }),
    onSuccess: (res: any) => {
      toast.success(res?.data?.message || "Password reset successfully");
      setResetError("");
      setResetPasswordDialogOpen(false);
    },
    onError: (error: any) => {
      if (error?.status === 422 && error?.data?.errData) {
        const passwordErrors = error.data.errData.password;
        if (Array.isArray(passwordErrors) && passwordErrors.length > 0) {
          setResetError(passwordErrors[0]);
        } else {
          setResetError("Password validation failed");
        }
      } else {
        const message = error?.data?.message || "Failed to reset password";
        toast.error(message); 
        setResetError(message);
      }
    },
  });

  const handleDeleteClick = () => {
    if (userToDelete) {
      deleteTask(userToDelete);
    }
  };

  const handlePasswordUpdate = (newPassword: string) => {
    if (userToResetPassword) {
      resetPassword({ id: userToResetPassword, password: newPassword });
    }
  };

  const handleNavigation = () => navigate({ to: `/users/adduser` });

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
      const isActive = rowData.user_status === "ACTIVE"; // check user status

      return (
        <div className="flex gap-2">
          {/* Edit button */}
          <Button
            title="edit"
            size="sm"
            variant="ghost"
            disabled={!isActive} // disabled if INACTIVE
            className="p-0 rounded-md w-[27px] h-[27px] border flex items-center justify-center hover:bg-[#f5f5f5] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => navigate({ to: `/users/edit/${rowData.id}` })}
          >
            <img src="/table/editicon.svg" alt="edit" height={18} width={18} />
          </Button>

          {/* Reset Password button */}
          <Button
            title="reset password"
            size="sm"
            variant="ghost"
            disabled={!isActive} // disabled if INACTIVE
            className="p-0 rounded-md w-[27px] h-[27px] border flex items-center justify-center hover:bg-[#f5f5f5] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              setUserToResetPassword(rowData.id);
              setResetPasswordDialogOpen(true);
            }}
          >
            <img
              src="/table/resetpassword.svg"
              alt="reset"
              height={18}
              width={18}
            />
          </Button>

          {/* Delete button - always enabled */}
          <Button
            title="delete"
            size="sm"
            variant="ghost"
            className="p-0 rounded-md w-[27px] h-[27px] border flex items-center justify-center hover:bg-[#f5f5f5] cursor-pointer"
            onClick={() => {
              setUserToDelete(rowData.id);
              setDeleteDialogOpen(true);
            }}
          >
            <img
              src="/table/deleteicon.svg"
              alt="delete"
              height={18}
              width={18}
            />
          </Button>
        </div>
      );
    },
  },
];
  return (
    <div className="card-container shadow-all border p-3 rounded-xl bg-white">
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
          <div className="mt-5">
            <TanStackTable
              data={users}
              columns={[...usersColumns, ...userActions]}
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
        <DeleteTaskDialog
          openOrNot={deleteDialogOpen}
          onCancelClick={() => setDeleteDialogOpen(false)}
          label="Are you sure you want to delete this user?"
          onOKClick={handleDeleteClick}
          deleteLoading={deleteLoading}
        />
        <ResetPasswordDialog
          open={resetPasswordDialogOpen}
          onCancelClick={() => setResetPasswordDialogOpen(false)}
          onOKClick={handlePasswordUpdate}
          error={resetError}
          resetLoading={resetLoading}
          label="Enter a new password for this user."
        />
      </div>
    </div>
  );
};

export default UsersDetais;
