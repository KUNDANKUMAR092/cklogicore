import { configureStore } from "@reduxjs/toolkit"

// APIs
import { authApi } from "../features/auth/authApi.js"
import { supplierApi } from "../features/suppliers/supplierApi";
import { companyApi } from "../features/companies/companyApi";
import { vehicleApi } from "../features/vehicles/vehicleApi";
import { tripApi } from "../features/trips/tripApi";
import { userApi } from "../features/users/userApi";
import { reportsApi } from "../features/reports/reportsApi";

// UI Slices
import authReducer from "../features/auth/authSlice.js"
import companyReducer from "../features/companies/companySlice";
import vehicleReducer from "../features/vehicles/vehicleSlice";
import tripReducer from "../features/trips/tripSlice";
import userReducer from "../features/users/userSlice";
import reportsReducer from "../features/reports/reportsSlice";

export const store = configureStore({
  reducer: {
    

    // RTK Query reducers
    [authApi.reducerPath]: authApi.reducer,
    [supplierApi.reducerPath]: supplierApi.reducer,
    [companyApi.reducerPath]: companyApi.reducer,
    [vehicleApi.reducerPath]: vehicleApi.reducer,
    [tripApi.reducerPath]: tripApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [reportsApi.reducerPath]: reportsApi.reducer,

    // UI reducers
    auth: authReducer,
    companyUI: companyReducer,
    vehicleUI: vehicleReducer,
    tripUI: tripReducer,
    userUI: userReducer,
    reportsUI: reportsReducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(
      authApi.middleware, 
      supplierApi.middleware,
      companyApi.middleware,
      vehicleApi.middleware,
      tripApi.middleware,
      userApi.middleware,
      reportsApi.middleware
    )
})









// import { configureStore } from "@reduxjs/toolkit"
// import authReducer from "../features/auth/authSlice.js"
// import transportReducer from "../features/transport/transportSlice.js"
// import dashboardReducer from "../features/dashboard/dashboardSlice.js"
// import { authApi } from "../features/auth/authApi.js"
// import { transportApi } from "../features/transport/transportApi.js"
// import { dashboardApi } from "../features/dashboard/dashboardApi.js"

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     transport: transportReducer,
//     dashboard: dashboardReducer,
//     [authApi.reducerPath]: authApi.reducer,
//     [dashboardApi.reducerPath]: dashboardApi.reducer,
//     [transportApi.reducerPath]: transportApi.reducer,
//   },
//   middleware: (getDefault) =>
//     getDefault().concat(authApi.middleware, transportApi.middleware)
// })