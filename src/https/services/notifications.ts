import { $fetch } from "@/https/fetch";

interface GetAllPaginatedNotificationsPropTypes {
  current_page?: number;
  page_size?: number;
}
export const getAllNotificationsAPI = async ({
  current_page,
  page_size
}: GetAllPaginatedNotificationsPropTypes) => {
  try {
    const queryParams = {
      page: current_page,
      page_size: page_size,
    };
    return await $fetch.get(`/notifications`, queryParams);
  } catch (err: any) {
    throw err;
  }
};

export const markAsReadAPI = async (id: any) => {
  try {
    return await $fetch.patch(`/notifications/${id}`);
  } catch (err) {
    throw err;
  }
};