import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSignupMutation } from "../features/auth/authApi.js"

export default function Signup() {
  const navigate = useNavigate()
  const [signup] = useSignupMutation()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "OWNER" // default role
  })
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      await signup(formData).unwrap()
      navigate("/login")
    } catch (err) {
      setError(err?.data?.message || "Signup failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
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
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="OWNER">Owner</option>
            <option value="COMPANY">Company</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  )
}
