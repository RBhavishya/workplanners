export interface GetAllPaginatedUsersPropTypes {
  pageIndex: number;
  pageSize: number;
  order_by: any;
  search_string: any;
  user_type: string;
}

export interface UserActionsProps {
  navigate: any;
  setUserToDelete: (id: number) => void;
  setDeleteDialogOpen: (value: boolean) => void;
  setUserToResetPassword: (id: number) => void;
  setResetPasswordDialogOpen: (value: boolean) => void;
  setSelectedRole: (value: string) => void;
}
