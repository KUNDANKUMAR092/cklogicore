// src/features/vehicles/vehicleSlice.js

import { createSlice } from "@reduxjs/toolkit";

const vehicleSlice = createSlice({
  name: "vehicleUI",
  initialState: {
    isModalOpen: false,
    filters: {
      search: "",
      page: 1,
      limit: 10
    },
    selectedVehicle: null,
  },
  reducers: {
    openVehicleModal: (s) => { s.isModalOpen = true; },
    closeVehicleModal: (s) => { s.isModalOpen = false; },
    setVehicleFilters:  (s, a) => { s.filters = { ...s.filters, ...a.payload }; },
    setSelectedVehicle: (s, a) => { s.selectedVehicle = a.payload; },
  },
});

export const {
  openVehicleModal,
  closeVehicleModal,
  setVehicleFilters,
  setSelectedVehicle,
} = vehicleSlice.actions;

export default vehicleSlice.reducer;
