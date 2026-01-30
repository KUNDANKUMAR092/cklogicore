import { createSlice } from "@reduxjs/toolkit";

const vehicleSlice = createSlice({
  name: "vehicleUI",
  initialState: {
    selectedVehicle: null,
    filters: {},
    isModalOpen: false,
  },
  reducers: {
    openVehicleModal: (s) => { s.isModalOpen = true; },
    setVehicleFilters: (s, a) => { s.filters = a.payload; },
    closeVehicleModal: (s) => { s.isModalOpen = false; },
    setSelectedVehicle: (s, a) => { s.selectedVehicle = a.payload; },
  },
});

export const {
  openVehicleModal,
  setVehicleFilters,
  closeVehicleModal,
  setSelectedVehicle,
} = vehicleSlice.actions;

export default vehicleSlice.reducer;
