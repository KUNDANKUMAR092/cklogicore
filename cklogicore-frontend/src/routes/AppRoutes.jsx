import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"

import PublicRoute from "./PublicRoute"
import ProtectedRoute from "../components/ProtectedRoute"
import AdminLayout from "../layout/AdminLayout"
import Unauthorized from "../pages/Unauthorized"

import Login from "../pages/Login"
import Signup from "../pages/Signup"
import Dashboard from "../pages/Dashboard"
import Trips from "../pages/Trips"
import Suppliers from "../pages/Suppliers"
import Companies from "../pages/Companies"
import Vehicles from "../pages/Vehicles"
import StaffListPage from "../pages/StaffListPage"
import StaffPermissionsPage from "../pages/StaffPermissionsPage"

import ProfilePage from "../pages/ProfilePage"

// Roles: ADMIN, COMPANY, OWNER
export default function AppRoutes() {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* ================= PROTECTED ADMIN ROUTES ================= */}
      <Route
        element={<ProtectedRoute roles={["OWNER", "STAFF"]} />}
      >
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/staff/list" element={<StaffListPage />} />
          <Route path="/staff/staff-permissions" element={<StaffPermissionsPage />} />

          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
