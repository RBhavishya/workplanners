import { ProjectData } from "@/interfaces/project";
import { $fetch } from "../fetch";
interface GetAllPaginatedUsersPropTypes {
  pageIndex: number;
  pageSize: number;
  order_by: any;
  search_string: any;
}

export const getAllPaginatedUsers = async ({
  pageIndex,
  pageSize,
  order_by,
  search_string,

}: GetAllPaginatedUsersPropTypes) => {
  try {
    const queryParams = {
      page: pageIndex,
      page_size: pageSize,
      order_by: order_by,
      search_string: search_string,
    };
    return await $fetch.get("/users", queryParams);
  } catch (err) {
    throw err;
  }
};

export const deleteUserAPI = async (id: number) => {
  try {
    const payload = {users_id: [id] };
    const response = await $fetch.delete(`/users/${id}`,  payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const createUserAPI = async (payload: ProjectData) => {
  try {
    const response = await $fetch.post(`/users`,payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const UserUpdateAPI = async (id: any, payload: any) => {
  try {
    return await $fetch.patch(`/users/${id}`, payload);
  } catch (err) {
    throw err;
  }
};

export const updateUserStatusAPI = async (userId: any, payload: any) => {
  try {
    return await $fetch.patch(`/users/${userId}/status`, payload);
  } catch (err) {
    throw err;
  }
};

export const getusersByIdAPI = async (id: number) => {
  try {
    const response = await $fetch.get(`/users/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};
