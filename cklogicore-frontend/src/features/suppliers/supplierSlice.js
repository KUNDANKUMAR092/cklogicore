// src/features/suppliers/supplierSlice.js

import { createSlice } from "@reduxjs/toolkit";

const supplierSlice = createSlice({
  name: "supplierUI",
  initialState: {
    isModalOpen: false,
    filters: {
      search: "",
      page: 1,
      limit: 10
    },
    selectedSupplier: null,
  },
  reducers: {
    openSupplierModal: (s) => { s.isModalOpen = true; },
    closeSupplierModal: (s) => { s.isModalOpen = false; },
    setSupplierFilters:  (s, a) => { s.filters = { ...s.filters, ...a.payload }; },
    setSelectedSupplier: (s, a) => { s.selectedSupplier = a.payload; },
  },
});

export const {
  openSupplierModal,
  closeSupplierModal,
  setSupplierFilters,
  setSelectedSupplier,
} = supplierSlice.actions;

export default supplierSlice.reducer;
