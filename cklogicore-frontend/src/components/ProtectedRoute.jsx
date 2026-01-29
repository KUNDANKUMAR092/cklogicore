import { Navigate, Outlet } from "react-router-dom"
import { useAppSelector } from "../app/hooks.js"

export default function ProtectedRoute({ roles }) {
  const { user, accessToken } = useAppSelector((state) => state.auth)

  // ⏳ Wait till auth hydrate
  if (accessToken && !user) {
    return null // ya loader
  }

  // ❌ Not logged in
  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  // ❌ Role check
  if (
    roles &&
    !roles.map(r => r.toLowerCase()).includes(user?.role?.toLowerCase())
  ) {
    return <Navigate to="/unauthorized" replace />
  }

  // ✅ Render nested routes
  return <Outlet />
}
