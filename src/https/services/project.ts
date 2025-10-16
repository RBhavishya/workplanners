import { AddProjectData, GetAllPaginatedProjectsPropTypes, GetTasksByProjectIdParams, ProjectData, TaskResponse, UsersDropdownResponse } from "@/interfaces/project";
import { $fetch } from "../fetch";

export const getAllUsersProjects = async ({
  pageIndex,
  pageSize,
  viewMode,
  order_by,
  project_status,
  search_string,
}: GetAllPaginatedProjectsPropTypes) => {
  try {
    const queryParams = {
      page: pageIndex,
      page_size: pageSize,
      view_mode: viewMode,
      project_status: project_status,
      order_by: order_by,
      search_string: search_string,
    };
    return await $fetch.get("/projects/users", queryParams);
  } catch (err) {
    throw err;
  }
};

export const getProjectByIdAPI = async (id: number) => {
  try {
    const response = await $fetch.get(`/projects/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const createProjectAPI = async (newProject: AddProjectData) => {
  try {
    const response = await $fetch.post(`/projects`, newProject);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateProjectAPI = async (id: number, updatedProject: Partial<ProjectData>) => {
  try {
    const response = await $fetch.patch(`/projects/${id}`, updatedProject);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAllUsersAPI = async (search: string = ""): Promise<UsersDropdownResponse> => {
  try {
    const response = await $fetch.get(`/users/dropdown?search_string=${encodeURIComponent(search)}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getTasksByProjectId = async ({
  projectId,
  pageIndex,
  pageSize,
}: GetTasksByProjectIdParams) => {
  try {
    const query = `?page=${pageIndex}&page_size=${pageSize}`;

    const response = await $fetch.get(`/projects/${projectId}/tasks${query}`);
    return response;
  } catch (err) {
    throw err;
  }
};

export const deleteProjectAPI = async (id: number) => {
  try {
    const response=await $fetch.delete(`/projects/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export const patchProjectStatusAPI = async(id: number, data: { project_status: string }) => {
  try{
    const response= await $fetch.patch(`/projects/${id}/status`, data);
  }
  catch(error){
    throw error;
  }
}

export const getAssignedUsersAPI = async(id: number) =>{
  try{
    const response = await $fetch.get(`/projects/${id}/users/assigned`);
    return response;
  }
  catch(error){
    throw error;
  }
}

export const deleteAssignedUserAPI = async (projectId: number, userId: number) => {
  try {
    const payload = { user_ids: [userId] };
    const response = await $fetch.delete(`/projects/${projectId}/users`,  payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAvailableUsersAPI = async(id: number) =>{
  try{
    const response=await $fetch.get(`/projects/${id}/users/available`);
    return response;
  }
  catch(error){
    throw error;
  }
}

export const assignUserAPI = async (projectId: number, userId: number) => {
  try {
    const payload = {
      project_id: projectId,
      user_ids: [userId], 
    };
    const response = await $fetch.post(`/projects/${projectId}/users`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getTaskStatusCountsAPI=async(id:number)=>{
  try{
    const response=await $fetch.get( `/projects/${id}/tasks/status`);
    return response.data;
  }catch(error){
    throw error;
  }
}
