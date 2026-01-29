import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "" : ""
        }`} // md: always show sidebar
      >
        <Topbar toggleSidebar={toggleSidebar} />
        <main className="p-6 overflow-y-auto overflow-x-hidden min-w-0 transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  )
}







// import { Outlet } from "react-router-dom"
// import Sidebar from "./Sidebar"
// import Topbar from "./Topbar"

// export default function AdminLayout() {
//   return (
//     <div className="flex h-screen bg-gray-100">
//       <Sidebar />

//       <div className="flex-1 flex flex-col">
//         <Topbar />
//         <main className="p-6 overflow-y-auto overflow-x-hidden min-w-0">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   )
// }
