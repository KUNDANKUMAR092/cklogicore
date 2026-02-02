import React, { useState, useMemo } from "react";
import { FaEdit, FaInbox, FaTrash } from "react-icons/fa";
import { formatDate } from "../utils/reUseableFn";
import CrudModal from "./CrudModal";
import ToggleSwitch from "./ToggleSwitch";
import Loader from "./Loader";
import DataHandler from "./DataHandler";

export default function CrudList({
  data: incomingData = [],
  fields = [],
  onCreate,
  onUpdate,
  onDelete,
  onToggale,
  onEdit,
  open,
  setOpen,
  search,
  setSearch,
  filterValue,
  setFilterValue,
  page,
  setPage,
  limit,
  total,
  loading = false,
  isLoading,
  error,
}) {
  const [editData, setEditData] = useState(null);

  /* ================= 1. SAFE DATA LOGIC (No more .map crash) ================= */
  const safeData = useMemo(() => {
    if (Array.isArray(incomingData)) return incomingData;
    if (incomingData && typeof incomingData === 'object' && Array.isArray(incomingData.list)) {
      return incomingData.list;
    }
    return [];
  }, [incomingData]);

  const safeFields = useMemo(() => Array.isArray(fields) ? fields : [], [fields]);
  
  /* ================= 2. HELPERS ================= */
  const getNestedValue = (obj, path) => {
    if (!obj || !path) return null;
    try {
      return path.split(".").reduce((acc, key) => acc?.[key], obj);
    } catch { return null; }
  };

  const renderValue = (row, field) => {
    if (!row || !field?.name) return "-";
    let value = getNestedValue(row, field.name);
    if (value === null || value === undefined) return "-";
    if (field.type === "date") return formatDate(value) || "-";
    if (typeof value === "object") {
      return value?.vehicleNumber || value?.name || value?.title || "-";
    }
    return String(value);
  };

  const totalPages = Math.ceil((total || 0) / limit) || 1;

  /* ================= 3. SUB-COMPONENTS (Defined before use) ================= */
  
  const MobileView = () => (
    <div className="space-y-4 md:hidden">
      {safeData.map((row, index) => (
        <div key={row?._id || index} className="bg-white border rounded-lg p-4 shadow-sm">
          {safeFields.map((field) => (
            <div key={field?.name} className="flex justify-between text-sm py-1 border-b last:border-b-0">
              <span className="font-medium text-gray-600">{field?.label}</span>
              <span className="text-gray-800 text-right max-w-[60%] break-words">{renderValue(row, field)}</span>
            </div>
          ))}
          <div className="flex gap-3 mt-3 justify-end items-center">
            {onEdit && <button onClick={() => { setEditData(row); setOpen(true); }} className="px-3 py-1 bg-blue-500 text-white rounded text-sm cursor-pointer">Edit</button>}
            {onToggale && <ToggleSwitch enabled={row.isActive ?? !row.isDeleted} onChange={(val) => onToggale?.(row?._id, val)} />}
            {onDelete && <button onClick={() => onDelete?.(row?._id)} className="px-3 py-1 bg-red-500 text-white rounded text-sm cursor-pointer">Delete</button>}
          </div>
        </div>
      ))}
    </div>
  );

  const DesktopView = () => {
    const firstField = safeFields[0];
    const middleFields = safeFields.slice(1);

    return (
      <div className="hidden md:block w-full border rounded bg-white overflow-hidden">
        <div className="flex w-full overflow-x-auto">
          {/* Main Table Structure */}
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                {safeFields.map((f) => (
                  <th key={f.name} className="px-3 py-3 text-sm font-semibold border-b whitespace-nowrap">{f.label}</th>
                ))}
                <th className="px-3 py-3 text-sm font-semibold border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {safeData.map((row, index) => (
                <tr key={row?._id || index} className="hover:bg-gray-50 border-b last:border-b-0">
                  {safeFields.map((f) => (
                    <td key={f.name} className="px-3 py-3 text-sm whitespace-nowrap">{renderValue(row, f)}</td>
                  ))}
                  <td className="px-3 py-3">
                    <div className="flex justify-center gap-2 items-center">
                      {onEdit && (
                        <button onClick={() => { setEditData(row); setOpen(true); }} className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition cursor-pointer">
                          <FaEdit size={12} />
                        </button>
                      )}
                      {onToggale && <ToggleSwitch enabled={row.isActive ?? !row.isDeleted} onChange={(val) => onToggale?.(row?._id, val)} />}
                      {onDelete && (
                        <button onClick={() => onDelete?.(row?._id)} className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition cursor-pointer">
                          <FaTrash size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const handleSubmit = (form) => {
    if (editData) onUpdate?.(editData._id, form);
    else onCreate?.(form);
    setOpen(false);
    setEditData(null);
  };

  /* ================= 4. MAIN RENDER ================= */
  return (
    <>
      <div className="w-full relative mb-10">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="border px-3 py-2 rounded w-full md:w-64 text-sm outline-none focus:ring-2 focus:ring-blue-400"
          />
          {setFilterValue && (
            <select
              value={filterValue}
              onChange={(e) => { setFilterValue(e.target.value); setPage(1); }}
              className="border px-3 py-2 rounded w-full md:w-48 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          )}
        </div>
      </div>

      {/* DATA HANDLER WRAPPER */}
      <DataHandler loading={isLoading} error={error}>
        {safeData.length > 0 ? (
          <>
            <MobileView />
            <DesktopView />
            
            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6 pb-4">
                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-1.5 border rounded-md hover:bg-gray-50 transition cursor-pointer">Prev</button>
                <span className="text-sm font-medium italic text-gray-600">Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-1.5 border rounded-md hover:bg-gray-50 transition cursor-pointer">Next</button>
              </div>
            )}
          </>
        ) : (
          /* CONSISTENT EMPTY STATE */
          <div className="text-center py-16 text-gray-400 border-2 border-dashed rounded-lg bg-gray-50 flex flex-col items-center">
            <FaInbox size={40} className="mb-2 opacity-20" />
            <p className="text-lg font-medium">No data found.</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </DataHandler>

      {open && (
        <CrudModal
          open={open}
          setOpen={(val) => { setOpen(val); if(!val) setEditData(null); }}
          fields={safeFields}
          data={editData}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}