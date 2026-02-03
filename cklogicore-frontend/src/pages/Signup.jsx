import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSignupMutation } from "../features/auth/authApi.js"
import { toast } from "react-toastify"
import { FaPhoneAlt, FaUser, FaEnvelope, FaLock } from "react-icons/fa" // Icons for better UI

export default function Signup() {
  const navigate = useNavigate()
  const [signup, { isLoading }] = useSignupMutation()
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "", // 🆕 Mobile field added
    password: "",
    accountType: "VEHICLE"
  })

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Mobile number ke liye sirf digits allow karne ka logic (optional)
    if (name === "mobile") {
      const re = /^[0-9\b]+$/;
      if (value !== "" && !re.test(value)) return;
      if (value.length > 10) return; // 10 digit limit
    }

    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (formData.mobile.length < 10) {
      return toast.warn("Please enter a valid 10-digit mobile number")
    }

    try {
      const res = await signup(formData).unwrap()
      toast.success(res?.message || "Signup successful! Please login.")
      navigate("/login")
    } catch (err) {
      toast.error(err?.data?.message || "Signup failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Create Account</h2>
          <p className="text-gray-500 text-sm mt-2">Join CK LogiCore transport network</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name Field */}
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
            />
          </div>

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

          {/* 🆕 Mobile Field */}
          <div className="relative">
            <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              name="mobile"
              placeholder="Mobile Number"
              value={formData.mobile}
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
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Type</label>
            <select
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
            >
              <option value="SUPPLIER">SUPPLIER</option>
              {/* <option value="COMPANY">COMPANY</option>
              <option value="VEHICLE">VEHICLE OWNER</option> */}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`mt-4 w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-200 transition-all active:scale-95 ${
              isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700 hover:shadow-blue-300"
            }`}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500 font-medium">
          Already a partner?{" "}
          <span
            className="text-blue-600 font-black cursor-pointer hover:text-blue-800"
            onClick={() => navigate("/login")}
          >
            LOGIN HERE
          </span>
        </p>
      </div>
    </div>
  )
}









// import React, { useState } from "react"
// import { useNavigate } from "react-router-dom"
// import { useSignupMutation } from "../features/auth/authApi.js"
// import { toast } from "react-toastify" // Toast import kiya

// export default function Signup() {
//   const navigate = useNavigate()
  
//   // mutation hook se 'isLoading' nikalna
//   const [signup, { isLoading }] = useSignupMutation()
  
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     mobile: "",
//     password: "",
//     accountType: "VEHICLE" // Aapne role ki jagah accountType filter ki baat ki thi
//   })

//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     // Mobile number ke liye sirf digits allow karne ka logic (optional)
//     if (name === "mobile") {
//       const re = /^[0-9\b]+$/;
//       if (value !== "" && !re.test(value)) return;
//       if (value.length > 10) return; // 10 digit limit
//     }

//     setFormData({ ...formData, [name]: value })
//     // setFormData({ ...formData, [e.target.name]: e.target.value })
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Basic validation
//     if (formData.mobile.length < 10) {
//       return toast.warn("Please enter a valid 10-digit mobile number")
//     }

//     try {
//       // unwrap() ka use karke success handle karein
//       const res = await signup(formData).unwrap()
//       toast.success(res?.message || "Signup successful! Please login.")
//       navigate("/login")
//     } catch (err) {
//       // Error toast dikhayein
//       toast.error(err?.data?.message || "Signup failed. Please try again.")
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded shadow w-full max-w-md">
//         <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        
//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//           <input
//             type="text"
//             name="name"
//             placeholder="Full Name"
//             value={formData.name}
//             onChange={handleChange}
//             required
//             className="border p-2 rounded focus:outline-blue-500"
//           />
//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//             className="border p-2 rounded focus:outline-blue-500"
//           />
//           {/* 🆕 Mobile Field */}
//           <div className="relative">
//             <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
//             <input
//               type="text"
//               name="mobile"
//               placeholder="Mobile Number"
//               value={formData.mobile}
//               onChange={handleChange}
//               required
//               className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
//             />
//           </div>
//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             value={formData.password}
//             onChange={handleChange}
//             required
//             className="border p-2 rounded focus:outline-blue-500"
//           />
          
//           <label className="text-sm font-semibold text-gray-700">Account Type</label>
//           <select
//             name="accountType"
//             value={formData.accountType}
//             onChange={handleChange}
//             className="border p-2 rounded bg-white"
//           >
//             <option value="SUPPLIER">SUPPLIER</option>
//             <option value="COMPANY">COMPANY</option>
//             <option value="VEHICLE">VEHICLE OWNER</option>
//           </select>

//           <button
//             type="submit"
//             disabled={isLoading} // Loading ke time button disable
//             className={`mt-2 bg-black text-white px-4 py-2 rounded transition flex justify-center items-center ${
//               isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-800"
//             }`}
//           >
//             {isLoading ? (
//               <>
//                 <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 Processing...
//               </>
//             ) : (
//               "Sign Up"
//             )}
//           </button>
//         </form>

//         <p className="mt-6 text-center text-sm text-gray-600">
//           Already have an account?{" "}
//           <span
//             className="text-blue-600 font-semibold cursor-pointer hover:underline"
//             onClick={() => navigate("/login")}
//           >
//             Login
//           </span>
//         </p>
//       </div>
//     </div>
//   )
// }








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
