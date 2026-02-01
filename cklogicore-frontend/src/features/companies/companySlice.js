// src/features/companies/companySlice.js

import { createSlice } from "@reduxjs/toolkit";

const companySlice = createSlice({
  name: "companyUI",
  initialState: {
    isModalOpen: false,
    filters: {
      search: "",
      page: 1,
      limit: 10
    },
    selectedCompany: null,
  },
  reducers: {
    openCompanyModal: (s) => { s.isModalOpen = true; },
    closeCompanyModal: (s) => { s.isModalOpen = false; },
    setCompanyFilters:  (s, a) => { s.filters = { ...s.filters, ...a.payload }; },
    setSelectedCompany: (s, a) => { s.selectedCompany = a.payload; },
  },
});

export const {
  openCompanyModal,
  closeCompanyModal,
  setCompanyFilters,
  setSelectedCompany,
} = companySlice.actions;

export default companySlice.reducer;
