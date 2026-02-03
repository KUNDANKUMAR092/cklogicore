import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../services/baseQuery";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  // TagTypes zaroori hain taaki data refresh ho sake (e.g., trip delete hone par stats update ho jayein)
  tagTypes: ["Dashboard"], 
  baseQuery: baseQueryWithReauth,
  
  endpoints: (builder) => ({
    
    // 1. GET Dashboard Stats (Cards ke liye: Total Trips, Revenue, etc.)
    getDashboardStats: builder.query({
      query: (filters) => ({
        url: "/dashboard/stats",
        method: "GET",
        params: filters, // Filter by dateRange, branch, etc.
      }),
      transformResponse: (response) => response.data || {},
      providesTags: ["Dashboard"],
    }),

  }),
});

// Hooks export
export const { 
  useGetDashboardStatsQuery, 
} = dashboardApi;







// import { createApi } from "@reduxjs/toolkit/query/react";
// import { baseQueryWithReauth } from "../../services/baseQuery";

// // src/features/dashboard/dashboardApi.js
// export const dashboardApi = createApi({
//   reducerPath: "dashboardApi",
//   baseQuery: baseQueryWithReauth,
//   endpoints: (builder) => ({
//     getDashboardStats: builder.query({
//       // 🛠️ Params/Filters receive 
//       query: (filters) => ({
//         url: "/dashboard/stats",
//         method: "GET",
//         params: filters, 
//       }),
//       providesTags: ["Dashboard"],
//     }),
//   }),
// });

// export const { useGetDashboardStatsQuery } = dashboardApi;