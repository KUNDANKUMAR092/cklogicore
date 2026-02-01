import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useLoginMutation } from "../features/auth/authApi.js"
import { useAppDispatch, useAppSelector } from "../app/hooks.js"
import { FaEnvelope, FaLock } from "react-icons/fa" // Icons for consistency
import { toast } from "react-toastify"

export default function Login() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  // ✅ Redux auth state
  const { user, accessToken } = useAppSelector((state) => state.auth)
  const [login, { isLoading }] = useLoginMutation()
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // ✅ AUTO REDIRECT when login success
  useEffect(() => {
    if (user && accessToken) {
      navigate("/dashboard", { replace: true })
    }
  }, [user, accessToken, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await login(formData).unwrap()
      if (res) {
        toast.success("Welcome back!")
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      toast.error(err?.data?.message || "Login failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Login</h2>
          <p className="text-gray-500 text-sm mt-2">Manage your transport operations</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Email Field */}
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`mt-4 w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-200 transition-all active:scale-95 ${
              isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700 hover:shadow-blue-300"
            }`}
          >
            {isLoading ? (
              <div className="flex justify-center items-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500 font-medium">
          Don't have an account?{" "}
          <span
            className="text-blue-600 font-black cursor-pointer hover:text-blue-800"
            onClick={() => navigate("/signup")}
          >
            SIGN UP
          </span>
        </p>

      </div>
    </div>
  )
}
















// import React, { useState, useEffect } from "react"
// import { useNavigate } from "react-router-dom"
// import { useLoginMutation } from "../features/auth/authApi.js"
// import { useAppDispatch, useAppSelector } from "../app/hooks.js"
// import { setCredentials } from "../features/auth/authSlice.js"

// export default function Login() {
//   const navigate = useNavigate()
//   const dispatch = useAppDispatch()

//   // ✅ Redux auth state
//   const { user, accessToken } = useAppSelector((state) => state.auth)
//   const [login] = useLoginMutation()
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   })

//   const [error, setError] = useState("")

//   // ✅ AUTO REDIRECT when login success
//   useEffect(() => {
//     if (user && accessToken) {
//       navigate("/dashboard", { replace: true })
//     }
//   }, [user, accessToken, navigate])

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     })
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError("")

//     try {
//       // await login(formData).unwrap();
//       const res = await login(formData).unwrap();
//       // ✅ Direct navigation after success
//       if (res) {
//         navigate("/dashboard", { replace: true });
//       }
//     } catch (err) {
//       setError(err?.data?.message || "Login failed")
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded shadow w-full max-w-md">

//         <h2 className="text-2xl font-bold mb-6">Login</h2>

//         {error && <p className="text-red-500 mb-4">{error}</p>}

//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">

//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//             className="border p-2 rounded"
//           />

//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             value={formData.password}
//             onChange={handleChange}
//             required
//             className="border p-2 rounded"
//           />

//           <button
//             type="submit"
//             className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
//           >
//             Login
//           </button>

//         </form>

//         <p className="mt-4 text-sm text-gray-600">
//           Don't have an account?{" "}
//           <span
//             className="text-blue-500 cursor-pointer"
//             onClick={() => navigate("/signup")}
//           >
//             Sign Up
//           </span>
//         </p>

//       </div>
//     </div>
//   )
// }







// import React, { useState } from "react"
// import { useNavigate } from "react-router-dom"
// import { useLoginMutation } from "../features/auth/authApi.js"
// import { useAppDispatch } from "../app/hooks.js"
// import { setCredentials } from "../features/auth/authSlice.js"

// export default function Login() {
//   const navigate = useNavigate()
//   const dispatch = useAppDispatch()
//   const [login] = useLoginMutation()
//   const [formData, setFormData] = useState({ email: "", password: "" })
//   const [error, setError] = useState("")

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value })
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError("")
//     try {
//       const userData = await login(formData).unwrap()
//       dispatch(setCredentials(userData)) // save in auth slice
//       navigate("/dashboard")
//     } catch (err) {
//       setError(err?.data?.message || "Login failed")
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded shadow w-full max-w-md">
//         <h2 className="text-2xl font-bold mb-6">Login</h2>
//         {error && <p className="text-red-500 mb-4">{error}</p>}
//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//             className="border p-2 rounded"
//           />
//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             value={formData.password}
//             onChange={handleChange}
//             required
//             className="border p-2 rounded"
//           />
//           <button
//             type="submit"
//             className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
//           >
//             Login
//           </button>
//         </form>
//         <p className="mt-4 text-sm text-gray-600">
//           Don't have an account?{" "}
//           <span
//             className="text-blue-500 cursor-pointer"
//             onClick={() => navigate("/signup")}
//           >
//             Sign Up
//           </span>
//         </p>
//       </div>
//     </div>
//   )
// }
