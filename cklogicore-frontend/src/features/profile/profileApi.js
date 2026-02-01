import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../services/baseQuery";

export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    
    // 1. GET /me (Latest Profile Details)
    getProfile: builder.query({
      query: () => "/profile/me", // Aapka router prefix jo bhi ho (e.g., /profile or /profile)
      transformResponse: (response) => response.data,
      providesTags: ["Profile"],
    }),

    // 2. PATCH /update (Name, Mobile, etc.)
    updateProfile: builder.mutation({
      query: (body) => ({
        url: "/profile/update",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),

    // 3. PATCH /update-avatar (Profile Picture Upload)
    updateAvatar: builder.mutation({
      query: (formData) => ({
        url: "/profile/update-avatar",
        method: "PATCH",
        body: formData,
        // RTK Query automatically set karega 'Content-Type': 'multipart/form-data'
      }),
      invalidatesTags: ["Profile"],
    }),

    updateBanner: builder.mutation({
      query: (formData) => ({
        url: "/profile/update-banner",
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: ["Profile"],
    }),

    // 4. PATCH /change-password
    changePassword: builder.mutation({
      query: (body) => ({
        url: "/profile/change-password",
        method: "PATCH",
        body, // { oldPassword, newPassword }
      }),
      // Password change par tag invalidate karne ki zaroorat nahi hoti
    }),

    // 5. POST /deactivate
    deactivateAccount: builder.mutation({
      query: (body) => ({
        url: "/profile/deactivate",
        method: "POST",
        body, // { password, reason }
      }),
    }),

  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  useUpdateBannerMutation,
  useChangePasswordMutation,
  useDeactivateAccountMutation,
} = profileApi;