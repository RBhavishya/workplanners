import { $fetch } from "../fetch";


interface GetAllPaginatedUsersPropTypes {
  pageIndex: number;
  pageSize: number;
}

export const getDashboardStatistics = async ({
  pageIndex,
  pageSize,
}: GetAllPaginatedUsersPropTypes) => {
  try {
    const queryParams = {
      page: pageIndex,
      page_size: pageSize,
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