import React, { useState, useMemo } from "react";
import DataHandler from "../components/DataHandler";
import ToggleSwitch from "../components/ToggleSwitch";
import { 
  useGetStaffPermissionsQuery, 
  useUpdateStaffPermissionsMutation 
} from "../features/staffPermission/staffPermissionApi";
import { toast } from "react-toastify";

const StaffPermissionsPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // 1. API Call
  const { data, error, isLoading, isFetching } = useGetStaffPermissionsQuery(
    { page, limit, search },
    { refetchOnMountOrArgChange: true }
  );

  const [updateStaffPermissions] = useUpdateStaffPermissionsMutation();

  // 2. Data Memoization
  const { safeList, total } = useMemo(() => ({
    safeList: Array.isArray(data?.list) ? data.list : [],
    total: Number(data?.total) || 0
  }), [data]);

  // 3. Modules List (Backend ke Permission keys ke according)
  const modules = [
    { key: "canManageTrips", label: "Trips" },
    { key: "canManageVehicles", label: "Vehicles" },
    { key: "canManageCompanies", label: "Companies" },
    { key: "canManageSuppliers", label: "Suppliers" },
    { key: "canManageStaff", label: "Staff" },
  ];

  /* ================= HANDLERS ================= */

  const handlePermissionToggle = async (userId, permissionKey, currentStatus) => {
    try {
      // Partial update logic
      const updatedPermissions = { [permissionKey]: !currentStatus };
      
      await updateStaffPermissions({ 
        id: userId, 
        permissions: updatedPermissions 
      }).unwrap();
      
      toast.success("Access updated successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update permissions");
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="w-full min-w-0 overflow-hidden">
      {/* Header & Search Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Staff Permissions</h1>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="border border-gray-300 px-4 py-2 rounded-md w-full md:w-80 text-sm focus:ring-2 focus:ring-blue-400 outline-none transition"
        />
      </div>

      {/* Data Table */}
      <DataHandler loading={isLoading} error={error} isFetching={isFetching}>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-4 border-b font-semibold text-gray-700">Staff Member</th>
                {modules.map((m) => (
                  <th key={m.key} className="px-4 py-4 border-b font-semibold text-center text-gray-700">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {safeList.length > 0 ? (
                safeList.map((staff) => (
                  <tr key={staff._id} className="hover:bg-gray-50 border-b last:border-b-0 transition">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-800">{staff.name}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">{staff.role}</div>
                    </td>
                    {modules.map((m) => (
                      <td key={m.key} className="px-4 py-4 text-center">
                        <div className="flex justify-center items-center">
                          <ToggleSwitch
                            enabled={staff.permissions?.[m.key] || false}
                            onChange={() => handlePermissionToggle(staff._id, m.key, staff.permissions?.[m.key])}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={modules.length + 1} className="p-10 text-center text-gray-400 italic">
                    No staff members found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8 pb-4">
            <button
              disabled={page === 1 || isFetching}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 border rounded-md bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition cursor-pointer"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages || isFetching}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 border rounded-md bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </DataHandler>
    </div>
  );
};

export default StaffPermissionsPage;