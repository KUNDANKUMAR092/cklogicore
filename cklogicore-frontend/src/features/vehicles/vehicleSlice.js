import { createSlice } from "@reduxjs/toolkit";

const vehicleSlice = createSlice({
  name: "vehicleUI",
  initialState: {
    selectedVehicle: null,
    isModalOpen: false,
  },
  reducers: {
    openVehicleModal: (s) => { s.isModalOpen = true; },
    closeVehicleModal: (s) => { s.isModalOpen = false; },
    setSelectedVehicle: (s, a) => { s.selectedVehicle = a.payload; },
  },
});

export const {
  openVehicleModal,
  closeVehicleModal,
  setSelectedVehicle,
} = vehicleSlice.actions;

export default vehicleSlice.reducer;
