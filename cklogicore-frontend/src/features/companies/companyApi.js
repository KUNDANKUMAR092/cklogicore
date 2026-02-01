// src/features/companies/companyApi.js

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../services/baseQuery";

export const companyApi = createApi({
  reducerPath: "companyApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Company"],

  endpoints: (builder) => ({

    // ✅ GET Company
    getCompanies: builder.query({
      query: (params) => ({
        url: "/companies",
        params, // page, limit, search
      }),

      transformResponse: (response) => ({
        list: response.data,
        total: response.total,
        page: response.page,
        limit: response.limit,
      }),

      providesTags: ["Company"],
    }),

    createCompany: builder.mutation({
      query: (body) => ({
        url: "/companies",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Company"],
    }),

    updateCompany: builder.mutation({
      query: ({ id, body }) => ({
        url: `/companies/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Company"],
    }),

    // ✅ Toggle
    toggleCompany: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/companies/${id}/toggle-status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: ["Company"],
    }),

    deleteCompany: builder.mutation({
      query: (id) => ({
        url: `/companies/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Company"],
    }),
  }),
});

export const {
  useGetCompaniesQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useToggleCompanyMutation,
  useDeleteCompanyMutation,
} = companyApi;
