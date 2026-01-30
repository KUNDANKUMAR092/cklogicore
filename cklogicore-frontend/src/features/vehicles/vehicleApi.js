import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../services/baseQuery";

export const vehicleApi = createApi({
  reducerPath: "vehicleApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Vehicle"],

  endpoints: (builder) => ({

    // ✅ GET Vehicles
    getVehicles: builder.query({
      query: (params) => ({
        url: "/vehicles",
        params, // page, limit, search
      }),

      transformResponse: (response) => ({
        list: response.data,
        total: response.total,
        page: response.page,
        limit: response.limit,
      }),

      providesTags: ["Vehicle"],
    }),

    // ✅ CREATE
    createVehicle: builder.mutation({
      query: (body) => ({
        url: "/vehicles",
        method: "POST",
        body,
      }),

      transformResponse: (response) => response.data,

      invalidatesTags: ["Vehicle"],
    }),

    // ✅ UPDATE
    updateVehicle: builder.mutation({
      query: ({ id, body }) => ({
        url: `/vehicles/${id}`,
        method: "PUT",
        body,
      }),

      transformResponse: (response) => response.data,

      invalidatesTags: ["Vehicle"],
    }),

    // ✅ Toggle
    toggleVehicle: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/vehicles/${id}/toggle`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: ["Vehicle"],
    }),

  }),
});

export const {
  useGetVehiclesQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useToggleVehicleMutation,
} = vehicleApi;
