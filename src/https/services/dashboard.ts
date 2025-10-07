import { $fetch } from "../fetch";


interface GetAllPaginatedUsersPropTypes {
  pageIndex: number;
  pageSize: number;
  search_string?: string;
}

export const getDashboardStatistics = async ({
  pageIndex,
  pageSize,
  search_string,

}: GetAllPaginatedUsersPropTypes) => {
  try {
    const queryParams = {
      page: pageIndex,
      page_size: pageSize,
      search_string: search_string,
      // order_by: order_by,
    };
    return await $fetch.get("/dash-board/statistics", queryParams);
  } catch (err) {
    throw err;
  }
};

export const getetDashboardStatsAPI = async () => {
    try {
        const response = await $fetch.get("/dash-board/status");
        return response.data;
    } catch (err) {
        throw err;
    }
};

export const getTodayStatsAPI = async () => {
    try {
        const response = await $fetch.get("/dash-board/today-status");
        return response.data;
    } catch (err) {
        throw err;
    }
};

export interface SettingsHistoryQueryParams {
  pageIndex: number;
  pageSize: number;
  task_status?: string;
}

export const getTodayTasksAPI = async ({
  pageIndex,
  pageSize,
  task_status
}: SettingsHistoryQueryParams) => {
  try {
    const queryParams = {
      page: pageIndex,
      page_size: pageSize,
      task_status: task_status
    };
    return await $fetch.get(`/dash-board/today-tasks`, queryParams);
  } catch (err) {
    throw err;
  }
};