// src/features/reports/reportApi.js

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../services/baseQuery";


export const reportsApi = createApi({
  reducerPath: "reportsApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    supplierReport: builder.query({
      query: () => "/reports/suppliers",
    }),
    vehicleReport: builder.query({
      query: () => "/reports/vehicles",
    }),
    companyReport: builder.query({
      query: () => "/reports/companies",
    }),
    // profitReport: builder.query({
    //   query: () => "/reports/profit",
    // }),
  }),
});

export const {
  useSupplierReportQuery,
  useVehicleReportQuery,
  useCompanyReportQuery,
  useProfitReportQuery,
} = reportsApi;
