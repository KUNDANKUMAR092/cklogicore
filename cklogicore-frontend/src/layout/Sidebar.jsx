import React, { useState } from "react"
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
  FaChevronDown,
  FaChevronRight,
  FaUserShield,
} from "react-icons/fa"

export default function Sidebar({ sidebarOpen, toggleSidebar }) {
  const { user } = useAppSelector((state) => state.auth)
  const [staffOpen, setStaffOpen] = useState(false); // Dropdown toggle state

  const userRole = user?.role?.toUpperCase();
  const userAccountType = user?.accountType?.toUpperCase();

  const menu = [
    { label: "Dashboard", path: "/dashboard", roles: ["OWNER", "STAFF"], hiddenFor: [], icon: <FaTachometerAlt /> },
    { label: "Trips", path: "/trips", roles: ["OWNER", "STAFF"], hiddenFor: [], icon: <FaRoute /> },
    { label: "Suppliers", path: "/suppliers", roles: ["OWNER"], hiddenFor: ["SUPPLIER"], icon: <FaTruck /> },
    { label: "Companies", path: "/companies", roles: ["OWNER"], hiddenFor: ["COMPANY"], icon: <FaBuilding /> },
    { label: "Vehicles", path: "/vehicles", roles: ["OWNER"], hiddenFor: ["VEHICLE"], icon: <FaCar /> },
    
    // Updated Staff Section with Sub-menu
    // { 
    //   label: "Staff", 
    //   path: "/staff", // Base path
    //   roles: ["OWNER"], 
    //   hiddenFor: [], 
    //   icon: <FaUsers />,
    //   isDropdown: true,
    //   subItems: [
    //     { label: "Staff List", path: "/staff/list", icon: <FaUsers size={14}/> },
    //     { label: "Staff Permissions", path: "/staff/staff-permissions", icon: <FaUserShield size={14}/> }, 
    //   ]
    // },
  ]

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      ></div>

      <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-50 transform transition-transform duration-300 p-5 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:inset-0`}>
        <h1 className="text-xl font-bold mb-8 flex items-center gap-2 pl-1">
          <FaTruckMoving className="text-2xl text-yellow-400" />
          <span>CKLogicore</span>
        </h1>

        <nav className="space-y-1">
          {menu
            .filter((item) => userRole && item.roles.includes(userRole) && !item.hiddenFor.includes(userAccountType))
            .map((m) => {
              // Agar dropdown hai toh alag render hoga
              if (m.isDropdown) {
                return (
                  <div key={m.label} className="space-y-1">
                    <button
                      onClick={() => setStaffOpen(!staffOpen)}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded transition hover:bg-gray-800 text-gray-300"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{m.icon}</span>
                        <span>{m.label}</span>
                      </div>
                      {staffOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                    </button>
                    
                    {/* Sub-menu rendering */}
                    {staffOpen && (
                      <div className="ml-9 space-y-1 bg-gray-800/50 rounded-md py-1">
                        {m.subItems.map((sub) => (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-2 rounded text-sm transition ${
                                isActive ? "text-yellow-400 font-medium" : "text-gray-400 hover:text-white"
                              }`
                            }
                            onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}
                          >
                            <span>{sub.icon}</span>
                            <span>{sub.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // Normal Menu Item
              return (
                <NavLink
                  key={m.path}
                  to={m.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded transition ${
                      isActive ? "bg-gray-700 text-yellow-400" : "hover:bg-gray-800 text-gray-300"
                    }`
                  }
                  onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}
                >
                  <span className="text-lg">{m.icon}</span>
                  <span>{m.label}</span>
                </NavLink>
              );
            })}
        </nav>
      </aside>
    </>
  )
}






// import { NavLink } from "react-router-dom"
// import { useAppSelector } from "../app/hooks"
// import {
//   FaTachometerAlt,
//   FaTruck,
//   FaBuilding,
//   FaCar,
//   FaRoute,
//   FaUsers,
//   FaTruckMoving,
// } from "react-icons/fa"

// export default function Sidebar({ sidebarOpen, toggleSidebar }) {
//   const { user } = useAppSelector((state) => state.auth)
  
//   const userRole = user?.role?.toUpperCase();
//   const userAccountType = user?.accountType?.toUpperCase(); 

//   const menu = [
//     { 
//       label: "Dashboard", 
//       path: "/dashboard", 
//       roles: ["OWNER", "STAFF"], 
//       hiddenFor: [],
//       icon: <FaTachometerAlt /> 
//     },
//     { 
//       label: "Trips", 
//       path: "/trips", 
//       roles: ["OWNER", "STAFF"], 
//       hiddenFor: [],
//       icon: <FaRoute /> 
//     },
//     { 
//       label: "Suppliers", 
//       path: "/suppliers", 
//       roles: ["OWNER"], 
//       hiddenFor: ["SUPPLIER"],
//       icon: <FaTruck /> 
//     },
//     { 
//       label: "Companies", 
//       path: "/companies", 
//       roles: ["OWNER"], 
//       hiddenFor: ["COMPANY"], 
//       icon: <FaBuilding /> 
//     },
//     { 
//       label: "Vehicles", 
//       path: "/vehicles", 
//       roles: ["OWNER"], 
//       hiddenFor: ["VEHICLE"], 
//       icon: <FaCar /> 
//     },
//     { 
//       label: "Users", 
//       path: "/users", 
//       roles: ["OWNER"], 
//       hiddenFor: [], 
//       icon: <FaUsers /> 
//     },
//   ]

//   return (
//     <>
//       <div
//         className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
//           sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
//         }`}
//         onClick={toggleSidebar}
//       ></div>

//       <aside
//         className={`
//           fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-50 transform transition-transform duration-300 p-5
//           ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
//           md:translate-x-0 md:static md:inset-0
//         `}
//       >
//         <h1 className="text-xl font-bold mb-8 flex items-center gap-2 pl-1">
//           <FaTruckMoving className="text-2xl text-yellow-400" />
//           <span>CKLogicore</span>
//         </h1>

//         <nav className="space-y-1">
//           {menu
//             .filter((item) => {
//               const hasRole = userRole && item.roles.includes(userRole);

//               const isNotHidden = !item.hiddenFor.includes(userAccountType);

//               return hasRole && isNotHidden;
//             })
//             .map((m) => (
//               <NavLink
//                 key={m.path}
//                 to={m.path}
//                 className={({ isActive }) =>
//                   `flex items-center gap-3 px-3 py-2 rounded transition ${
//                     isActive ? "bg-gray-700 text-yellow-400" : "hover:bg-gray-800 text-gray-300"
//                   }`
//                 }
//                 onClick={() => {
//                    if (window.innerWidth < 768) toggleSidebar();
//                 }}
//               >
//                 <span className="text-lg">{m.icon}</span>
//                 <span>{m.label}</span>
//               </NavLink>
//             ))}
//         </nav>
//       </aside>
//     </>
//   )
// }
