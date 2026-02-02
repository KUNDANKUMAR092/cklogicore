import React, { useState } from "react";
import ExportButton from "../components/ExportButton";
import { useGetDashboardStatsQuery } from "../features/dashboard/dashboardApi";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function Dashboard() {
  const { data: response, isLoading, error } = useGetDashboardStatsQuery();
  const [exportTarget, setExportTarget] = useState("COMPANY"); 

  if (isLoading) return <div className="p-10 text-center">Loading Dashboard Stats...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error?.data?.message || "Failed to fetch stats"}</div>;

  // Extract data from backend response
  const { overview, statusBreakdown, monthlyGrowth, resources } = response?.data || {};

  // Format Monthly Data for Charts
  const chartData = monthlyGrowth?.map(item => ({
    name: `${item._id.month}/${item._id.year}`,
    profit: item.profit,
    trips: item.trips
  })) || [];

  const currentMonthFilters = {
    target: exportTarget, // Yahan value pass ho rahi hai
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    endDate: new Date().toISOString()
  };

  return (
    <>
      <div className="p-6 bg-gray-50 min-h-screen">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Operational Dashboard</h1>
            <p className="text-sm text-gray-500">Overview & Quick Reports</p>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border">
            <span className="text-sm font-semibold text-gray-600 ml-2">Export For:</span>
            <select 
              value={exportTarget}
              onChange={(e) => setExportTarget(e.target.value)}
              className="bg-white border rounded px-2 py-1 text-sm outline-none focus:ring-2 ring-blue-500"
            >
              <option value="COMPANY">Company Report</option>
              <option value="VEHICLE">Vehicle Report</option>
            </select>
            
            <ExportButton 
              filters={{ target: exportTarget }} 
              title="Download Report"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Operational Overview</h1>
          <span className="text-sm text-gray-500">Real-time Data</span>
        </div>

        {/* --- 1. Top Stat Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Profit" value={`₹${overview?.totalProfit?.toLocaleString()}`} color="text-green-600" />
          <StatCard title="Total Freight" value={`₹${overview?.totalFreight?.toLocaleString()}`} color="text-blue-600" />
          <StatCard title="Total Trips" value={overview?.totalTrips} color="text-indigo-600" />
          <StatCard title="Avg Profit/Trip" value={`₹${Math.round(overview?.avgProfitPerTrip || 0)}`} color="text-orange-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* --- 2. Monthly Performance Chart --- */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">Monthly Profit & Growth</h3>
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="profit" fill="#6366f1" radius={[4, 4, 0, 0]} name="Profit (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* --- 3. Trip Status Pie Chart --- */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">Trips by Status</h3>
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%" cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={5}
                  >
                    {statusBreakdown?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* --- 4. Resource Summary --- */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-lg border-l-4 border-blue-500 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Registered Companies</p>
              <p className="text-2xl font-bold text-gray-800">{resources?.totalCompanies}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full text-blue-500">🏢</div>
          </div>
          <div className="bg-white p-5 rounded-lg border-l-4 border-green-500 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Registered Vehicles</p>
              <p className="text-2xl font-bold text-gray-800">{resources?.totalVehicles}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-full text-green-500">🚛</div>
          </div>
        </div>
      </div>
      <ExportButton 
          filters={currentMonthFilters} 
          title="Monthly Report" 
        />
    </>
  );
}

// Sub-component for Cards
function StatCard({ title, value, color }) {
  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-transform hover:scale-[1.02]">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">{title}</p>
        <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
      </div>
      
    </>
  );
}


// import React from "react";
// import { useGetDashboardStatsQuery } from "../features/dashboard/dashboardApi";
// import { 
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
//   PieChart, Pie, Cell, Legend 
// } from "recharts";

// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// export default function Dashboard() {
//   const { data: response, isLoading, error } = useGetDashboardStatsQuery();

//   if (isLoading) return <p>Loading Dashboard...</p>;
//   if (error) return <p>Error loading stats!</p>;

//   const { overview, statusBreakdown, monthlyGrowth, resources } = response.data;

//   const rawMonthlyData = response?.data?.monthlyGrowth || [];
//   // Format monthly data for Chart (e.g., "Month Year")
//   const chartData = monthlyGrowth.map(item => ({
//     name: `${item._id.month}/${item._id.year}`,
//     profit: item.profit,
//     trips: item.trips
//   }));

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h1 className="text-2xl font-bold mb-6">Business Dashboard</h1>

//       {/* --- 1. Top Stat Cards --- */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//         <StatCard title="Total Profit" value={`₹${overview.totalProfit}`} color="text-green-600" />
//         <StatCard title="Total Freight" value={`₹${overview.totalFreight}`} color="text-blue-600" />
//         <StatCard title="Total Trips" value={overview.totalTrips} color="text-purple-600" />
//         <StatCard title="Avg Profit/Trip" value={`₹${Math.round(overview.avgProfitPerTrip)}`} color="text-orange-600" />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* --- 2. Monthly Growth Bar Chart --- */}
//         <div className="bg-white p-4 rounded shadow">
//           <h3 className="text-lg font-semibold mb-4">Monthly Profit Performance</h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={chartData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar dataKey="profit" fill="#8884d8" name="Profit (₹)" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* --- 3. Trip Status Pie Chart --- */}
//         <div className="bg-white p-4 rounded shadow">
//           <h3 className="text-lg font-semibold mb-4">Trip Status Distribution</h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={statusBreakdown}
//                   dataKey="count"
//                   nameKey="_id"
//                   cx="50%" cy="50%"
//                   outerRadius={80}
//                   label
//                 >
//                   {statusBreakdown.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>

//       {/* --- 4. Resource Counts --- */}
//       <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="bg-white p-4 rounded border-l-4 border-blue-500 shadow-sm">
//           <p className="text-gray-500">Connected Companies</p>
//           <p className="text-2xl font-bold">{resources.totalCompanies}</p>
//         </div>
//         <div className="bg-white p-4 rounded border-l-4 border-green-500 shadow-sm">
//           <p className="text-gray-500">Active Vehicles</p>
//           <p className="text-2xl font-bold">{resources.totalVehicles}</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Simple Sub-component for Cards
// function StatCard({ title, value, color }) {
//   return (
//     <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
//       <p className="text-sm text-gray-500 uppercase font-bold">{title}</p>
//       <p className={`text-2xl font-black ${color}`}>{value}</p>
//     </div>
//   );
// }