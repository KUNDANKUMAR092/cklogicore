import React, { useState } from "react"

/**
 * Props:
 * onFilter: function(filters) => parent ko filtered data bhejne ke liye
 */
export default function FilterBar({ onFilter }) {
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [truckNumber, setTruckNumber] = useState("")
  const [loadLocation, setLoadLocation] = useState("")
  const [unloadLocation, setUnloadLocation] = useState("")

  const handleFilter = () => {
    const filters = {}
    if (fromDate) filters.fromDate = fromDate
    if (toDate) filters.toDate = toDate
    if (truckNumber) filters.truckNumber = truckNumber
    if (loadLocation) filters.loadLocation = loadLocation
    if (unloadLocation) filters.unloadLocation = unloadLocation

    onFilter(filters)
  }

  const handleReset = () => {
    setFromDate("")
    setToDate("")
    setTruckNumber("")
    setLoadLocation("")
    setUnloadLocation("")
    onFilter({})
  }

  return (
    <div className="bg-white p-4 rounded shadow flex flex-wrap gap-4 items-end">
      <div className="flex flex-col">
        <label className="text-gray-600 text-sm">From Date</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-gray-600 text-sm">To Date</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-gray-600 text-sm">Truck Number</label>
        <input
          type="text"
          placeholder="Truck Number"
          value={truckNumber}
          onChange={(e) => setTruckNumber(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-gray-600 text-sm">Load Location</label>
        <input
          type="text"
          placeholder="Load Location"
          value={loadLocation}
          onChange={(e) => setLoadLocation(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-gray-600 text-sm">Unload Location</label>
        <input
          type="text"
          placeholder="Unload Location"
          value={unloadLocation}
          onChange={(e) => setUnloadLocation(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleFilter}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Filter
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-200 px-4 py-2 rounded"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
