import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../services/baseQuery";

export const supplierApi = createApi({
  reducerPath: "supplierApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Supplier"],
  endpoints: (builder) => ({
    getSuppliers: builder.query({
      query: () => "/suppliers",
      providesTags: ["Supplier"],
    }),

    createSupplier: builder.mutation({
      query: (body) => ({
        url: "/suppliers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Supplier"],
    }),

    updateSupplier: builder.mutation({
      query: ({ id, body }) => ({
        url: `/suppliers/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Supplier"],
    }),

    deleteSupplier: builder.mutation({
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
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = supplierApi;
