import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"

import Login from "../pages/Login"
import Signup from "../pages/Signup"
import Dashboard from "../pages/Dashboard"
import Suppliers from "../pages/Suppliers"
import Companies from "../pages/Companies"
import Vehicles from "../pages/Vehicles"
import Trips from "../pages/Trips"
import Users from "../pages/Users"
import Unauthorized from "../pages/Unauthorized"

import ProtectedRoute from "../components/ProtectedRoute"
import PublicRoute from "./PublicRoute"
import AdminLayout from "../layout/AdminLayout"

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
        element={<ProtectedRoute roles={["ADMIN", "STAFF"]} />}
      >
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/users" element={<Users />} />
        </Route>
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
