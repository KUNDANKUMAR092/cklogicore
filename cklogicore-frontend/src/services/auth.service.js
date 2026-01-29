import apiClient from "./apiClient"
import { sanitize } from "../utils/sanitize"

export const authService = {
  login: async (email, password) => {
    const res = await apiClient.post("/auth/login", {
      email: sanitize(email),
      password: sanitize(password)
    })
    return res.data
  },

  logout: async () => {
    await apiClient.post("/auth/logout")
  },

  me: async () => {
    const res = await apiClient.get("/auth/me")
    return res.data
  }
}
