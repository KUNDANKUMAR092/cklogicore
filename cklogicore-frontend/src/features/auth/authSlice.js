import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null, // ✅ restore from localStorage
  accessToken: localStorage.getItem("accessToken") || null
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      console.log("user===>redux",action.payload )
      console.log("accessToken====>redux", action.payload)
      state.user = action.payload.user
      state.accessToken = action.payload.token
      // ✅ save to localStorage
      localStorage.setItem("user", JSON.stringify(action.payload.user))
      localStorage.setItem("accessToken", action.payload.token)
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      // ✅ clear localStorage
      localStorage.removeItem("user")
      localStorage.removeItem("accessToken")
    }
  }
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
