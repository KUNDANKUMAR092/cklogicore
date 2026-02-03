import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  FaSearch,
  FaCalendarAlt,
  FaBuilding,
  FaSyncAlt,
  FaTruck,
  FaHandshake,
  FaDownload,
  FaFileExport,
} from "react-icons/fa";

// Constants & API Hooks
import { useGetDashboardStatsQuery } from "../features/dashboard/dashboardApi";
import { useGetCompaniesQuery } from "../features/companies/companyApi";
import { useGetVehiclesQuery } from "../features/vehicles/vehicleApi";
import { useGetSuppliersQuery } from "../features/suppliers/supplierApi";
import Loader from "../components/Loader";

const COLORS = ["#10b981", "#3b82f6", "#6366f1", "#f59e0b"]; // Colors matched to cards

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
    supplierId: "",
  });
  const [exportTarget, setExportTarget] = useState("COMPANY");

  // 3. API DATA FETCHING
  const {
    data: response,
    error,
    isLoading,
    isFetching,
  } = useGetDashboardStatsQuery(filters, { refetchOnMountOrArgChange: true });

  const { data: companyData } = useGetCompaniesQuery({ limit: 1000 });
  const { data: vehicleData } = useGetVehiclesQuery({ limit: 1000 });
  const { data: supplierData } = useGetSuppliersQuery({ limit: 1000 });

  const rawData = response || {};

  // 4. SECURE EXCEL EXPORT
  const handleExport = async () => {
    if (!accessToken) {
      toast.error("Session expired. Please login again.");
      return;
    }
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        target: exportTarget,
      }).toString();
      const baseUrl = "http://localhost:5000/api/v1";
      const res = await axios.get(
        `${baseUrl}/excel/export-trips?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Report_${exportTarget}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Downloaded!");
    } catch (err) {
      toast.error("Unauthorized: Please check your login");
    }
  };

  // 5. CHART DATA FORMATTING (Updated for Metrics)
  const formattedMetricsData = useMemo(() => {
    const overview = rawData.overview || {};
    return [
      { name: "Profit", value: overview.totalProfit || 0 },
      { name: "Revenue", value: overview.totalRevenue || 0 },
      { name: "Trips", value: overview.totalTrips || 0 },
      { name: "Weight", value: overview.totalWeight || 0 },
    ];
  }, [rawData.overview]);

  // 6. UI HANDLERS
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      search: "",
      companyId: "",
      vehicleId: "",
      supplierId: "",
    });
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex flex-col items-center justify-center p-10 min-h-screen">
        <Loader />
        <p className="text-gray-500 mt-2 text-sm animate-pulse">
          Analysing Business...
        </p>
      </div>
    );
  }

  if (error)
    return (
      <div className="p-20 text-center text-red-500 font-bold">
        Error loading dashboard.
      </div>
    );

  return (
    <div className="md:p-6 min-h-screen font-sans">
      {/* HEADER SECTION WITH EXPORT */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
            Logicore BI
          </h1>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">
            Logistics Intelligence
          </p>
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
      <div className="bg-white p-4 md:p-5 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 mb-8 flex flex-col gap-4 w-full">
        {/* Filter Row 1: Search and Reset */}
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full">
          {/* Search and Reset Wrapper for Mobile */}
          <div className="flex items-center gap-2 w-full md:flex-1">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Trip ID..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 transition-all border border-transparent"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            {/* Reset Button: Mobile par search ke bad, Desktop par line ke end mein lane ke liye 'md:hidden' aur niche wala 'hidden md:flex' use kiya hai */}
            <button
              onClick={resetFilters}
              className="flex md:hidden items-center gap-2 px-3 py-3.5 text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 active:bg-gray-100 shrink-0"
            >
              <FaSyncAlt size={14} />
            </button>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center justify-between gap-2 bg-gray-50 p-2.5 rounded-2xl border border-gray-100 w-full md:w-auto md:min-w-[280px]">
            <div className="flex items-center gap-2 flex-1">
              <FaCalendarAlt className="ml-1 text-gray-400 size-3 shrink-0" />
              <input
                type="date"
                className="bg-transparent text-[11px] sm:text-xs outline-none w-full"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
              />
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex-1">
              <input
                type="date"
                className="bg-transparent text-[11px] sm:text-xs outline-none w-full"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
          </div>

          {/* Reset Button for Desktop: Jo line ke aakhri mein dikhega */}
          <button
            onClick={resetFilters}
            className="hidden md:flex p-3.5 text-gray-400 hover:text-blue-500 transition-colors bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 cursor-pointer"
          >
            <FaSyncAlt size={14} />
            <span className="text-xs font-medium">Reset Filter</span>
          </button>
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Dropdown
            icon={<FaBuilding />}
            label="All Companies"
            value={filters.companyId}
            options={companyData?.list}
            name="companyId"
            onChange={handleFilterChange}
          />
          <Dropdown
            icon={<FaTruck />}
            label="All Vehicles"
            value={filters.vehicleId}
            options={vehicleData?.list}
            name="vehicleId"
            onChange={handleFilterChange}
            displayKey="vehicleNumber"
          />
          <Dropdown
            icon={<FaHandshake />}
            label="All Suppliers"
            value={filters.supplierId}
            options={supplierData?.list}
            name="supplierId"
            onChange={handleFilterChange}
          />
        </div>
      </div>
      {/* <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full">
          <div className="flex-1 min-w-[250px] relative">
            <FaSearch className="absolute left-4 top-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Trip ID, Points or Numbers..."
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 transition-all"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-2 bg-gray-50 p-2.5 rounded-2xl border border-gray-100 flex-1 min-w-[280px]">
            <div className="flex items-center gap-2 flex-1">
              <FaCalendarAlt className="ml-1 text-gray-400 size-3 shrink-0" />
              <input
                type="date"
                className="bg-transparent text-[11px] sm:text-xs outline-none w-full"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
              />
            </div>

            <span className="text-gray-300">|</span>

            <div className="flex-1">
              <input
                type="date"
                className="bg-transparent text-[11px] sm:text-xs outline-none w-full"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="p-4 text-gray-400 hover:text-blue-500 transition-colors bg-gray-50 rounded-2xl"
          >
            <FaSyncAlt size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Dropdown
            icon={<FaBuilding />}
            label="All Companies"
            value={filters.companyId}
            options={companyData?.list}
            name="companyId"
            onChange={handleFilterChange}
          />
          <Dropdown
            icon={<FaTruck />}
            label="All Vehicles"
            value={filters.vehicleId}
            options={vehicleData?.list}
            name="vehicleId"
            onChange={handleFilterChange}
            displayKey="vehicleNumber"
          />
          <Dropdown
            icon={<FaHandshake />}
            label="All Suppliers"
            value={filters.supplierId}
            options={supplierData?.list}
            name="supplierId"
            onChange={handleFilterChange}
          />
        </div>
      </div> */}

      {/* --- KEY STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Profit"
          value={`₹${rawData.overview?.totalProfit?.toLocaleString() || 0}`}
          color="text-green-600"
          icon="📈"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${rawData.overview?.totalRevenue?.toLocaleString() || 0}`}
          color="text-blue-600"
          icon="💰"
        />
        <StatCard
          title="Total Trips"
          value={rawData.overview?.totalTrips || 0}
          color="text-indigo-600"
          icon="🚚"
        />
        <StatCard
          title="Total Weight"
          value={`${rawData.overview?.totalWeight || 0} MT`}
          color="text-orange-600"
          icon="⚖️"
        />
      </div>

      {/* --- VISUAL CHARTS (METRICS BASED) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Metric Comparison Bar Chart */}
        <ChartContainer title="Business Metrics Comparison">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedMetricsData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                content={<CustomTooltip />}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {formattedMetricsData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Operational Breakdown Pie Chart */}
        <ChartContainer title="Operational Mix Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedMetricsData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={8}
              >
                {formattedMetricsData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    cornerRadius={10}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}

// --- REUSABLE UI COMPONENTS ---
const Dropdown = ({
  icon,
  label,
  value,
  options,
  name,
  onChange,
  displayKey = "name",
}) => (
  <div className="relative">
    <span className="absolute left-4 top-4 text-gray-400 size-3">{icon}</span>
    <select
      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500 appearance-none cursor-pointer"
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
    >
      <option value="">{label}</option>
      {options?.map((o) => (
        <option key={o._id} value={o._id}>
          {o[displayKey]}
        </option>
      ))}
    </select>
  </div>
);

const ChartContainer = ({ title, children }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[420px]">
    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">
      {title}
    </h3>
    <div className="h-[320px] w-full">{children}</div>
  </div>
);

function StatCard({ title, value, color, icon }) {
  return (
    <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-lg transition-all">
      <div className="flex items-center gap-5">
        <div className="text-3xl bg-gray-50 p-4 rounded-3xl shadow-inner">
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            {title}
          </p>
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
        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">
          {payload[0].payload.name}
        </p>
        <p className="text-lg font-black text-blue-600">
          ₹{payload[0].value?.toLocaleString()}
        </p>
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
