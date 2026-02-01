import { createSlice } from "@reduxjs/toolkit";

const profileSlice = createSlice({
  name: "profileUI",
  initialState: {
    isEditing: false,
  },
  reducers: {
    toggleEdit: (state) => {
      state.isEditing = !state.isEditing;
    },
  },
});

export const { toggleEdit } = profileSlice.actions;
export default profileSlice.reducer;