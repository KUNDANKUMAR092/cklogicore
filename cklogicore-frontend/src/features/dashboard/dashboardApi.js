import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../services/baseQuery";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => "/dashboard/stats", // Backend route: /api/v1/dashboard/stats
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;