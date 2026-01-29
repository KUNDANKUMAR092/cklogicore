// src/features/suppliers/supplierSlice.js
import { createSlice } from "@reduxjs/toolkit";

const supplierSlice = createSlice({
  name: "supplierUI",
  initialState: {
    selected: null,
    isModalOpen: false,
  },
  reducers: {
    openModal: (s) => { s.isModalOpen = true; },
    closeModal: (s) => { s.isModalOpen = false; },
    setSelected: (s, a) => { s.selected = a.payload; },
  },
});


export default supplierSlice.reducer;
