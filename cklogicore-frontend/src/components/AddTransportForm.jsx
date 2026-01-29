import React, { useState } from "react"
import { useAddTransportMutation } from "../features/transport/transportApi.js"

export default function AddTransportForm() {
  const [addTransport, { isLoading }] = useAddTransportMutation()

  const [form, setForm] = useState({
    loadDate: "",
    unloadDate: "",
    truckNumber: "",
    loadLocation: "",
    unloadLocation: "",
    loadWeight: "",
    unloadWeight: "",
    companyPrice: "",
    ownerPrice: ""
  })

  const [challan, setChallan] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    setChallan(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()

    // append normal fields
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key])
    })

    // append challan image
    if (challan) {
      formData.append("challan", challan)
    }

    try {
      await addTransport(formData).unwrap()
      alert("Transport entry added successfully ✅")
    } catch (err) {
      alert(err?.data?.message || "Failed to add entry")
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Add New Transport</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

        <input name="loadDate" type="date" onChange={handleChange} className="border p-2 rounded" />
        <input name="unloadDate" type="date" onChange={handleChange} className="border p-2 rounded" />

        <input name="truckNumber" placeholder="Truck Number" onChange={handleChange} className="border p-2 rounded" />
        <input name="loadLocation" placeholder="Load Location" onChange={handleChange} className="border p-2 rounded" />

        <input name="unloadLocation" placeholder="Unload Location" onChange={handleChange} className="border p-2 rounded" />
        <input name="loadWeight" placeholder="Load Weight (Ton)" onChange={handleChange} className="border p-2 rounded" />

        <input name="unloadWeight" placeholder="Unload Weight (Ton)" onChange={handleChange} className="border p-2 rounded" />
        <input name="companyPrice" placeholder="Company Price / Ton" onChange={handleChange} className="border p-2 rounded" />

        <input name="ownerPrice" placeholder="Owner Price / Ton" onChange={handleChange} className="border p-2 rounded" />

        {/* 📸 Challan Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="col-span-2 border p-2 rounded"
        />

        <button
          disabled={isLoading}
          className="col-span-2 bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          {isLoading ? "Saving..." : "Save Entry"}
        </button>
      </form>
    </div>
  )
}
