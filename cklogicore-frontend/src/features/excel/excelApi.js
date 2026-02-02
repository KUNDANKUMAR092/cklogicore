import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../services/baseQuery";

export const excelApi = createApi({
  reducerPath: "excelApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // Download logic
    exportTrips: builder.query({
      query: (filters) => ({
        url: "/excel/export-trips",
        method: "GET",
        params: filters,
        // Binary data (Excel file) handle karne ke liye
        responseHandler: async (response) => {
          if (response.ok) return response.blob();
          const errorData = await response.json();
          throw errorData;
        },
      }),
    }),
  }),
});

export const { useLazyExportTripsQuery } = excelApi;