import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "userUI",
  initialState: {
    selectedUser: null,
    filters: {},
  },
  reducers: {
    setSelectedUser: (s, a) => { s.selectedUser = a.payload; },
    setUserFilters: (s, a) => { s.filters = a.payload; },
  },
});

export const { setSelectedUser, setUserFilters } = userSlice.actions;
export default userSlice.reducer;