import { Navigate } from "react-router-dom"
import { useAppSelector } from "../app/hooks"

export default function PublicRoute({ children }) {
  const { user, accessToken } = useAppSelector((state) => state.auth)

  // ⏳ Wait until redux is hydrated
  if (accessToken && !user) {
    return null
  }

  // ✅ Already logged in → dashboard
  if (user && accessToken) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
