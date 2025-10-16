export interface GetAllPaginatedTasksPropTypes {
    pageIndex: number;
    pageSize: number;
    order_by: any;
    search_string: any;
    from_date: any;
    to_date: any;
    task_status: string;
  }


export interface AddChatsAPIPayload {
  description: string;
  task_id: number;
}