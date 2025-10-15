import { AddProjectData, ProjectData, TaskResponse, UsersDropdownResponse } from "@/interfaces/project";
import { $fetch } from "../fetch";

interface GetAllPaginatedUsersPropTypes {
  pageIndex: number;
  pageSize: number;
  viewMode: any;
  order_by: any;
  project_status: any;
  search_string: any;
}

export const getAllUsersProjects = async ({
  pageIndex,
  pageSize,
  viewMode,
  order_by,
  project_status,
  search_string,
}: GetAllPaginatedUsersPropTypes) => {
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

interface GetTasksByProjectIdParams {
  projectId: number;
  pageIndex: number;
  pageSize: number;
}

interface GetTasksByProjectIdParams {
  projectId: number;
  pageIndex: number;
  pageSize: number;
}

interface GetTasksByProjectIdParams {
  projectId: number;
  pageIndex: number;
  pageSize: number;
}

export const getTasksByProjectId = async ({
  projectId,
  pageIndex,
  pageSize,
}: GetTasksByProjectIdParams) => {
  try {
    // Construct query string manually
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


// GET /projects/:id/users/assigned
export const getAssignedUsersAPI = async(id: number) =>{
  try{
    const response = await $fetch.get(`/projects/${id}/users/assigned`);
    return response;
  }
  catch(error){
    throw error;
  }
}

// DELETE 
export const deleteAssignedUserAPI = async (projectId: number, userId: number) => {
  try {
    const payload = { user_ids: [userId] };
    const response = await $fetch.delete(`/projects/${projectId}/users`,  payload);
    return response;
  } catch (error) {
    throw error;
  }
};




// GET /projects/:id/users/available
export const getAvailableUsersAPI = async(id: number) =>{
  try{
    const response=await $fetch.get(`/projects/${id}/users/available`);
    return response;
  }
  catch(error){
    throw error;
  }
}

// POST /projects/:id/users/:userId
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
