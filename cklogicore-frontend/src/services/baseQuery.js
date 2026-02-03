import { fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { setCredentials, logout } from "../features/auth/authSlice"

const baseURL = import.meta.env.MODE === 'production'  ? '/api/v1'  : 'http://localhost:5000/api/v1';

const baseQuery = fetchBaseQuery({
  baseUrl: baseURL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken
    if (token) headers.set("Authorization", `Bearer ${token}`)
    return headers
  }
})

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    try {
      const refreshResult = await baseQuery(
        { url: "/auth/refresh-token", method: "GET" },
        api,
        extraOptions
      )

      if (refreshResult.data) {
        api.dispatch(setCredentials(refreshResult.data)) // ✅ store हटाया

        // retry original request
        result = await baseQuery(args, api, extraOptions)
      } else {
        api.dispatch(logout())
      }
    } catch {
      api.dispatch(logout())
    }
  }

  return result
}
