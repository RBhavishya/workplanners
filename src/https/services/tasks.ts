import { $fetch } from "../fetch";
interface GetAllPaginatedUsersPropTypes {
  pageIndex: number;
  pageSize: number;
  order_by: any;
  search_string: any;
  from_date: string;
  to_date: string;
  task_status: string;
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
  task_status,
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
      task_status: task_status,
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

export const getSingleDropDownForAssignedUsersAPI = async ( project_id:any) => {
  try {
    return await $fetch.get(`/projects/${project_id}/users/assigned`);
  } catch (err: any) {
    throw err;
  }
};

export const updateTasksAPI = async (id: any, payload: any) => {
  try {
    return await $fetch.patch(`/tasks/${id}`, payload);
  } catch (err) {
    throw err;
  }
};

export const gettasksByIdAPI = async (id: number) => {
  try {
    const response = await $fetch.get(`/tasks/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteTasksAPI = async (id: number) => {
  try {
    const payload = { task_ids: [id] };
    const response = await $fetch.delete(`/task-assignees/${id}`,  payload);
    return response;
  } catch (error) {
    throw error;
  }
};
