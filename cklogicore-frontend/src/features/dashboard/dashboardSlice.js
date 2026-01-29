import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { transportService } from "../../services/transport.service.js"

// Async thunk to fetch dashboard data
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchDashboardData",
  async (filters = {}, thunkAPI) => {
    try {
      const data = await transportService.getAll(filters)
      return data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Server Error")
    }
  }
)

const initialState = {
  transports: [],         // All transport records
  filteredTransports: [], // Filtered data for charts or table
  chartData: [],          // Data formatted for charts
  loading: false,
  error: null,
  filters: {}             // Current applied filters
}

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload
    },
    setFilteredTransports: (state, action) => {
      state.filteredTransports = action.payload
    },
    setChartData: (state, action) => {
      state.chartData = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false
        state.transports = action.payload
        state.filteredTransports = action.payload
        state.chartData = action.payload.map(t => ({
          date: t.dates.loadDate,
          profit: t.pricing.profitPerTon
        }))
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { setFilters, setFilteredTransports, setChartData } = dashboardSlice.actions
export default dashboardSlice.reducer
