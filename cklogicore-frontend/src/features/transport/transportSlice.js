import { createSlice } from "@reduxjs/toolkit"
import { transportApi } from "./transportApi.js"

const initialState = {
  transports: [],
  filters: {},
  loading: false,
  error: null
}

const transportSlice = createSlice({
  name: "transport",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      transportApi.endpoints.getTransports.matchFulfilled,
      (state, action) => {
        state.transports = action.payload
        state.loading = false
      }
    )
    builder.addMatcher(
      transportApi.endpoints.getTransports.matchPending,
      (state) => { state.loading = true }
    )
    builder.addMatcher(
      transportApi.endpoints.getTransports.matchRejected,
      (state, action) => {
        state.error = action.error
        state.loading = false
      }
    )
  }
})

export const { setFilters } = transportSlice.actions
export default transportSlice.reducer
