import React, { useState, useMemo } from "react";
import { FaEdit, FaInbox, FaTrash } from "react-icons/fa";
import { formatDate } from "../utils/reUseableFn";
import CrudModal from "./CrudModal";
import ToggleSwitch from "./ToggleSwitch";
import Loader from "./Loader";
import DataHandler from "./DataHandler";
import { FaFilePdf, FaFileAlt, FaImage } from "react-icons/fa";
import ChallanThumbnail from "./ChallanThumbnail";

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
  onRemoveChallan,
}) {
  const [editData, setEditData] = useState(null);

  /* ================= 1. SAFE DATA LOGIC ================= */
  const safeData = useMemo(() => {
    if (Array.isArray(incomingData)) return incomingData;
    if (incomingData && typeof incomingData === 'object' && Array.isArray(incomingData.list)) {
      return incomingData.list;
    }
    return [];
  }, [incomingData]);
  
  /* ================= 2. HELPERS ================= */
  const getNestedValue = (obj, path) => {
    if (!obj || !path) return null;
    try {
      return path.split(".").reduce((acc, key) => acc?.[key], obj);
    } catch { return null; }
  };

  /* ================= renderValue: Purely non-breaking ================= */
  const renderValue = (row, field) => {
    if (!row || !field?.name) return "-";
    let value = getNestedValue(row, field.name);

    // 1. Status Badge (Aapka existing logic - No change)
    if (field.name === "status") {
      const colors = {
        pending: "bg-amber-100 text-amber-700 border-amber-200",
        running: "bg-blue-100 text-blue-700 border-blue-200",
        completed: "bg-green-100 text-green-700 border-green-200",
        cancelled: "bg-red-100 text-red-700 border-red-200",
      };
      return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[value] || "bg-gray-100 text-gray-600"}`}>
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : "N/A"}
        </span>
      );
    }

    // 2. File Handling (Using common component)
    // Humne purana inline function hata kar naya component use kiya hai
    if (field.type === "file") {
      const files = Array.isArray(value) ? value : [];
      if (files.length === 0) return <span className="text-gray-300 text-[10px] italic">No Docs</span>;
      return (
        <div className="flex -space-x-2 items-center">
          {files.map((f, i) => (
            <ChallanThumbnail 
              key={f._id || i} 
              file={f} 
              index={i} 
              // Note: List view mein delete icon nahi dikhana hai, 
              // isliye yahan onDelete prop pass nahi karenge.
            />
          ))}
        </div>
      );
    }

    // 3. Dates/General (Wahi purana logic - No change)
    if (value === null || value === undefined) return "-";
    if (field.type === "date") return formatDate(value) || "-";
    
    // 4. Objects (Supplier/Vehicle populates - No change)
    if (typeof value === "object") {
      return value?.vehicleNumber || value?.companyName || value?.name || value?.title || "-";
    }

    return String(value);
  };


  const safeFields = useMemo(() => {
    return Array.isArray(fields) ? fields.filter(f => !f.hidden) : [];
  }, [fields]);

  const totalPages = Math.ceil((total || 0) / limit) || 1;

  /* ================= 3. SUB-COMPONENTS ================= */
  
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
            {onEdit && (
              <button 
                onClick={() => { setEditData(row); setOpen(true); }} 
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm cursor-pointer"
              >
                Edit
              </button>
            )}
            {onToggale && <ToggleSwitch enabled={row.isActive ?? !row.isDeleted} onChange={(val) => onToggale?.(row?._id, val)} />}
            {onDelete && (
              <button 
                onClick={() => onDelete?.(row?._id)} 
                className="px-3 py-1 bg-red-500 text-white rounded text-sm cursor-pointer"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const DesktopView = () => {
    return (
      <div className="hidden md:block w-full border rounded bg-white overflow-hidden">
        <div className="flex w-full overflow-x-auto">
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
                        <button 
                          onClick={() => { setEditData(row); setOpen(true); }} 
                          className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition cursor-pointer"
                        >
                          <FaEdit size={12} />
                        </button>
                      )}
                      {onToggale && <ToggleSwitch enabled={row.isActive ?? !row.isDeleted} onChange={(val) => onToggale?.(row?._id, val)} />}
                      {onDelete && (
                        <button 
                          onClick={() => onDelete?.(row?._id)} 
                          className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition cursor-pointer"
                        >
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

      <DataHandler loading={isLoading} error={error}>
        {safeData.length > 0 ? (
          <>
            <MobileView />
            <DesktopView />
            
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6 pb-4">
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(page - 1)} 
                  className="px-4 py-1.5 border rounded-md hover:bg-gray-50 transition cursor-pointer"
                >
                  Prev
                </button>
                <span className="text-sm font-medium italic text-gray-600">Page {page} of {totalPages}</span>
                <button 
                  disabled={page === totalPages} 
                  onClick={() => setPage(page + 1)} 
                  className="px-4 py-1.5 border rounded-md hover:bg-gray-50 transition cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
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
          onRemoveChallan={onRemoveChallan}
        />
      )}
    </>
  );
}



// import React, { useState, useMemo } from "react";
// import { FaEdit, FaInbox, FaTrash } from "react-icons/fa";
// import { formatDate } from "../utils/reUseableFn";
// import CrudModal from "./CrudModal";
// import ToggleSwitch from "./ToggleSwitch";
// import Loader from "./Loader";
// import DataHandler from "./DataHandler";

// export default function CrudList({
//   data: incomingData = [],
//   fields = [],
//   onCreate,
//   onUpdate,
//   onDelete,
//   onToggale,
//   onEdit,
//   open,
//   setOpen,
//   search,
//   setSearch,
//   filterValue,
//   setFilterValue,
//   page,
//   setPage,
//   limit,
//   total,
//   loading = false,
//   isLoading,
//   error,
// }) {
//   const [editData, setEditData] = useState(null);

//   /* ================= 1. SAFE DATA LOGIC (No more .map crash) ================= */
//   const safeData = useMemo(() => {
//     if (Array.isArray(incomingData)) return incomingData;
//     if (incomingData && typeof incomingData === 'object' && Array.isArray(incomingData.list)) {
//       return incomingData.list;
//     }
//     return [];
//   }, [incomingData]);
  
//   /* ================= 2. HELPERS ================= */
//   const getNestedValue = (obj, path) => {
//     if (!obj || !path) return null;
//     try {
//       return path.split(".").reduce((acc, key) => acc?.[key], obj);
//     } catch { return null; }
//   };

//   // const renderValue = (row, field) => {
//   //   if (!row || !field?.name) return "-";
//   //   let value = getNestedValue(row, field.name);
//   //   if (value === null || value === undefined) return "-";
//   //   if (field.type === "date") return formatDate(value) || "-";
//   //   if (typeof value === "object") {
//   //     return value?.vehicleNumber || value?.name || value?.title || "-";
//   //   }
//   //   return String(value);
//   // };

//   // CrudList.jsx ke andar ye updates karein:

//   // const renderValue = (row, field) => {
//   //   if (!row || !field?.name) return "-";
//   //   let value = getNestedValue(row, field.name);

//   //   // 1. Handle Status UI
//   //   if (field.name === "status") {
//   //     const statusColors = {
//   //       pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
//   //       running: "bg-blue-100 text-blue-700 border-blue-200",
//   //       completed: "bg-green-100 text-green-700 border-green-200",
//   //       cancelled: "bg-red-100 text-red-700 border-red-200",
//   //     };
//   //     return (
//   //       <span className={`px-2 py-1 rounded-full text-xs font-bold border ${statusColors[value] || "bg-gray-100"}`}>
//   //         {value?.toUpperCase() || "N/A"}
//   //       </span>
//   //     );
//   //   }

//   //   // 2. Handle Image/File Display
//   //   if (field.type === "file" && Array.isArray(value) && value.length > 0) {
//   //     return (
//   //       <div className="flex -space-x-2">
//   //         {value.map((fileUrl, i) => (
//   //           <img 
//   //             key={i}
//   //             src={typeof fileUrl === 'string' ? fileUrl : URL.createObjectURL(fileUrl)} 
//   //             className="w-8 h-8 rounded-full border-2 border-white object-cover bg-gray-200"
//   //             alt="challan"
//   //           />
//   //         ))}
//   //       </div>
//   //     );
//   //   }

//   //   if (value === null || value === undefined) return "-";
//   //   if (field.type === "date") return formatDate(value) || "-";
    
//   //   // Object handling (e.g., supplierId.name)
//   //   if (typeof value === "object") {
//   //     return value?.vehicleNumber || value?.name || value?.companyName || "-";
//   //   }

//   //   return String(value);
//   // };

//   // CrudList.jsx ke renderValue function ko isse replace karein
//   const renderValue = (row, field) => {
//     if (!row || !field?.name) return "-";
//     let value = getNestedValue(row, field.name);

//     // 1. Status Badge UI
//     if (field.name === "status") {
//       const colors = {
//         pending: "bg-amber-100 text-amber-700 border-amber-200",
//         running: "bg-blue-100 text-blue-700 border-blue-200",
//         completed: "bg-green-100 text-green-700 border-green-200",
//         cancelled: "bg-red-100 text-red-700 border-red-200",
//       };
//       return (
//         <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[value] || "bg-gray-100 text-gray-600"}`}>
//           {value ? value.charAt(0).toUpperCase() + value.slice(1) : "N/A"}
//         </span>
//       );
//     }

//     // 2. Image/Challan Thumbnail UI
//     if (field.type === "file") {
//       const files = Array.isArray(value) ? value : [];
//       if (files.length === 0) return <span className="text-gray-300 text-xs">No Docs</span>;
//       return (
//         <div className="flex -space-x-2 overflow-hidden">
//           {files.map((file, i) => (
//             <img
//               key={i}
//               src={typeof file === 'string' ? file : URL.createObjectURL(file)}
//               className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover bg-gray-100"
//               alt="challan"
//             />
//           ))}
//         </div>
//       );
//     }

//     // 3. Nested Object / General Value
//     if (value === null || value === undefined) return "-";
//     if (field.type === "date") return formatDate(value) || "-";
//     if (typeof value === "object") {
//       return value?.vehicleNumber || value?.companyName || value?.name || "-";
//     }

//     return String(value);
//   };

//   // safeFields update: hidden fields ko filter out karne ke liye
//   const safeFields = useMemo(() => {
//     return Array.isArray(fields) ? fields.filter(f => !f.hidden) : [];
//   }, [fields]);

//   const totalPages = Math.ceil((total || 0) / limit) || 1;

//   /* ================= 3. SUB-COMPONENTS (Defined before use) ================= */
  
//   const MobileView = () => (
//     <div className="space-y-4 md:hidden">
//       {safeData.map((row, index) => (
//         <div key={row?._id || index} className="bg-white border rounded-lg p-4 shadow-sm">
//           {safeFields.map((field) => (
//             <div key={field?.name} className="flex justify-between text-sm py-1 border-b last:border-b-0">
//               <span className="font-medium text-gray-600">{field?.label}</span>
//               <span className="text-gray-800 text-right max-w-[60%] break-words">{renderValue(row, field)}</span>
//             </div>
//           ))}
//           <div className="flex gap-3 mt-3 justify-end items-center">
//             {onEdit && <button onClick={() => { setEditData(row); setOpen(true); }} className="px-3 py-1 bg-blue-500 text-white rounded text-sm cursor-pointer">Edit</button>}
//             {onToggale && <ToggleSwitch enabled={row.isActive ?? !row.isDeleted} onChange={(val) => onToggale?.(row?._id, val)} />}
//             {onDelete && <button onClick={() => onDelete?.(row?._id)} className="px-3 py-1 bg-red-500 text-white rounded text-sm cursor-pointer">Delete</button>}
//           </div>
//         </div>
//       ))}
//     </div>
//   );

//   const DesktopView = () => {
//     const firstField = safeFields[0];
//     const middleFields = safeFields.slice(1);

//     return (
//       <div className="hidden md:block w-full border rounded bg-white overflow-hidden">
//         <div className="flex w-full overflow-x-auto">
//           {/* Main Table Structure */}
//           <table className="w-full text-left border-collapse">
//             <thead className="bg-gray-100">
//               <tr>
//                 {safeFields.map((f) => (
//                   <th key={f.name} className="px-3 py-3 text-sm font-semibold border-b whitespace-nowrap">{f.label}</th>
//                 ))}
//                 <th className="px-3 py-3 text-sm font-semibold border-b text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {safeData.map((row, index) => (
//                 <tr key={row?._id || index} className="hover:bg-gray-50 border-b last:border-b-0">
//                   {safeFields.map((f) => (
//                     <td key={f.name} className="px-3 py-3 text-sm whitespace-nowrap">{renderValue(row, f)}</td>
//                   ))}
//                   <td className="px-3 py-3">
//                     <div className="flex justify-center gap-2 items-center">
//                       {onEdit && (
//                         <button onClick={() => { setEditData(row); setOpen(true); }} className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition cursor-pointer">
//                           <FaEdit size={12} />
//                         </button>
//                       )}
//                       {onToggale && <ToggleSwitch enabled={row.isActive ?? !row.isDeleted} onChange={(val) => onToggale?.(row?._id, val)} />}
//                       {onDelete && (
//                         <button onClick={() => onDelete?.(row?._id)} className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition cursor-pointer">
//                           <FaTrash size={12} />
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   };

