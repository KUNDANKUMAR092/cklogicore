// src/features/trips/tripApi.js

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../services/baseQuery";

export const tripApi = createApi({
  reducerPath: "tripApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Trip"],
  endpoints: (builder) => ({
    
    // ✅ GET Trips with Pagination & Search
    getTrips: builder.query({
      query: (params) => ({
        url: "/trips",
        params, // Isse ?page=1&limit=10&search=... query banegi
      }),
      transformResponse: (response) => ({
        list: response.data,
        total: response.total,
        page: response.page,
        limit: response.limit,
      }),
      providesTags: ["Trip"],
    }),

    // ✅ CREATE
    createTrip: builder.mutation({
      query: (body) => ({
        url: "/trips",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Trip"],
    }),

    // ✅ UPDATE (PUT ko aksar PATCH bhi use karte hain, check your backend)
    updateTrip: builder.mutation({
      query: ({ id, body }) => ({
        url: `/trips/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Trip"],
    }),

    // ✅ TOGGLE / SOFT DELETE
    toggleTrip: builder.mutation({
      query: ({ id, isDeleted }) => ({
        url: `/trips/${id}/toggle`,
        method: "PATCH",
        body: { isDeleted },
      }),
      invalidatesTags: ["Trip"],
    }),

    // ✅ DELETE (Physical Delete)
    deleteTrip: builder.mutation({
      query: (id) => ({
        url: `/trips/${id}`,
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
  useDeleteTripMutation, // Hook export karein
} = tripApi;
