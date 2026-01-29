import { NavLink } from "react-router-dom"
import { useAppSelector } from "../app/hooks"
import {
  FaTachometerAlt,
  FaTruck,
  FaBuilding,
  FaCar,
  FaRoute,
  FaUsers,
  FaTruckMoving,
} from "react-icons/fa"

export default function Sidebar({ sidebarOpen, toggleSidebar }) {
  const { user } = useAppSelector((state) => state.auth)

  const menu = [
    { label: "Dashboard", path: "/dashboard", roles: ["ADMIN", "STAFF"], icon: <FaTachometerAlt /> },
    { label: "Trips", path: "/trips", roles: ["ADMIN", "STAFF"], icon: <FaRoute /> },
    { label: "Suppliers", path: "/suppliers", roles: ["ADMIN"], icon: <FaTruck /> },
    { label: "Companies", path: "/companies", roles: ["ADMIN"], icon: <FaBuilding /> },
    { label: "Vehicles", path: "/vehicles", roles: ["ADMIN"], icon: <FaCar /> },
    { label: "Users", path: "/users", roles: ["ADMIN"], icon: <FaUsers /> },
  ]

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      ></div>

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-50 transform transition-transform duration-300 p-5
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static md:inset-0
        `}
      >
        {/* Sidebar heading */}
        <h1 className="text-xl font-bold mb-8 flex items-center gap-2 pl-1">
          <FaTruckMoving className="text-2xl text-yellow-400" />
          <span>CKLogicore</span>
        </h1>

        {/* Sidebar menu */}
        <nav className="space-y-1">
          {menu
            .filter((m) => m.roles.includes(user?.role))
            .map((m) => (
              <NavLink
                key={m.path}
                to={m.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-1 py-2 rounded transition ${
                    isActive ? "bg-gray-700" : "hover:bg-gray-800"
                  }`
                }
                onClick={toggleSidebar} // auto close on mobile
              >
                <span className="text-lg">{m.icon}</span>
                <span>{m.label}</span>
              </NavLink>
            ))}
        </nav>
      </aside>
    </>
  )
}







// import { NavLink } from "react-router-dom"
// import { useAppSelector } from "../app/hooks"

// // Icons
// import {
//   FaTachometerAlt,
//   FaTruck,
//   FaBuilding,
//   FaCar,
//   FaRoute,
//   FaUsers,
//   FaTruckMoving,
// } from "react-icons/fa"

// export default function Sidebar() {
//   const { user } = useAppSelector((state) => state.auth)

//   const menu = [
//     { label: "Dashboard", path: "/dashboard", roles: ["ADMIN", "STAFF"], icon: <FaTachometerAlt /> },
//     { label: "Suppliers", path: "/suppliers", roles: ["ADMIN"], icon: <FaTruck /> },
//     { label: "Companies", path: "/companies", roles: ["ADMIN"], icon: <FaBuilding /> },
//     { label: "Vehicles", path: "/vehicles", roles: ["ADMIN"], icon: <FaCar /> },
//     { label: "Trips", path: "/trips", roles: ["ADMIN", "STAFF"], icon: <FaRoute /> },
//     { label: "Users", path: "/users", roles: ["ADMIN"], icon: <FaUsers /> },
//   ]

//   return (
//     <aside className="w-64 bg-gray-900 text-white p-5">
      
//       {/* Sidebar heading */}
//       <h1 className="text-xl font-bold mb-8 flex items-center gap-2 pl-1">
//         <FaTruckMoving className="text-2xl text-yellow-400" />
//         <span>CKLogicore</span>
//       </h1>

//       {/* Sidebar menu */}
//       <nav className="space-y-1">
//         {menu
//           .filter((m) => m.roles.includes(user?.role))
//           .map((m) => (
//             <NavLink
//               key={m.path}
//               to={m.path}
//               className={({ isActive }) =>
//                 `flex items-center gap-3 px-1 py-2 rounded transition ${
//                   isActive ? "bg-gray-700" : "hover:bg-gray-800"
//                 }`
//               }
//             >
//               {/* Icon */}
//               <span className="text-lg">{m.icon}</span>

//               {/* Label */}
//               <span>{m.label}</span>
//             </NavLink>
//           ))}
//       </nav>
//     </aside>
//   )
// }