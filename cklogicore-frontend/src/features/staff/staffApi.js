// src/features/staff/staffApi.js

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../services/baseQuery";

export const staffApi = createApi({
  reducerPath: "staffApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Staff"],
  endpoints: (builder) => ({
    // ✅ GET Staff with Pagination & Search
    getStaff: builder.query({
      query: (params) => ({
        url: "/users", // Backend endpoint same rahega
        params,
      }),
      transformResponse: (response) => ({
        list: response.data,
        total: response.total,
        page: response.page,
        limit: response.limit,
      }),
      providesTags: ["Staff"],
    }),

    // ✅ CREATE Staff
    createStaff: builder.mutation({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Staff"],
    }),

    // ✅ UPDATE Staff (Permissions update ke liye bhi yahi kaam aayega)
    updateStaff: builder.mutation({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Staff"],
    }),

    // ✅ Toggle
    toggleStaff: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/users/${id}/toggle-status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: ["Staff"],
    }),

    // ✅ DELETE Staff
    deleteStaff: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Staff"],
    }),
  }),
});

export const {
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useToggleStaffMutation,
  useDeleteStaffMutation,
} = staffApi;