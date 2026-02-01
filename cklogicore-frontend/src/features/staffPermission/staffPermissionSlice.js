// src/features/staffPermission/staffPermissionSlice.js

import { createSlice } from "@reduxjs/toolkit";

const staffPermissionSlice = createSlice({
  name: "staffPermissionUI",
  initialState: {
    filters: {
      search: "",
      page: 1,
      limit: 10
    },
    selectedStaffId: null,
  },
  reducers: {
    setPermissionSearch: (s, a) => {
      s.filters.search = a.payload;
      s.filters.page = 1; // Search karne par page 1 par reset karein
    },
    setPermissionPage: (s, a) => {
      s.filters.page = a.payload;
    },
    setSelectedStaffId: (s, a) => {
      s.selectedStaffId = a.payload;
    },
  },
});

export const {
  setPermissionSearch,
  setPermissionPage,
  setSelectedStaffId,
} = staffPermissionSlice.actions;

export default staffPermissionSlice.reducer;