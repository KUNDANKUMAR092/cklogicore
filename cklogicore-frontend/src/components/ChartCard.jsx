import React from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts"

/**
 * Props:
 * data: [{ date: "2026-01-25", profit: 1200 }, ...]
 * title: "Profit per Day"
 */
export default function ChartCard({ data, title }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#1f2937" // Tailwind gray-800
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-400 text-center">No data to display</p>
      )}
    </div>
  )
}
