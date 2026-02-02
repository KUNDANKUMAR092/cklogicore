import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, logout } from "../features/auth/authSlice";

// Ek simple flag banaiye refresh track karne ke liye
let isRefreshing = false;

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  }
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  // Wait if another request is already refreshing
  if (isRefreshing) {
    // Thoda wait karlo taaki naya token state mein aa jaye
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResult = await baseQuery(
          { url: "/auth/refresh-token", method: "POST" },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          // Backend se user data aur token dono milenge ab
          api.dispatch(setCredentials(refreshResult.data));
          
          // Retry original request
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(logout());
        }
      } catch {
        api.dispatch(logout());
      } finally {
        isRefreshing = false; // Flag reset karein
      }
    } else {
      // Agar pehle se refresh chal raha hai, toh thoda wait karke retry karein
      await new Promise(resolve => setTimeout(resolve, 800));
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};