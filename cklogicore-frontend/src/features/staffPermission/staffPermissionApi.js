// src/features/staffPermission/staffPermissionApi.js

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../services/baseQuery";

export const staffPermissionApi = createApi({
  reducerPath: "staffPermissionApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["StaffPermission"],

  endpoints: (builder) => ({
    // ✅ GET All Staff Permissions (with Pagination & Search support)
    getStaffPermissions: builder.query({
      query: (params) => ({
        url: "/users/permissions",
        params, // page, limit, search
      }),

      transformResponse: (response) => ({
        list: response.data,
        total: response.total,
        page: response.page,
        limit: response.limit,
      }),

      providesTags: ["StaffPermission"],
    }),

    // ✅ UPDATE Permissions for a specific Staff
    updateStaffPermissions: builder.mutation({
      query: ({ id, permissions }) => ({
        url: `/users/${id}/permissions`,
        method: "PATCH",
        body: { permissions },
      }),

      transformResponse: (response) => response.data,

      invalidatesTags: ["StaffPermission"],
    }),

    // ✅ Reset Permissions (Optional: All permissions to false)
    resetStaffPermissions: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/permissions/reset`,
        method: "POST",
      }),
      invalidatesTags: ["StaffPermission"],
    }),
  }),
});

export const {
  useGetStaffPermissionsQuery,
  useUpdateStaffPermissionsMutation,
  useResetStaffPermissionsMutation,
} = staffPermissionApi;