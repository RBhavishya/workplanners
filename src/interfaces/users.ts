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

export interface UserDetailsProps {
  id: number;
  slack_id: string;
  user_name: string;
  display_name: string;
  email: string;
  profile_pic: string;
  designation: string;
  phone: string;
  user_type: string;
  user_status: string;
  created_at: string;
}
