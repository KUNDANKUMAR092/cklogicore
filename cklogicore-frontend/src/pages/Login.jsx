import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useLoginMutation } from "../features/auth/authApi.js"
import { useAppDispatch, useAppSelector } from "../app/hooks.js"
import { setCredentials } from "../features/auth/authSlice.js"

export default function Login() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  // ✅ Redux auth state
  const { user, accessToken } = useAppSelector((state) => state.auth)

  const [login] = useLoginMutation()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [error, setError] = useState("")

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
    setError("")

    try {
      await login(formData).unwrap();
    } catch (err) {
      setError(err?.data?.message || "Login failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">

        <h2 className="text-2xl font-bold mb-6">Login</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />

          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Login
          </button>

        </form>

        <p className="mt-4 text-sm text-gray-600">
          Don't have an account?{" "}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>

      </div>
    </div>
  )
}







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
