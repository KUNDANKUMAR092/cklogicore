import { createSlice } from "@reduxjs/toolkit";

const reportsSlice = createSlice({
  name: "reportsUI",
  initialState: {
    activeTab: "profit",
  },
  reducers: {
    setActiveReportTab: (s, a) => { s.activeTab = a.payload; },
  },
});

export const { setActiveReportTab } = reportsSlice.actions;
export default reportsSlice.reducer;
