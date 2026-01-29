import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../services/baseQuery";

export const companyApi = createApi({
  reducerPath: "companyApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Company"],
  endpoints: (builder) => ({
    getCompanies: builder.query({
      query: () => "/companies",
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
  useDeleteCompanyMutation,
} = companyApi;
