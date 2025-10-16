import { AddChatsAPIPayload, GetAllPaginatedTasksPropTypes } from "@/interfaces/tasks";
import { $fetch } from "../fetch";

export const getAllPaginatedTasks = async ({
  pageIndex,
  pageSize,
  order_by,
  search_string,
  from_date,
  to_date,
  task_status,
}: GetAllPaginatedTasksPropTypes) => {
  try {
    const queryParams = {
      page: pageIndex,
      page_size: pageSize,
      order_by: order_by,
      search_string: search_string,
      from_date: from_date,
      to_date: to_date,
      task_status: task_status,
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

export const getSingleDropDownForAssignedUsersAPI = async ( project_id: number) => {
  try {
    return await $fetch.get(`/projects/${project_id}/users/assigned`);
  } catch (err: any) {
    throw err;
  }
};

export const updateTasksAPI = async (id: number, payload: any) => {
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

export const getTaskByIdAPI = async (id: number) => {
  try {
    const response = await $fetch.get(`/tasks/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const TasksStatusAPI = async(id: number, data: { task_status: string }) => {
  try{
    const response= await $fetch.patch(`/tasks/${id}/status`, data);
  }
  catch(error){
    throw error;
  }
}

export const getTaskAssignedUsersAPI = async(id: number) =>{
  try{
    const response = await $fetch.get(`/task-assignees/${id}/users`);
    return response;
  }
  catch(error){
    throw error;
  }
}

export const deleteTaskAssignedUserAPI = async (projectId: number, userId: number) => {
  try {
    const payload = { user_ids: [userId] };
    const response = await $fetch.delete(`/task-assignees/${projectId}/assignees`,  payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getTasksAvailableUsersAPI = async(id: number) =>{
  try{
    const response=await $fetch.get(`/task-assignees/${id}/non-assignees`);
    return response;
  }
  catch(error){
    throw error;
  }
}

export const addAsignedUserAPI = async (projectId: number, userId: number) => {
  try {
    const payload = {
      project_id: projectId,
      user_ids: [userId], 
    };
    const response = await $fetch.post(`/task-assignees/${projectId}/assignees`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getTasksStatsAPI = async () => {
    try {
        const response = await $fetch.get("/tasks/status/counts");
        return response.data;
    } catch (err) {
        throw err;
    }
};

export const getWeaklySummaryAPI = async () => {
    try {
        const response = await $fetch.get("/tasks/weekly-summary");
        return response.data;
    } catch (err) {
        throw err;
    }
};

export const getChatsByIdAPI = async (id: number, queryParams) => {
  try {
    const response = await $fetch.get(`/chats/${id}`, queryParams);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const addChatsByIdAPI = async (payload: AddChatsAPIPayload) => {
  try {
    const response = await $fetch.post(`/chats`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
}