// src/features/dashboard/dashboardSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // UI related states
  filters: {
    dateRange: "thisMonth", // Default filter
    branchId: "",
    status: "all",
  },
  // Chart configurations ya extra UI states
  activeChartType: "bar", // e.g., 'bar', 'line'
  isStatsVisible: true,
};

const dashboardSlice = createSlice({
  name: "dashboardUI",
  initialState,
  reducers: {
    // 1. Dashboard filters update karne ke liye
    setDashboardFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const { 
  setDashboardFilters, 
} = dashboardSlice.actions;

export default dashboardSlice.reducer;




// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// // Async thunk to fetch dashboard data
// export const fetchDashboardData = createAsyncThunk(
//   "dashboard/fetchDashboardData",
//   async (filters = {}, thunkAPI) => {
//     try {
//       const data = "" || []
//       return data
//     } catch (error) {
//       return thunkAPI.rejectWithValue(error.response?.data || "Server Error")
//     }
//   }
// )

// const initialState = {
//   transports: [],  
//   filteredTransports: [],
//   chartData: [],
//   loading: false,
//   error: null,
//   filters: {} 
// }

// const dashboardSlice = createSlice({
//   name: "dashboard",
//   initialState,
//   reducers: {
//     setFilters: (state, action) => {
//       state.filters = action.payload
//     },
//     setFilteredTransports: (state, action) => {
//       state.filteredTransports = action.payload
//     },
//     setChartData: (state, action) => {
//       state.chartData = action.payload
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchDashboardData.pending, (state) => {
//         state.loading = true
//         state.error = null
//       })
//       .addCase(fetchDashboardData.fulfilled, (state, action) => {
//         state.loading = false
//         state.transports = action.payload
//         state.filteredTransports = action.payload
//         state.chartData = action.payload.map(t => ({
//           date: t.dates.loadDate,
//           profit: t.pricing.profitPerTon
//         }))
//       })
//       .addCase(fetchDashboardData.rejected, (state, action) => {
//         state.loading = false
//         state.error = action.payload
//       })
//   }
// })

// export const { setFilters, setFilteredTransports, setChartData } = dashboardSlice.actions
// export default dashboardSlice.reducer
