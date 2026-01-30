import React, { useState, useMemo } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { formatDate } from "../utils/reUseableFn";
import CrudModal from "./CrudModal";
import ToggleSwitch from "./ToggleSwitch";
import Loader from "./Loader";

export default function CrudList({
  data = [],
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

  loading = false,
}) {

  /* ================= SAFE DATA ================= */

  const safeData = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  const safeFields = useMemo(() => {
    return Array.isArray(fields) ? fields : [];
  }, [fields]);

  const [editData, setEditData] = useState(null);

  /* ================= HELPERS ================= */

  const getNestedValue = (obj, path) => {
    if (!obj || !path) return null;

    try {
      return path.split(".").reduce((acc, key) => acc?.[key], obj);
    } catch {
      return null;
    }
  };

  const renderValue = (row, field) => {
    if (!row || !field?.name) return "-";

    let value = getNestedValue(row, field.name);

    if (value === null || value === undefined) return "-";

    if (field.type === "date") {
      try {
        return formatDate(value) || "-";
      } catch {
        return "-";
      }
    }

    if (typeof value === "object") {
      return (
        value?.vehicleNumber ||
        value?.name ||
        value?.title ||
        "-"
      );
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    return value;
  };

  const getToggleValue = (row) => {
    if (!row) return false;

    if (typeof row.isActive === "boolean") return row.isActive;

    return false;
  };

  /* ================= FILTER DATA ================= */

  const filteredData = useMemo(() => {

    let temp = [...safeData];

    /* Search */
    if (search) {
      temp = temp.filter((row) =>
        JSON.stringify(row)
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    /* Active / Inactive Filter */
    if (filterValue !== "all") {
      temp = temp.filter(
        (row) => String(row?.isActive) === filterValue
      );
    }

    return temp;

  }, [safeData, search, filterValue]);

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(
    filteredData.length / limit
  );

  const paginatedData = useMemo(() => {

    if (!filteredData.length) return [];

    const start = (page - 1) * limit;

    return filteredData.slice(
      start,
      start + limit
    );

  }, [filteredData, page]);

  /* ================= MOBILE ================= */

  const MobileView = () => (
    <div className="space-y-4 md:hidden">

      {paginatedData?.map((row, index) => (

        <div
          key={row?._id || index}
          className="bg-white border rounded-lg p-4 shadow-sm"
        >

          {safeFields.map((field) => (

            <div
              key={field?.name}
              className="flex justify-between text-sm py-1 border-b last:border-b-0"
            >

              <span className="font-medium text-gray-600">
                {field?.label}
              </span>

              <span className="text-gray-800 text-right max-w-[60%] break-words">
                {renderValue(row, field)}
              </span>

            </div>

          ))}

          <div className="flex gap-3 mt-3 justify-end">

            {onEdit && (
              <button
                onClick={() => {
                  setEditData(row);
                  setOpen(true);
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
              >
                Edit
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete?.(row?._id)}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm"
              >
                Delete
              </button>
            )}

            {onToggale && (
              <ToggleSwitch
                enabled={getToggleValue(row)}
                onChange={(val) =>
                  onToggale?.(row?._id, val)
                }
              />
            )}

          </div>

        </div>

      ))}

    </div>
  );

  /* ================= DESKTOP ================= */

  const DesktopView = () => {

    const middleFields = safeFields.slice(1);

    return (
      <div className="hidden md:block w-full border rounded bg-white overflow-hidden">

        <div className="flex w-full max-w-full">

          {/* LEFT */}
          <div className="min-w-[180px] shrink-0 border-r bg-white z-20">

            <div className="bg-gray-100 font-semibold px-3 py-2 border-b">
              {safeFields[0]?.label}
            </div>

            {paginatedData?.map((row, index) => (

              <div
                key={row?._id || index}
                className="px-3 py-2 text-sm border-b whitespace-nowrap pt-3 min-h-[40px]"
              >
                {renderValue(row, safeFields[0])}
              </div>

            ))}

          </div>

          {/* CENTER */}
          <div className="flex-1 min-w-0 overflow-x-auto">

            <div
              style={{
                width: `${middleFields.length * 180}px`,
                maxWidth: "calc(100vw - 675px)",
                minWidth: "100%",
              }}
            >

              <div className="min-w-max">

                <div className="min-w-max flex bg-gray-100 font-semibold border-b sticky top-0 pt-1 z-10">

                  {middleFields.map((f) => (

                    <div
                      key={f?.name}
                      className="min-w-[180px] flex-1 px-3 py-2 text-sm whitespace-nowrap"
                    >
                      {f?.label}
                    </div>

                  ))}

                </div>

                {paginatedData?.map((row, index) => (

                  <div
                    key={row?._id || index}
                    className="min-w-max flex border-b hover:bg-gray-50"
                  >

                    {middleFields.map((f) => (

                      <div
                        key={f?.name}
                        className="min-w-[180px] flex-1 px-3 py-2 text-sm whitespace-nowrap min-h-[40px]"
                      >
                        {renderValue(row, f)}
                      </div>

                    ))}

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* RIGHT */}
          <div className="w-[140px] shrink-0 border-l bg-white z-20">

            <div className="bg-gray-100 font-semibold px-3 py-2 border-b">
              Actions
            </div>

            {paginatedData?.map((row, index) => (

              <div
                key={row?._id || index}
                className="px-2 py-2 border-b flex gap-2"
              >

                {onEdit && (
                  <button
                    onClick={() => {
                      setEditData(row);
                      setOpen(true);
                    }}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs flex items-center cursor-pointer"
                  >
                    <FaEdit size={12} className="mr-1" /> Edit
                  </button>
                )}

                {onDelete && (
                  <button
                    onClick={() => onDelete?.(row?._id)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs flex items-center cursor-pointer"
                  >
                    <FaTrash size={10} className="mr-1" /> Delete
                  </button>
                )}

                {onToggale && (
                  <ToggleSwitch
                    enabled={getToggleValue(row)}
                    onChange={(val) =>
                      onToggale?.(row?._id, val)
                    }
                  />
                )}

              </div>

            ))}

          </div>

        </div>
      </div>
    );
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = (form) => {

    if (!form || typeof form !== "object") return;

    if (
      editData?.vehicleNumber &&
      form?.vehicleNumber &&
      editData.vehicleNumber !== form.vehicleNumber
    ) {
      alert("Vehicle number cannot be changed");
      return;
    }

    if (editData) onUpdate?.(editData._id, form);
    else onCreate?.(form);

    setOpen(false);
    setEditData(null);
  };

  /* ================= MAIN ================= */

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
      <>
        <div className="w-full min-w-0 overflow-hidden">

          {/* FILTER BAR */}

          <div className="flex flex-col md:flex-row gap-3 mb-4">

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="border px-3 py-2 rounded w-full md:w-64 text-sm"
            />

            <select
              value={filterValue}
              onChange={(e) => {
                setFilterValue(e.target.value);
                setPage(1);
              }}
              className="border px-3 py-2 rounded w-full md:w-48 text-sm"
            >
              <option value="all">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

          </div>

          <MobileView />

          <DesktopView />

          {/* PAGINATION */}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">

              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>

              <span className="px-3 py-1 text-sm">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>

            </div>
          )}

        </div>

        {open && (
          <CrudModal
            open={open}
            setOpen={setOpen}
            fields={safeFields}
            data={editData}
            onSubmit={handleSubmit}
          />
        )}
      </>
      )}
    </>
  );
}















// import React, { useState, useMemo } from "react";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import { formatDate } from "../utils/reUseableFn";
// import CrudModal from "./CrudModal";
// import ToggleSwitch from "./ToggleSwitch";

// export default function CrudList({
//   data = [],
//   fields = [],
//   onCreate,
//   onUpdate,
//   onDelete,
//   onToggale,
//   onEdit,
//   open,
//   setOpen,
// }) {

//   /* ================= SAFE DATA ================= */

//   const safeData = useMemo(() => {
//     return Array.isArray(data) ? data : [];
//   }, [data]);

//   const safeFields = useMemo(() => {
//     return Array.isArray(fields) ? fields : [];
//   }, [fields]);

//   const [editData, setEditData] = useState(null);

//   /* ================= HELPERS ================= */

//   const getNestedValue = (obj, path) => {
//     if (!obj || !path) return null;

//     try {
//       return path.split(".").reduce((acc, key) => acc?.[key], obj);
//     } catch {
//       return null;
//     }
//   };

//   const renderValue = (row, field) => {
//     if (!row || !field?.name) return "-";

//     let value = getNestedValue(row, field.name);

//     if (value === null || value === undefined) return "-";

//     if (field.type === "date") {
//       try {
//         return formatDate(value) || "-";
//       } catch {
//         return "-";
//       }
//     }

//     if (typeof value === "object") {
//       return (
//         value?.vehicleNumber ||
//         value?.name ||
//         value?.title ||
//         "-"
//       );
//     }

//     if (typeof value === "boolean") {
//       return value ? "Yes" : "No";
//     }

//     return value;
//   };

//   const getToggleValue = (row) => {
//     if (!row) return false;

//     // if (typeof row.isDeleted === "boolean") return row.isDeleted;
//     if (typeof row.isActive === "boolean") return row.isActive;

//     return false;
//   };

//   /* ================= MOBILE ================= */

//   const MobileView = () => (
//     <div className="space-y-4 md:hidden">

//       {safeData?.map((row, index) => (

//         <div
//           key={row?._id || index}
//           className="bg-white border rounded-lg p-4 shadow-sm"
//         >

//           {safeFields.map((field) => (

//             <div
//               key={field?.name}
//               className="flex justify-between text-sm py-1 border-b last:border-b-0"
//             >

//               <span className="font-medium text-gray-600">
//                 {field?.label}
//               </span>

//               <span className="text-gray-800 text-right max-w-[60%] break-words">
//                 {renderValue(row, field)}
//               </span>

//             </div>

//           ))}

//           <div className="flex gap-3 mt-3 justify-end">

//             {onEdit && (
//               <button
//                 onClick={() => {
//                   setEditData(row);
//                   setOpen(true);
//                 }}
//                 className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
//               >
//                 Edit
//               </button>
//             )}

//             {onDelete && (
//               <button
//                 onClick={() => onDelete?.(row?._id)}
//                 className="px-3 py-1 bg-red-500 text-white rounded text-sm"
//               >
//                 Delete
//               </button>
//             )}

//             {onToggale && (
//               <ToggleSwitch
//                 enabled={getToggleValue(row)}
//                 onChange={(val) =>
//                   onToggale?.(row?._id, val)
//                 }
//               />
//             )}

//           </div>

//         </div>

//       ))}

//     </div>
//   );

//   /* ================= DESKTOP ================= */

//   const DesktopView = () => {

//     const middleFields = safeFields.slice(1);

//     return (
//       <div className="hidden md:block w-full border rounded bg-white overflow-hidden">

//         <div className="flex w-full max-w-full">

//           {/* LEFT */}
//           <div className="min-w-[180px] shrink-0 border-r bg-white z-20">

//             <div className="bg-gray-100 font-semibold px-3 py-2 border-b">
//               {safeFields[0]?.label}
//             </div>

//             {safeData?.map((row, index) => (

//               <div
//                 key={row?._id || index}
//                 className="px-3 py-2 text-sm border-b whitespace-nowrap pt-3 min-h-[40px]"
//               >
//                 {renderValue(row, safeFields[0])}
//               </div>

//             ))}

//           </div>

//           {/* CENTER */}
//           <div className="flex-1 min-w-0 overflow-x-auto">

//             <div
//               style={{
//                 width: `${middleFields.length * 180}px`,
//                 maxWidth: "calc(100vw - 675px)",
//                 minWidth: "calc(100%)",
//               }}
//             >

//               <div className="min-w-max">

//                 <div className="min-w-max flex bg-gray-100 font-semibold border-b sticky top-0 pt-1 z-10">

//                   {middleFields.map((f) => (

//                     <div
//                       key={f?.name}
//                       className="min-w-[180px] flex-1 px-3 py-2 font-semibold text-sm whitespace-nowrap"
//                     >
//                       {f?.label}
//                     </div>

//                   ))}

//                 </div>

//                 {safeData?.map((row, index) => (

//                   <div
//                     key={row?._id || index}
//                     className="min-w-max flex border-b hover:bg-gray-50"
//                   >

//                     {middleFields.map((f) => (

//                       <div
//                         key={f?.name}
//                         className="min-w-[180px] flex-1 px-3 py-2 text-sm whitespace-nowrap min-h-[40px]"
//                       >
//                         {renderValue(row, f)}
//                       </div>

//                     ))}

//                   </div>

//                 ))}

//               </div>

//             </div>

//           </div>

//           {/* RIGHT */}
//           <div className="w-[140px] shrink-0 border-l bg-white z-20">

//             <div className="bg-gray-100 font-semibold px-3 py-2 border-b">
//               Actions
//             </div>

//             {safeData?.map((row, index) => (

//               <div
//                 key={row?._id || index}
//                 className="px-2 py-2 border-b flex gap-2"
//               >

//                 {onEdit && (
//                   <button
//                     onClick={() => {
//                       setEditData(row);
//                       setOpen(true);
//                     }}
//                     className="px-2 py-1 bg-blue-500 text-white rounded text-xs flex justify-around items-center cursor-pointer"
//                   >
//                     <FaEdit size={12} className="mr-[2px]" /> Edit
//                   </button>
//                 )}

//                 {onDelete && (
//                   <button
//                     onClick={() => onDelete?.(row?._id)}
//                     className="px-2 py-1 bg-red-500 text-white rounded text-xs flex justify-around items-center cursor-pointer"
//                   >
//                     <FaTrash size={10} className="mr-[2px]" /> Delete
//                   </button>
//                 )}

//                 {onToggale && (
//                   <ToggleSwitch
//                     enabled={getToggleValue(row)}
//                     onChange={(val) =>
//                       onToggale?.(row?._id, val)
//                     }
//                   />
//                 )}

//               </div>

//             ))}

//           </div>

//         </div>
//       </div>
//     );
//   };

//   /* ================= SUBMIT ================= */

//   const handleSubmit = (form) => {

//     if (!form || typeof form !== "object") return;

//     if (
//       editData?.vehicleNumber &&
//       form?.vehicleNumber &&
//       editData.vehicleNumber !== form.vehicleNumber
//     ) {
//       alert("Vehicle number cannot be changed");
//       return;
//     }

//     if (editData) onUpdate?.(editData._id, form);
//     else onCreate?.(form);

//     setOpen(false);
//     setEditData(null);
//   };

//   /* ================= MAIN ================= */

//   return (
//     <>
//       <div className="w-full min-w-0 overflow-hidden">

//         <MobileView />

//         <DesktopView />

//       </div>

//       {open && (
//         <CrudModal
//           open={open}
//           setOpen={setOpen}
//           fields={safeFields}
//           data={editData}
//           onSubmit={handleSubmit}
//         />
//       )}
//     </>
//   );
// }