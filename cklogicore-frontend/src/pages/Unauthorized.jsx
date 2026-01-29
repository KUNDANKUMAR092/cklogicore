import React from "react"
import { Link } from "react-router-dom"

export default function Unauthorized() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow text-center max-w-md">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Unauthorized</h1>
        <p className="text-gray-700 mb-6">
          You do not have permission to access this page.
        </p>
        <Link
          to="/dashboard"
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
