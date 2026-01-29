import { createSlice } from "@reduxjs/toolkit";

const companySlice = createSlice({
  name: "companyUI",
  initialState: {
    selectedCompany: null,
    isModalOpen: false,
  },
  reducers: {
    openCompanyModal: (s) => { s.isModalOpen = true; },
    closeCompanyModal: (s) => { s.isModalOpen = false; },
    setSelectedCompany: (s, a) => { s.selectedCompany = a.payload; },
  },
});

export const {
  openCompanyModal,
  closeCompanyModal,
  setSelectedCompany,
} = companySlice.actions;

export default companySlice.reducer;
