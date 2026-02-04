import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSignupMutation } from "../features/auth/authApi.js"
import { toast } from "react-toastify"
import { FaPhoneAlt, FaUser, FaEnvelope, FaLock } from "react-icons/fa"

export default function Signup() {
  const navigate = useNavigate()
  const [signup, { isLoading }] = useSignupMutation()
  
  // 1. All field errors state
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    mobile: "",
    password: ""
  })

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    accountType: "SUPPLIER"
  })

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error when user starts typing again
    setFieldErrors({ ...fieldErrors, [name]: "" });

    // Real-time Mobile Validation
    if (name === "mobile") {
      const re = /^[0-9\b]+$/;
      if (value !== "" && !re.test(value)) {
        setFieldErrors(prev => ({ ...prev, mobile: "Only digits are allowed" }));
        return;
      }
      if (value.length > 10) return;
    }

    setFormData({ ...formData, [name]: value })
  }

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    // Name Validation (Min 3 characters, only alphabets)
    if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
      isValid = false;
    }

    // Email Validation (Standard Email Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Mobile Validation (Exactly 10 digits)
    if (formData.mobile.length !== 10) {
      newErrors.mobile = "Mobile number must be exactly 10 digits";
      isValid = false;
    }

    // Password Validation (Min 8 chars, 1 uppercase, 1 special char)
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Min 8 chars, 1 Uppercase & 1 Special Char required";
      isValid = false;
    }

    setFieldErrors(newErrors);
    return isValid;
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Check for empty fields manually for better UX
    if (!formData.name || !formData.email || !formData.mobile || !formData.password) {
      return toast.error("All fields are mandatory");
    }

    if (!validateForm()) {
      return toast.error("Please fix the validation errors");
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
              className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${fieldErrors.name ? 'border-red-500' : 'border-gray-200'} rounded-2xl outline-none transition-all`}
            />
            {fieldErrors.name && <p className="text-red-500 text-[9px] font-bold mt-1 ml-2 uppercase italic">{fieldErrors.name}</p>}
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
              className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${fieldErrors.email ? 'border-red-500' : 'border-gray-200'} rounded-2xl outline-none transition-all`}
            />
            {fieldErrors.email && <p className="text-red-500 text-[9px] font-bold mt-1 ml-2 uppercase italic">{fieldErrors.email}</p>}
          </div>

          {/* Mobile Field */}
          <div className="relative">
            <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              name="mobile"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              required
              className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${fieldErrors.mobile ? 'border-red-500' : 'border-gray-200'} rounded-2xl outline-none transition-all`}
            />
            {fieldErrors.mobile && <p className="text-red-500 text-[9px] font-bold mt-1 ml-2 uppercase italic">{fieldErrors.mobile}</p>}
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
              className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${fieldErrors.password ? 'border-red-500' : 'border-gray-200'} rounded-2xl outline-none transition-all`}
            />
            {fieldErrors.password && <p className="text-red-500 text-[9px] font-bold mt-1 ml-2 uppercase italic">{fieldErrors.password}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Type</label>
            <select
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl font-bold text-gray-700 outline-none appearance-none cursor-pointer"
            >
              <option value="SUPPLIER">SUPPLIER</option>
              {/* <option value="COMPANY">COMPANY</option>
              <option value="VEHICLE">VEHICLE OWNER</option> */}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`mt-4 w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
              isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700 shadow-blue-200"
            }`}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        {/* Login link skipped for brevity... */}
      </div>
    </div>
  )
}