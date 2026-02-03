// src/features/auth/authSlice.js

import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null, // ✅ restore from localStorage
  accessToken: localStorage.getItem("accessToken") || null,
  entityId: localStorage.getItem("entityId") || null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, entityId } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.entityId = entityId || user?.entityId || null;
      // ✅ save to localStorage
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("accessToken", action.payload.accessToken);
      if (state.entityId) {
        localStorage.setItem("entityId", state.entityId);
      }
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.entityId = null;
      // ✅ clear localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("entityId");
    }
  }
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
