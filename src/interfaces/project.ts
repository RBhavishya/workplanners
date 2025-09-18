export interface User {
  id: number;
  display_name: string; 
}

export interface ProjectData {
  id?: number;
  title: string;
  project_status?: string;
  description?: string;
  status?: string;
  created_by: string | number;
  updated_by?: string | number;
  start_date?: string;
  due_date?: string;
  links?: string[];
  assigned_users?: number[];
}

export interface CreateProjectResponse {
  success: boolean;
  status: number;
  data: ProjectData;
  message?: string;
}

export interface User {
  id: number;
  display_name: string;
}

export interface UsersDropdownResponse {
  success: boolean;
  status: number;
  message?: string;
  data:{
    data: User[];
  }
}


export interface IAPIResponse {
  data: {
    records: ProjectData[];
    pagination_info: {
      total_records: number;
      total_pages: number;
      page_size: number;
      current_page: number;
    };
  };
  success: boolean;
  message?: string;
}

export interface GetAllProjectsParams {
  order_by?: string;
  page?: number;
  page_size?: number;
  search_string?: string;
}

export interface Task {
  id: number;
  task_title: string;
  task_status: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface TaskResponse {
  data: {
    data:{
      records?: Task[];
    }
      pagination_info?: {
        total_records: number;
        total_pages: number;
        page_size: number;
        current_page: number;
        next_page: number | null;
        prev_page: number | null;
      };
    };
}