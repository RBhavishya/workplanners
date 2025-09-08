import { ProjectData, TaskResponse, UsersDropdownResponse } from "@/interfaces/project";
import { $fetch } from "../fetch";

// export const getAllProjectsAPI = async (queryParam: any) => {
//   try {
//     return await $fetch.get(`/projects?${queryParam}`);
//   } catch (error) {
//     throw error;
//   }
// };

interface GetAllPaginatedUsersPropTypes {
  pageIndex: number;
  pageSize: number;
  viewMode: any;
  order_by: any;
  search_string: any;
}

export const getAllPaginatedProjects = async ({
  pageIndex,
  pageSize,
  viewMode,
  order_by,
  search_string,
}: GetAllPaginatedUsersPropTypes) => {
  try {
    const queryParams = {
      page: pageIndex,
      page_size: pageSize,
      view_mode: viewMode,
      project_status: order_by,
      search_string: search_string,
    };
    return await $fetch.get("/projects", queryParams);
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

export const createProjectAPI = async (newProject: ProjectData) => {
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

export const getTasksByProjectId = async (projectId: number): Promise<TaskResponse> => {
  try {
    const response = await $fetch.get(`/projects/${projectId}/tasks`);
    return response;
  } catch (error) {
    throw error;
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

export const getAllProjectsWithUsersAPI = async (queryParam: string) => {
  try {
    const response = await $fetch.get(`/projects/users?${queryParam}`);
    return response;
  } catch (error) {
    throw error;
  }
};
