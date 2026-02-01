// src/features/trips/tripSlice.js

import { createSlice } from "@reduxjs/toolkit";

const tripSlice = createSlice({
  name: "tripUI",
  initialState: {
    isModalOpen: false,
    filters: {
      search: "",
      page: 1,
      limit: 10
    },
    selectedTrip: null,
    
  },
  reducers: {
    openTripModal: (s) => { s.isModalOpen = true; },
    closeTripModal: (s) => { s.isModalOpen = false; },
    setTripFilters: (s, a) => { s.filters = { ...s.filters, ...a.payload }; },
    setSelectedTrip: (s, a) => { s.selectedTrip = a.payload; },
  },
});

export const { 
  openTripModal, 
  closeTripModal,
  setTripFilters, 
  setSelectedTrip, 
} = tripSlice.actions;

export default tripSlice.reducer;