import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { baseQueryWithReauth } from "../../services/baseQuery"

export const transportApi = createApi({
  reducerPath: "transportApi",
  // baseQuery: fetchBaseQuery({
  //   baseUrl: "http://localhost:5000/api/v1/",
  //   credentials: "include"
  // }),
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Transport"],
  endpoints: (builder) => ({
    addTransport: builder.mutation({
      query: (formData) => ({
        url: "/transport",
        method: "POST",
        body: formData
      })
    }),

    getTransports: builder.query({
      query: () => "/transport"
    })
  })
})

// ✅ THIS EXPORT IS MUST
export const {
  useAddTransportMutation,
  useGetTransportsQuery
} = transportApi
