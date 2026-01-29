import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { setCredentials, logout as logoutAction } from "./authSlice.js"
import { baseQueryWithReauth } from "../../services/baseQuery.js"

export const authApi = createApi({
  reducerPath: "authApi",
  // baseQuery: fetchBaseQuery({
  //   baseUrl: "http://localhost:5000/api/auth/v1",
  //   credentials: "include"
  // }),
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // ================= LOGIN =================
    login: builder.mutation({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials(data))
        } catch (err) {
          // optional: handle error here
        }
      }
    }),

    // ================= SIGNUP =================
    signup: builder.mutation({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials(data))
        } catch (err) {
          // optional: handle error here
        }
      }
    }),

    // ================= REFRESH TOKEN =================
    refreshToken: builder.mutation({
      query: () => ({
        url: "/auth/refresh-token",
        method: "POST"
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials(data))
        } catch (err) {
          // optional: handle error here
        }
      }
    }),

    // ================= LOGOUT =================
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST"
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(logoutAction()) // clear auth state
        } catch (err) {
          // optional: handle error here
        }
      }
    })
  })
})

// ✅ Export all hooks
export const {
  useLoginMutation,
  useSignupMutation,
  useRefreshTokenMutation,
  useLogoutMutation
} = authApi

