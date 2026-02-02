import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../services/baseQuery";

// src/features/dashboard/dashboardApi.js
export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      // 🛠️ Params/Filters receive karein
      query: (filters) => ({
        url: "/dashboard/stats",
        method: "GET",
        params: filters, // Ye ?startDate=... banayega
      }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;