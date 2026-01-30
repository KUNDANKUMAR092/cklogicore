import AppRoutes from "./routes/AppRoutes.jsx"
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="">
        <AppRoutes />
        <ToastContainer />
      </main>
    </div>
  )
}

