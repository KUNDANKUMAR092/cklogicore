// src/features/suppliers/supplierApi.js

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../services/baseQuery";

export const supplierApi = createApi({
  reducerPath: "supplierApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Supplier"],

  endpoints: (builder) => ({

    // ✅ GET Company
    getSuppliers: builder.query({
      query: (params) => ({
        url: "/suppliers",
        params, // page, limit, search
      }),

      transformResponse: (response) => ({
        list: response.data,
        total: response.total,
        page: response.page,
        limit: response.limit,
      }),

      providesTags: ["Supplier"],
    }),

    createSuppliers: builder.mutation({
      query: (body) => ({
        url: "/suppliers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Supplier"],
    }),

    updateSuppliers: builder.mutation({
      query: ({ id, body }) => ({
        url: `/suppliers/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Supplier"],
    }),

    // ✅ Toggle
    toggleSuppliers: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/suppliers/${id}/toggle-status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: ["Supplier"],
    }),

    deleteSuppliers: builder.mutation({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Supplier"],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useCreateSuppliersMutation,
  useUpdateSuppliersMutation,
  useToggleSuppliersMutation,
  useDeleteSuppliersMutation,
} = supplierApi;
