import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSignupMutation } from "../features/auth/authApi.js"
import { toast } from "react-toastify" // Toast import kiya

export default function Signup() {
  const navigate = useNavigate()
  
  // mutation hook se 'isLoading' nikalna
  const [signup, { isLoading }] = useSignupMutation()
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    accountType: "VEHICLE" // Aapne role ki jagah accountType filter ki baat ki thi
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // unwrap() ka use karke success handle karein
      const res = await signup(formData).unwrap()
      toast.success(res?.message || "Signup successful! Please login.")
      navigate("/login")
    } catch (err) {
      // Error toast dikhayein
      toast.error(err?.data?.message || "Signup failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="border p-2 rounded focus:outline-blue-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="border p-2 rounded focus:outline-blue-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="border p-2 rounded focus:outline-blue-500"
          />
          
          <label className="text-sm font-semibold text-gray-700">Account Type</label>
          <select
            name="accountType"
            value={formData.accountType}
            onChange={handleChange}
            className="border p-2 rounded bg-white"
          >
            <option value="SUPPLIER">SUPPLIER</option>
            <option value="COMPANY">COMPANY</option>
            <option value="VEHICLE">VEHICLE OWNER</option>
          </select>

          <button
            type="submit"
            disabled={isLoading} // Loading ke time button disable
            className={`mt-2 bg-black text-white px-4 py-2 rounded transition flex justify-center items-center ${
              isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-800"
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <span
            className="text-blue-600 font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  )
}








// import React, { useState } from "react"
// import { useNavigate } from "react-router-dom"
// import { useSignupMutation } from "../features/auth/authApi.js"

// export default function Signup() {
//   const navigate = useNavigate()
//   const [signup] = useSignupMutation()
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "OWNER" // default role
//   })
//   const [error, setError] = useState("")

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value })
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError("")
//     try {
//       await signup(formData).unwrap()
//       navigate("/login")
//     } catch (err) {
//       setError(err?.data?.message || "Signup failed")
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded shadow w-full max-w-md">
//         <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
//         {error && <p className="text-red-500 mb-4">{error}</p>}
//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//           <input
//             type="text"
//             name="name"
//             placeholder="Full Name"
//             value={formData.name}
//             onChange={handleChange}
//             required
//             className="border p-2 rounded"
//           />
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
//           <select
//             name="role"
//             value={formData.role}
//             onChange={handleChange}
//             className="border p-2 rounded"
//           >
//             <option value="SUPPLIER">SUPPLIER</option>
//             <option value="COMPANIE">COMPANIE</option>
//             <option value="VEHICLE">VEHICLE</option>
//           </select>
//           <button
//             type="submit"
//             className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
//           >
//             Sign Up
//           </button>
//         </form>
//         <p className="mt-4 text-sm text-gray-600">
//           Already have an account?{" "}
//           <span
//             className="text-blue-500 cursor-pointer"
//             onClick={() => navigate("/login")}
//           >
//             Login
//           </span>
//         </p>
//       </div>
//     </div>
//   )
// }
