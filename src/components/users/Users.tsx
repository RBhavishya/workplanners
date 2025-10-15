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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Filter, X } from "lucide-react";
import Loading from "../core/Loading";

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
  const [selectedUserType, setSelectedUserType] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const [del, setDel] = useState<any>(1);
  const [pagination, setPagination] = useState({
    pageIndex: pageIndexParam,
    pageSize: pageSizeParam,
    order_by: orderBY,
  });

  const { isLoading, data, isFetching } = useQuery({
    queryKey: ["users", pagination, debouncedSearch, del, selectedUserType],
    queryFn: async () => {
      if (location.pathname !== "/dashboard") {
        router.navigate({
          to: "/users",
          search: {
            page: Number(pagination.pageIndex),
            page_size: Number(pagination.pageSize),
            order_by: pagination.order_by || undefined,
            search: debouncedSearch || undefined,
            user_type: selectedUserType || undefined,
          },
        });
      }
      const response = await getAllPaginatedUsers({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        order_by: pagination.order_by,
        search_string: debouncedSearch,
        user_type: selectedUserType,
      });
      
      return response;
    },
    retry: false,
    refetchOnWindowFocus: false,
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
      if (searchString) {
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
  }, [searchString, selectedUserType]);

  const userActions = [
    {
      id: "actions",
      header: () => <span>Actions</span>,
      footer: (props: any) => props.column.id,
      size: 90,
      cell: (info: any) => {
        const rowData = info.row.original;
        const isActive = rowData.user_status === "ACTIVE";

        return (
          <div className="flex gap-3">
            <Button
              title="Edit"
              size="sm"
              variant="ghost"
              disabled={!isActive} // disabled if INACTIVE
              className="p-0 rounded-md border-none flex items-center justify-center hover:bg-[#f5f5f5] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => navigate({ to: `/users/edit/${rowData.id}` })}
            >
              <img
                src="/table/editicon.svg"
                alt="edit"
                height={16}
                width={16}
              />
            </Button>

            {/* Reset Password button */}
            <Button
              title="Reset password"
              size="sm"
              variant="ghost"
              disabled={!isActive} // disabled if INACTIVE
              className="p-0 rounded-md border-none flex items-center justify-center hover:bg-[#f5f5f5] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                setUserToResetPassword(rowData.id);
                setResetPasswordDialogOpen(true);
                setSelectedUserType("");
              }}
            >
              <img
                src="/table/resetpassword.svg"
                alt="reset"
                height={16}
                width={16}
              />
            </Button>

            {/* Delete button - always enabled */}
            <Button
              title="Delete"
              size="sm"
              variant="ghost"
              className="p-0 rounded-md  border-none flex items-center justify-center hover:bg-[#f5f5f5] cursor-pointer"
              onClick={() => {
                setUserToDelete(rowData.id);
                setDeleteDialogOpen(true);
              }}
            >
              <img
                src="/table/deleteicon.svg"
                alt="delete"
                height={16}
                width={16}
              />
            </Button>
          </div>
        );
      },
    },
  ];
  return (
    <div className="card-container shadow-all border-none p-2 rounded-xl bg-white m-2">
      <div className="bg-white rounded-md ">
        <div className="flex justify-end items-center my-2 gap-3">
          <SearchFilter
            searchString={searchString}
            setSearchString={setSearchString}
            title="Find your Users"
          />
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 border border-neutral-300 bg-white px-2 py-1 rounded-sm cursor-pointer text-sm h-7">
                <div className="flex items-center gap-2">
                  <Filter className="text-purple-500" size={16} />
                  <span>{selectedUserType || "Sort by"}</span>
                </div>

                {selectedUserType && (
                  <X
                    size={16}
                    className="text-gray-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUserType("");
                    }}
                  />
                )}
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-40 p-2 border rounded-md shadow-md">
              <div className="flex flex-col">
                {["MANAGER", "EMPLOYEE"].map((option) => (
                  <div
                    key={option}
                    className="cursor-pointer px-3 py-1 hover:bg-gray-100"
                    onClick={() => {
                      setSelectedUserType(option);
                      setFilterOpen(false);
                    }}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1).toLowerCase()}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
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
              height='calc(100vh - 145px)'
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
            setResetError(""); // ✅ Clear error on cancel
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
