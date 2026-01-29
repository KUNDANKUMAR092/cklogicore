import apiClient from "./apiClient.js"
import { sanitize } from "../utils/sanitize.js"

export const transportService = {
  create: async (payload) => {
    const cleanData = {
      ...payload,
      truckNumber: sanitize(payload.truckNumber),
      loadLocation: sanitize(payload.loadLocation),
      unloadLocation: sanitize(payload.unloadLocation)
    }
    const res = await apiClient.post("/transport/create", cleanData)
    return res.data
  },
  getAll: async (filters) => {
    const res = await apiClient.get("/transport/list", { params: filters })
    return res.data
  },
  downloadExcel: async (role, filters) => {
    const res = await apiClient.get("/excel/download", {
      params: { type: role, ...filters },
      responseType: "blob"
    })
    return res.data
  }
}
