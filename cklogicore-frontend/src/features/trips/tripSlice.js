import { createSlice } from "@reduxjs/toolkit";

const tripSlice = createSlice({
  name: "tripUI",
  initialState: {
    selectedTrip: null,
    filters: {},
  },
  reducers: {
    setSelectedTrip: (s, a) => { s.selectedTrip = a.payload; },
    setTripFilters: (s, a) => { s.filters = a.payload; },
  },
});

export const { setSelectedTrip, setTripFilters } = tripSlice.actions;
export default tripSlice.reducer;