//   const handleSubmit = (form) => {
//     if (editData) onUpdate?.(editData._id, form);
//     else onCreate?.(form);
//     setOpen(false);
//     setEditData(null);
//   };

//   /* ================= 4. MAIN RENDER ================= */
//   return (
//     <>
//       <div className="w-full relative mb-10">
//         <div className="flex flex-col md:flex-row gap-3 mb-4">
//           <input
//             type="text"
//             placeholder="Search..."
//             value={search}
//             onChange={(e) => { setSearch(e.target.value); setPage(1); }}
//             className="border px-3 py-2 rounded w-full md:w-64 text-sm outline-none focus:ring-2 focus:ring-blue-400"
//           />
//           {setFilterValue && (
//             <select
//               value={filterValue}
//               onChange={(e) => { setFilterValue(e.target.value); setPage(1); }}
//               className="border px-3 py-2 rounded w-full md:w-48 text-sm outline-none focus:ring-2 focus:ring-blue-400"
//             >
//               <option value="all">All Status</option>
//               <option value="true">Active</option>
//               <option value="false">Inactive</option>
//             </select>
//           )}
//         </div>
//       </div>

//       {/* DATA HANDLER WRAPPER */}
//       <DataHandler loading={isLoading} error={error}>
//         {safeData.length > 0 ? (
//           <>
//             <MobileView />
//             <DesktopView />
            
//             {/* PAGINATION */}
//             {totalPages > 1 && (
//               <div className="flex justify-center items-center gap-4 mt-6 pb-4">
//                 <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-1.5 border rounded-md hover:bg-gray-50 transition cursor-pointer">Prev</button>
//                 <span className="text-sm font-medium italic text-gray-600">Page {page} of {totalPages}</span>
//                 <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-1.5 border rounded-md hover:bg-gray-50 transition cursor-pointer">Next</button>
//               </div>
//             )}
//           </>
//         ) : (
//           /* CONSISTENT EMPTY STATE */
//           <div className="text-center py-16 text-gray-400 border-2 border-dashed rounded-lg bg-gray-50 flex flex-col items-center">
//             <FaInbox size={40} className="mb-2 opacity-20" />
//             <p className="text-lg font-medium">No data found.</p>
//             <p className="text-sm">Try adjusting your search or filters.</p>
//           </div>
//         )}
//       </DataHandler>

//       {open && (
//         <CrudModal
//           open={open}
//           setOpen={(val) => { setOpen(val); if(!val) setEditData(null); }}
//           fields={safeFields}
//           data={editData}
//           onSubmit={handleSubmit}
//         />
//       )}
//     </>
//   );
// }