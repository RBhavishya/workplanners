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