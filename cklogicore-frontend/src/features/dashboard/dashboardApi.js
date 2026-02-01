// src/features/dashboard/dashboardApi.js

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { baseQueryWithReauth } from "../../services/baseQuery"

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  // baseQuery: fetchBaseQuery({
  //   baseUrl: "http://localhost:5000/api/v1/dashboard",
  //   credentials: "include",
  //   prepareHeaders: (headers, { getState }) => {
  //     const token = getState().auth.accessToken
  //     if (token) headers.set("Authorization", `Bearer ${token}`)
  //     return headers
  //   }
  // }),
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getDashboardData: builder.query({
      query: (filters) => ({
        url: "/data",
        params: filters
      })
    })
  })
})

export const { useGetDashboardDataQuery } = dashboardApi
