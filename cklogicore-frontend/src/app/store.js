import { configureStore } from "@reduxjs/toolkit"

// APIs
import { reportsApi } from "../features/reports/reportsApi";
import { authApi } from "../features/auth/authApi.js"
import { supplierApi } from "../features/suppliers/supplierApi";
import { companyApi } from "../features/companies/companyApi";
import { vehicleApi } from "../features/vehicles/vehicleApi";
import { tripApi } from "../features/trips/tripApi";
import { staffApi } from "../features/staff/staffApi";
import { staffPermissionApi } from "../features/staffPermission/staffPermissionApi";

import { profileApi } from "../features/profile/profileApi";


// UI Slices
import reportsReducer from "../features/reports/reportsSlice";
import authReducer from "../features/auth/authSlice.js"
import companyReducer from "../features/companies/companySlice";
import vehicleReducer from "../features/vehicles/vehicleSlice";
import tripReducer from "../features/trips/tripSlice";
import staffReducer from "../features/staff/staffSlice";
import staffPermissionReducer from "../features/staffPermission/staffPermissionSlice";

import profileReducer from "../features/profile/profileSlice";


export const store = configureStore({
  reducer: {
    

    // RTK Query reducers
    [reportsApi.reducerPath]: reportsApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [supplierApi.reducerPath]: supplierApi.reducer,
    [companyApi.reducerPath]: companyApi.reducer,
    [vehicleApi.reducerPath]: vehicleApi.reducer,
    [tripApi.reducerPath]: tripApi.reducer,
    [staffApi.reducerPath]: staffApi.reducer,
    [staffPermissionApi.reducerPath]: staffPermissionApi.reducer,

    [profileApi.reducerPath]: profileApi.reducer,

    // UI reducers
    reportsUI: reportsReducer,
    auth: authReducer,
    companyUI: companyReducer,
    vehicleUI: vehicleReducer,
    tripUI: tripReducer,
    staffUI: staffReducer,
    staffPermissionUI: staffPermissionReducer,

    profileUI: profileReducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(
      reportsApi.middleware,
      authApi.middleware, 
      supplierApi.middleware,
      companyApi.middleware,
      vehicleApi.middleware,
      tripApi.middleware,
      staffApi.middleware,
      staffPermissionApi.middleware,

      profileApi.middleware
    )
})