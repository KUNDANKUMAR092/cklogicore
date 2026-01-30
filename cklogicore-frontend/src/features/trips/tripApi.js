import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../services/baseQuery";

export const tripApi = createApi({
  reducerPath: "tripApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Trip"],
  endpoints: (builder) => ({
    getTrips: builder.query({
      query: () => "/trips",
      providesTags: ["Trip"],
    }),

    createTrip: builder.mutation({
      query: (body) => ({
        url: "/trips",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Trip"],
    }),

    updateTrip: builder.mutation({
      query: ({ id, body }) => ({
        url: `/trips/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Trip"],
    }),

    toggleTrip: builder.mutation({
      query: ({ id, isDeleted }) => ({
        url: `/trips/${id}/toggle`,
        method: "PATCH",
        body: { isDeleted },
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
} = tripApi;
