import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";
import { 
  FaSearch, FaCalendarAlt, FaBuilding, FaSyncAlt, 
  FaTruck, FaHandshake, FaDownload, FaFileExport 
} from "react-icons/fa";

// Constants & API Hooks
import { useGetDashboardStatsQuery } from "../features/dashboard/dashboardApi";
import { useGetCompaniesQuery } from "../features/companies/companyApi";
import { useGetVehiclesQuery } from "../features/vehicles/vehicleApi";
import { useGetSuppliersQuery } from "../features/suppliers/supplierApi";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Dashboard() {
  // 1. REDUX STATE (Auth Token)
  const { accessToken } = useSelector((state) => state.auth);

  // 2. FILTERS STATE
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    search: "",
    companyId: "",
    vehicleId: "",
    supplierId: ""
  });
  const [exportTarget, setExportTarget] = useState("COMPANY");

  // 3. API DATA FETCHING
  const { data: response, isLoading, isFetching } = useGetDashboardStatsQuery(filters);
  const { data: companyData } = useGetCompaniesQuery({ limit: 1000 });
  const { data: vehicleData } = useGetVehiclesQuery({ limit: 1000 });
  const { data: supplierData } = useGetSuppliersQuery({ limit: 1000 });

  const rawData = response?.data || {};

  // 4. SECURE EXCEL EXPORT (Fixes Unauthorized Error)
  const handleExport = async () => {
    if (!accessToken) {
      toast.error("Session expired. Please login again.");
      return;
    }

    try {
      const queryParams = new URLSearchParams({ ...filters, target: exportTarget }).toString();
      const baseUrl = "http://localhost:5000/api/v1";

      const res = await axios.get(`${baseUrl}/excel/export-trips?${queryParams}`, {
        headers: { 
          Authorization: `Bearer ${accessToken}` // ✅ Yahan accessToken use karein
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Report_${exportTarget}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Downloaded!");
    } catch (err) {
      console.error("Export Error:", err.response);
      toast.error("Unauthorized: Please check your login");
    }
  };

  // 5. CHART DATA FORMATTING
  const formattedTrendData = useMemo(() => {
    return rawData.monthlyTrend?.map(item => ({
      name: item._id ? `${item._id.month}/${item._id.year}` : "N/A",
      profit: item.profit || 0
    })) || [];
  }, [rawData.monthlyTrend]);

  const formattedStatusData = useMemo(() => {
    return rawData.statusBreakdown?.map(item => ({
      name: item._id ? item._id.charAt(0).toUpperCase() + item._id.slice(1) : "Unknown",
      value: item.count || 0
    })) || [];
  }, [rawData.statusBreakdown]);

  // 6. UI HANDLERS
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ startDate: "", endDate: "", search: "", companyId: "", vehicleId: "", supplierId: "" });
  };

  if (isLoading) return <div className="p-20 text-center font-bold text-blue-500 animate-pulse">Analysing Business...</div>;

  return (
    <div className="p-4 md:p-6 min-h-screen font-sans">
      
      {/* HEADER SECTION WITH EXPORT */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Logicore BI</h1>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Logistics Intelligence</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 px-3 border-r">
            <FaFileExport className="text-gray-300" size={14} />
            <select 
              value={exportTarget}
              onChange={(e) => setExportTarget(e.target.value)}
              className="text-xs font-bold text-gray-600 outline-none bg-transparent cursor-pointer"
            >
              <option value="COMPANY">Company Report</option>
              <option value="VEHICLE">Vehicle Report</option>
              <option value="SUPPLIER">Supplier Report</option>
            </select>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <FaDownload size={12} /> Export Excel
          </button>
        </div>
      </div>

      {/* --- FILTER CONTROL PANEL --- */}
      <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px] relative">
            <FaSearch className="absolute left-4 top-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Trip ID, Points or Numbers..."
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 transition-all"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-2xl border border-gray-100">
            <FaCalendarAlt className="ml-2 text-gray-400 size-3" />
            <input type="date" className="bg-transparent text-xs outline-none" value={filters.startDate} onChange={(e) => handleFilterChange("startDate", e.target.value)} />
            <span className="text-gray-300">|</span>
            <input type="date" className="bg-transparent text-xs outline-none" value={filters.endDate} onChange={(e) => handleFilterChange("endDate", e.target.value)} />
          </div>

          <button onClick={resetFilters} className="p-4 text-gray-400 hover:text-blue-500 transition-colors bg-gray-50 rounded-2xl">
            <FaSyncAlt className={isFetching ? "animate-spin" : ""} size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Dropdown icon={<FaBuilding />} label="All Companies" value={filters.companyId} options={companyData?.list} name="companyId" onChange={handleFilterChange} />
          <Dropdown icon={<FaTruck />} label="All Vehicles" value={filters.vehicleId} options={vehicleData?.list} name="vehicleId" onChange={handleFilterChange} displayKey="vehicleNumber" />
          <Dropdown icon={<FaHandshake />} label="All Suppliers" value={filters.supplierId} options={supplierData?.list} name="supplierId" onChange={handleFilterChange} />
        </div>
      </div>

      {/* --- KEY STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Profit" value={`₹${rawData.overview?.totalProfit?.toLocaleString()}`} color="text-green-600" icon="📈" />
        <StatCard title="Total Revenue" value={`₹${rawData.overview?.totalRevenue?.toLocaleString()}`} color="text-blue-600" icon="💰" />
        <StatCard title="Total Trips" value={rawData.overview?.totalTrips} color="text-indigo-600" icon="🚚" />
        <StatCard title="Total Weight" value={`${rawData.overview?.totalWeight} MT`} color="text-orange-600" icon="⚖️" />
      </div>

      {/* --- VISUAL CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ChartContainer title="Profit Growth">
          {formattedTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedTrendData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <NoData message="No trend data" />}
        </ChartContainer>

        <ChartContainer title="Trip Status Breakdown">
          {formattedStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedStatusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                >
                  {formattedStatusData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} cornerRadius={10} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : <NoData message="No status found" />}
        </ChartContainer>
      </div>
    </div>
  );
}

// --- REUSABLE UI COMPONENTS ---

const Dropdown = ({ icon, label, value, options, name, onChange, displayKey = "name" }) => (
  <div className="relative">
    <span className="absolute left-4 top-4 text-gray-400 size-3">{icon}</span>
    <select 
      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 appearance-none cursor-pointer"
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
    >
      <option value="">{label}</option>
      {options?.map(o => <option key={o._id} value={o._id}>{o[displayKey]}</option>)}
    </select>
  </div>
);

const ChartContainer = ({ title, children }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[420px]">
    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">{title}</h3>
    <div className="h-[320px] w-full" style={{ minWidth: 0 }}>
      {children}
    </div>
  </div>
);

function StatCard({ title, value, color, icon }) {
  return (
    <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-lg transition-all">
      <div className="flex items-center gap-5">
        <div className="text-3xl bg-gray-50 p-4 rounded-3xl shadow-inner">{icon}</div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
          <p className={`text-2xl font-black ${color}`}>{value || 0}</p>
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 shadow-2xl rounded-3xl border-none">
        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{payload[0].payload.name}</p>
        <p className="text-lg font-black text-blue-600">₹{payload[0].value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const NoData = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full text-gray-300 opacity-50">
    <div className="text-5xl mb-3">📊</div>
    <p className="text-xs font-black uppercase tracking-widest">{message}</p>
  </div>
);











// import React, { useState, useMemo } from "react";
// import { 
//   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
//   PieChart, Pie, Cell, Legend, AreaChart, Area 
// } from "recharts";
// import { 
//   FaSearch, FaCalendarAlt, FaBuilding, FaSyncAlt, 
//   FaTruck, FaHandshake, FaFileExport, FaDownload 
// } from "react-icons/fa";
// import { useGetDashboardStatsQuery } from "../features/dashboard/dashboardApi";
// import { useGetCompaniesQuery } from "../features/companies/companyApi";
// import { useGetVehiclesQuery } from "../features/vehicles/vehicleApi"; 
// import { useGetSuppliersQuery } from "../features/suppliers/supplierApi";

// const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

// export default function Dashboard() {
//   // 1. FILTER STATE
//   const [filters, setFilters] = useState({ 
//     startDate: "", 
//     endDate: "", 
//     search: "", 
//     companyId: "",
//     vehicleId: "",
//     supplierId: "" 
//   });

//   const [exportTarget, setExportTarget] = useState("COMPANY");

//   // 2. API CALLS
//   const { data: response, isLoading, isFetching } = useGetDashboardStatsQuery(filters);
//   const { data: companyData } = useGetCompaniesQuery({ limit: 1000 });
//   const { data: vehicleData } = useGetVehiclesQuery({ limit: 1000 });
//   const { data: supplierData } = useGetSuppliersQuery({ limit: 1000 });

//   const rawData = response?.data || {};

//   // 3. EXCEL EXPORT HANDLER
//   const handleExport = () => {
//     try {
//       const queryParams = new URLSearchParams({
//         ...filters,
//         target: exportTarget 
//       }).toString();

//       // Agar Vite hai toh import.meta.env, warna default string
//       const baseUrl = "http://localhost:5000/api/v1"; 
      
//       window.open(`${baseUrl}/excel/export-trips?${queryParams}`, "_blank");
//     } catch (err) {
//       console.error("Export Error:", err);
//     }
//   };

//   // 4. DATA FORMATTING
//   const formattedTrendData = useMemo(() => {
//     return rawData.monthlyTrend?.map(item => ({
//       name: item._id ? `${item._id.month}/${item._id.year}` : "N/A",
//       profit: item.profit || 0
//     })) || [];
//   }, [rawData.monthlyTrend]);

//   const formattedStatusData = useMemo(() => {
//     return rawData.statusBreakdown?.map(item => ({
//       name: item._id ? item._id.charAt(0).toUpperCase() + item._id.slice(1) : "Unknown",
//       value: item.count || 0
//     })) || [];
//   }, [rawData.statusBreakdown]);

//   // 5. HANDLERS
//   const handleFilterChange = (name, value) => {
//     setFilters(prev => ({ ...prev, [name]: value }));
//   };

//   const resetFilters = () => {
//     setFilters({ startDate: "", endDate: "", search: "", companyId: "", vehicleId: "", supplierId: "" });
//   };

//   if (isLoading) return <div className="p-20 text-center font-bold text-blue-500 animate-bounce">Loading Stats...</div>;

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen font-sans">
      
//       {/* --- 🛠️ HEADER & EXPORT SECTION --- */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
//         <div>
//           <h1 className="text-2xl font-black text-gray-800 tracking-tight">Business Intelligence</h1>
//           <p className="text-sm text-gray-500 font-medium">Logistics & Financial Overview</p>
//         </div>

//         <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-2 px-3 border-r">
//             <FaFileExport className="text-gray-400" size={14} />
//             <select 
//               value={exportTarget}
//               onChange={(e) => setExportTarget(e.target.value)}
//               className="text-xs font-bold text-gray-600 outline-none bg-transparent cursor-pointer"
//             >
//               <option value="COMPANY">Company Report</option>
//               <option value="VEHICLE">Vehicle Report</option>
//               <option value="SUPPLIER">Supplier Report</option>
//             </select>
//           </div>
//           <button 
//             onClick={handleExport}
//             className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
//           >
//             <FaDownload size={12} /> Export Excel
//           </button>
//         </div>
//       </div>

//       {/* --- 🔍 FILTERS SECTION --- */}
//       <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-col gap-4">
//         <div className="flex flex-wrap items-center gap-4">
//           <div className="flex-1 min-w-[300px] relative">
//             <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
//             <input 
//               type="text" 
//               placeholder="Search Trip ID, Route or Driver..."
//               className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 transition-all"
//               value={filters.search}
//               onChange={(e) => handleFilterChange("search", e.target.value)}
//             />
//           </div>

//           <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
//             <FaCalendarAlt className="ml-2 text-gray-400 size-3" />
//             <input type="date" className="bg-transparent text-xs outline-none p-1" onChange={(e) => handleFilterChange("startDate", e.target.value)} value={filters.startDate} />
//             <span className="text-gray-300">|</span>
//             <input type="date" className="bg-transparent text-xs outline-none p-1" onChange={(e) => handleFilterChange("endDate", e.target.value)} value={filters.endDate} />
//           </div>

//           <button onClick={resetFilters} className="p-3 text-gray-400 hover:text-blue-500 transition-colors bg-gray-50 rounded-2xl">
//             <FaSyncAlt className={isFetching ? "animate-spin" : ""} />
//           </button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="relative">
//             <FaBuilding className="absolute left-4 top-3.5 text-gray-400 size-3" />
//             <select 
//               className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 appearance-none cursor-pointer"
//               value={filters.companyId}
//               onChange={(e) => handleFilterChange("companyId", e.target.value)}
//             >
//               <option value="">All Companies</option>
//               {companyData?.list?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
//             </select>
//           </div>

//           <div className="relative">
//             <FaTruck className="absolute left-4 top-3.5 text-gray-400 size-3" />
//             <select 
//               className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 appearance-none cursor-pointer"
//               value={filters.vehicleId}
//               onChange={(e) => handleFilterChange("vehicleId", e.target.value)}
//             >
//               <option value="">All Vehicles</option>
//               {vehicleData?.list?.map(v => <option key={v._id} value={v._id}>{v.vehicleNumber}</option>)}
//             </select>
//           </div>

//           <div className="relative">
//             <FaHandshake className="absolute left-4 top-3.5 text-gray-400 size-3" />
//             <select 
//               className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 appearance-none cursor-pointer"
//               value={filters.supplierId}
//               onChange={(e) => handleFilterChange("supplierId", e.target.value)}
//             >
//               <option value="">All Suppliers</option>
//               {supplierData?.list?.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* --- 📊 STAT CARDS --- */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <StatCard title="Total Profit" value={`₹${rawData.overview?.totalProfit?.toLocaleString()}`} color="text-green-600" icon="📈" />
//         <StatCard title="Total Revenue" value={`₹${rawData.overview?.totalRevenue?.toLocaleString()}`} color="text-blue-600" icon="💰" />
//         <StatCard title="Total Trips" value={rawData.overview?.totalTrips} color="text-indigo-600" icon="🚚" />
//         <StatCard title="Total Weight" value={`${rawData.overview?.totalWeight} MT`} color="text-orange-600" icon="⚖️" />
//       </div>

//       {/* --- 📈 CHARTS SECTION --- */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
//           <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 ml-2">Financial Growth</h3>
//           <div className="h-[350px] w-full">
//             {formattedTrendData.length > 0 ? (
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={formattedTrendData}>
//                   <defs>
//                     <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
//                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
//                   <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
//                   <Tooltip content={<CustomTooltip />} />
//                   <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} fill="url(#colorProfit)" />
//                 </AreaChart>
//               </ResponsiveContainer>
//             ) : <NoData message="No trend data for selected period" />}
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
//           <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 ml-2">Trip Status</h3>
//           <div className="h-[350px] w-full">
//             {formattedStatusData.length > 0 ? (
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie
//                     data={formattedStatusData}
//                     dataKey="value"
//                     nameKey="name"
//                     innerRadius={80}
//                     outerRadius={110}
//                     paddingAngle={10}
//                   >
//                     {formattedStatusData.map((_, index) => (
//                       <Cell key={index} fill={COLORS[index % COLORS.length]} cornerRadius={10} stroke="none" />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                   <Legend verticalAlign="bottom" height={36} iconType="circle" />
//                 </PieChart>
//               </ResponsiveContainer>
//             ) : <NoData message="No trips found" />}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // --- 🛠️ HELPER COMPONENTS ---
// function StatCard({ title, value, color, icon }) {
//   return (
//     <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
//       <div className="flex items-center gap-4">
//         <div className="text-3xl bg-gray-50 p-3 rounded-2xl">{icon}</div>
//         <div>
//           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
//           <p className={`text-2xl font-black ${color}`}>{value || 0}</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// const CustomTooltip = ({ active, payload }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-white p-4 shadow-2xl rounded-2xl border-none">
//         <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{payload[0].payload.name}</p>
//         <p className="text-lg font-black text-blue-600">₹{payload[0].value?.toLocaleString()}</p>
//       </div>
//     );
//   }
//   return null;
// };

// const NoData = ({ message }) => (
//   <div className="flex flex-col items-center justify-center h-full text-gray-300">
//     <div className="text-4xl mb-2">📊</div>
//     <p className="text-sm font-medium">{message}</p>
//   </div>
// );