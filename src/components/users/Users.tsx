import {
  deleteUserAPI,
  getAllPaginatedUsers,
  resetPasswordUsersAPI,
} from "@/https/services/users";
import { addSerial } from "@/lib/helpers/addSerial";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ResetPasswordDialog from "../core/ResetPasswordDialoge";
import SearchFilter from "../core/SearchFilter";
import DeleteTaskDialog from "../core/TaskDeleteFilter";
import TanStackTable from "../core/Tanstacktable";
import { Button } from "../ui/button";
import { usersColumns } from "./UsersColumns";
import { Filter, X } from "lucide-react";
import { userRole } from "@/lib/helpers/StatusFilter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useDebounce } from "@/lib/helpers/useDebounce";
import { getUserActions } from "./UserActions";

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
  const [searchString, setSearchString] = useState(
    searchParams.get("search") || ""
  );
  const debouncedSearch = useDebounce(searchString, 500);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<number | null>(
    null
  );
  const [selectedRole, setSelectedRole] = useState("");
  const [del, setDel] = useState<any>(1);
  const [pagination, setPagination] = useState({
    pageIndex: pageIndexParam,
    pageSize: pageSizeParam,
    order_by: orderBY,
  });

  const { isLoading, data } = useQuery({
    queryKey: ["users", pagination, debouncedSearch, del, selectedRole],
    queryFn: async () => {
      const response = await getAllPaginatedUsers({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        order_by: pagination.order_by,
        search_string: debouncedSearch,
        user_type: selectedRole,
      });

      return response;
    },
  });

  useEffect(() => {
    router.navigate({
      to: "/users",
      search: {
        page: Number(pagination.pageIndex),
        page_size: Number(pagination.pageSize),
        order_by: pagination.order_by || undefined,
        search: debouncedSearch || undefined,
        user_type: selectedRole || undefined,
      },
    });
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    pagination.order_by,
    debouncedSearch,
    selectedRole,
  ]);

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

  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole);
    if (newRole !== "") {
      setSelectedRole(newRole);
    }
  };

  return (
    <div className="card-container shadow-all border-none p-2 rounded-xl bg-white m-2">
      <div className="bg-white rounded-md ">
        <div className="flex justify-end items-center my-2 gap-3">
          <SearchFilter
            searchString={searchString}
            setSearchString={setSearchString}
            title="Find your Users"
          />
          <div className="relative inline-block">
            <Select value={selectedRole} onValueChange={handleRoleChange}>
              <SelectTrigger className="flex items-center gap-2 bg-white border p-1 rounded-sm cursor-pointer text-sm !h-8 shadow-none focus-visible:ring-0 pr-5">
                <div className="flex items-center gap-1">
                  <Filter className="text-purple-500" size={16} />
                  <SelectValue placeholder="Select role" />
                </div>
              </SelectTrigger>

              <SelectContent
                className="max-w-38 border rounded-md shadow-md mx-auto"
                align="center"
              >
                {userRole.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer hover:bg-gray-100 text-sm p-1"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedRole && (
              <Button
                type="button"
                onClick={() => handleRoleChange("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded flex items-center justify-center text-gray-400 hover:text-red-500 p-0 bg-transparent hover:bg-transparent shadow-none"
                aria-label="Clear status"
              >
                <X size={16} />
              </Button>
            )}
          </div>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white h-7 rounded font-light px-3 cursor-pointer"
            onClick={handleNavigation}
          >
            + Add User
          </Button>
        </div>
        <div className="bg-white relative">
          <div className="mt-5">
            <TanStackTable
              data={users}
              columns={[...usersColumns, ...getUserActions({
                navigate,
                setUserToDelete,
                setDeleteDialogOpen,
                setUserToResetPassword,
                setResetPasswordDialogOpen,
                setSelectedRole,
              })]}
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
              height="calc(100vh - 185px)"
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
          onCancelClick={() => {
            setResetPasswordDialogOpen(false);
            setResetError("");
          }}
          onOKClick={handlePasswordUpdate}
          error={resetError}
          resetLoading={resetLoading}
          dialogTitle="Reset Password"
          label_1="Reseting..."
          label_2="Reset Password"
          label="Enter a new password for this user."
        />
      </div>
    </div>
  );
};

export default UsersDetais;
