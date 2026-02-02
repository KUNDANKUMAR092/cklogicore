// src/features/trips/tripApi.js

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../services/baseQuery";

export const tripApi = createApi({
  reducerPath: "tripApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Trip"],
  endpoints: (builder) => ({
    
    // ✅ GET Trips with Pagination, Search & Summary
    getTrips: builder.query({
      query: (params) => ({
        url: "/trips",
        params, 
      }),
      transformResponse: (response) => ({
        list: response.data || [],
        total: response.pagination?.totalRecords || 0,
        summary: response.summary || {}, // Backend se summary bhi aa rahi hai
        currentPage: response.pagination?.currentPage || 1,
      }),
      providesTags: ["Trip"],
    }),

    // ✅ CREATE (FormData automatically handled by RTK Query)
    createTrip: builder.mutation({
      query: (formData) => ({
        url: "/trips",
        method: "POST",
        body: formData, 
      }),
      invalidatesTags: ["Trip"],
    }),

    // ✅ UPDATE (Aapke backend mein PATCH route hai)
    updateTrip: builder.mutation({
      query: ({ id, body }) => ({
        url: `/trips/${id}`,
        method: "PATCH",
        body: body, 
      }),
      invalidatesTags: ["Trip"],
    }),

    // ✅ TOGGLE STATUS (Aapke backend route ke mutabik)
    toggleTrip: builder.mutation({
      query: ({ id }) => ({
        url: `/trips/${id}/toggle-status`, // Fix: Match backend route
        method: "PATCH",
      }),
      invalidatesTags: ["Trip"],
    }),

    // ✅ DELETE (Soft Delete backend handle kar raha hai)
    deleteTrip: builder.mutation({
      query: (id) => ({
        url: `/trips/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Trip"],
    }),

    // ✅ UPDATE WORKFLOW STATUS
    updateWorkflow: builder.mutation({
      query: ({ id, status }) => ({
        url: `/trips/${id}/workflow`,
        method: "PATCH",
        body: { status }, // JSON payload (pending, running, etc.)
      }),
      invalidatesTags: ["Trip"],
    }),

    // ✅ ADD CHALLANS (Separate Upload)
    addChallans: builder.mutation({
      query: ({ id, files }) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("challans", file));
        
        return {
          url: `/trips/${id}/challans`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Trip"],
    }),

    // ✅ REMOVE CHALLAN
    removeChallan: builder.mutation({
      query: ({ id, challanId }) => ({
        url: `/trips/${id}/challans/${challanId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Trip"],
    }),


  }),
});

export const {
  useGetTripsQuery,
  useCreateTripMutation,
  useUpdateTripMutation,
  useToggleTripMutation,
  useDeleteTripMutation,
  useUpdateWorkflowMutation,
  useAddChallansMutation,
  useRemoveChallanMutation,
} = tripApi;