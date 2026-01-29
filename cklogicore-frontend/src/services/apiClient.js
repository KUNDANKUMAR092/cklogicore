import axios from "axios"
import { store } from "../app/store.js"
import { logout, setCredentials } from "../features/auth/authSlice.js"

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true
})

apiClient.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const res = await axios.get("http://localhost:5000/api/v1/auth/refresh", {
          withCredentials: true
        })
        store.dispatch(setCredentials(res.data))
        original.headers.Authorization = `Bearer ${res.data.accessToken}`
        return apiClient(original)
      } catch {
        store.dispatch(logout())
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
