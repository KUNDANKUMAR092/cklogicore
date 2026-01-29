import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useLocation } from "react-router-dom"
import { logout } from "../features/auth/authSlice"
import { formatPathName, formatRole } from "../utils/reUseableFn"

export default function Topbar({ toggleSidebar }) {
  const { user } = useSelector((state) => state.auth)
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("accessToken")
    window.location.href = "/login"
  }

  return (
    <div className="w-full h-16 bg-white shadow flex items-center justify-between px-6">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-4">
        {/* Hamburger */}
        <button
          onClick={toggleSidebar}
          className="md:hidden py-2 rounded hover:bg-gray-200"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h2 className="text-xl font-semibold text-gray-700">
          {formatRole(user?.role)} {formatPathName(location.pathname.replace("/", "")) || "Dashboard"}
        </h2>
      </div>

      {/* Right: User Info */}
      <div className="flex items-center gap-4">
        {user && <span className="text-gray-600 text-sm">👤 {user.name || user.email}</span>}
        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  )
}







// import { useDispatch, useSelector } from "react-redux"
// import { useNavigate, useLocation } from "react-router-dom"
// import { logout } from "../features/auth/authSlice"
// import { formatPathName, formatRole } from "../utils/reUseableFn"
// // import { logout } from "../../redux/slices/authSlice"

// export default function Topbar() {
//   const dispatch = useDispatch()
//   const navigate = useNavigate()
//   const location = useLocation()

//   const { user } = useSelector((state) => state.auth)

//   const handleLogout = () => {
//     dispatch(logout())

//     localStorage.removeItem("user")
//     localStorage.removeItem("accessToken")

//     navigate("/login")
//   }

//   return (
//     <div className="w-full h-16 bg-white shadow flex items-center justify-between px-6">

//       {/* Left: Logo / Title */}
//       <h2 className="text-xl font-semibold text-gray-700">
//         {formatRole(user?.role)} {formatPathName(location.pathname) || "Dashboard"}
//       </h2>

//       {/* Right: User Info */}
//       <div className="flex items-center gap-4">

//         {user && (
//           <span className="text-gray-600 text-sm">
//             👤 {user.name || user.email}
//           </span>
//         )}

//         <button
//           onClick={handleLogout}
//           className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
//         >
//           Logout
//         </button>

//       </div>
//     </div>
//   )
// }