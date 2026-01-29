import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../services/baseQuery";

export const vehicleApi = createApi({
  reducerPath: "vehicleApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Vehicle"],
  endpoints: (builder) => ({
    getVehicles: builder.query({
      query: () => "/vehicles",
      providesTags: ["Vehicle"],
    }),

    createVehicle: builder.mutation({
      query: (body) => ({
        url: "/vehicles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Vehicle"],
    }),

    updateVehicle: builder.mutation({
      query: ({ id, body }) => ({
        url: `/vehicles/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Vehicle"],
    }),

    deleteVehicle: builder.mutation({
      query: (id) => ({
        url: `/vehicles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vehicle"],
    }),
  }),
});

export const {
  useGetVehiclesQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
} = vehicleApi;
