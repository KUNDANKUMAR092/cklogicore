// src/features/staff/staffSlice.js

import { createSlice } from "@reduxjs/toolkit";

const staffSlice = createSlice({
  name: "staffUI",
  initialState: {
    isModalOpen: false,
    filters: {
      search: "",
      page: 1,
      limit: 10
    },
    selectedStaff: null,
  },
  reducers: {
    openStaffModal: (s) => { s.isModalOpen = true; },
    closeStaffModal: (s) => { s.isModalOpen = false; },
    setStaffFilters:   (s, a) => { s.filters = { ...s.filters, ...a.payload }; },
    setSelectedStaff: (s, a) => { s.selectedVehicle = a.payload; },
  },
});

export const {
  openStaffModal,
  closeStaffModal,
  setStaffFilters,
  setSelectedStaff,
} = staffSlice.actions;

export default staffSlice.reducer;