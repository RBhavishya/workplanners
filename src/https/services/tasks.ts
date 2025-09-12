import { $fetch } from "../fetch";
interface GetAllPaginatedUsersPropTypes {
  pageIndex: number;
  pageSize: number;
  order_by: any;
  search_string: any;
  from_date: string;
  to_date: string;
  status: string;
  priority: string;
  project_id: any;
}

export const getAllPaginatedTasks = async ({
  pageIndex,
  pageSize,
  order_by,
  search_string,
  from_date,
  to_date,
  status,
  priority,
  project_id,
}: GetAllPaginatedUsersPropTypes) => {
  try {
    const queryParams = {
      page: pageIndex,
      page_size: pageSize,
      order_by: order_by,
      search_string: search_string,
      from_date: from_date,
      to_date: to_date,
      status: status,
      priority: priority,
      project_id: project_id,
    };
    return await $fetch.get("/tasks", queryParams);
  } catch (err) {
    throw err;
  }
};

export const createTaskAPI = async (payload: any) => {
  try {
    return await $fetch.post("/task-assignees", payload);
  } catch (err: any) {
    throw err;
  }
};

export const getDropDownForProjectsTasksAPI = async () => {
  try {
    return await $fetch.get(`/projects/drop-down`);
  } catch (err: any) {
    throw err;
  }
};
