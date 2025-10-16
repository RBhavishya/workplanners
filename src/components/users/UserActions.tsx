import { UserActionsProps } from "@/interfaces/users";
import { Button } from "../ui/button";


export const getUserActions = ({
  navigate,
  setUserToDelete,
  setDeleteDialogOpen,
  setUserToResetPassword,
  setResetPasswordDialogOpen,
  setSelectedRole,
}: UserActionsProps) => [
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
            disabled={!isActive}
            className="p-0 rounded-md border-none flex items-center justify-center hover:bg-[#f5f5f5] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => navigate({ to: `/users/edit/${rowData.id}` })}
          >
            <img src="/table/editicon.svg" alt="edit" height={16} width={16} />
          </Button>

          <Button
            title="Reset password"
            size="sm"
            variant="ghost"
            disabled={!isActive}
            className="p-0 rounded-md border-none flex items-center justify-center hover:bg-[#f5f5f5] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              setUserToResetPassword(rowData.id);
              setResetPasswordDialogOpen(true);
              setSelectedRole("");
            }}
          >
            <img
              src="/table/resetpassword.svg"
              alt="reset"
              height={16}
              width={16}
            />
          </Button>

          <Button
            title="Delete"
            size="sm"
            variant="ghost"
            className="p-0 rounded-md border-none flex items-center justify-center hover:bg-[#f5f5f5] cursor-pointer"
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
