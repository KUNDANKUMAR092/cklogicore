// CrudForm.jsx


import React from "react";
import CommonSelect from "./CommonSelect";

const CrudForm = ({ form, setForm, fields }) => {

  /* ===============================
      HANDLE CHANGE
  =============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, key] = name.split(".");
      setForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [key]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  /* ===============================
      GET VALUE
  =============================== */
  const getValue = (field) => {
    let val;
    if (field.name.includes(".")) {
      const [p, k] = field.name.split(".");
      val = form[p]?.[k];
    } else {
      val = form[field.name];
    }

    if (field.type === "date" && val) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
      return "";
    }

    if (typeof val === "object" && val !== null) {
      return val._id || "";
    }

    return val || "";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 max-h-[calc(100vh-250px)] overflow-y-auto px-1 pb-4">
      {fields.map((field) => {
        const isDisabled = field.disabled || (field.name === "vehicleNumber" && form?._id);

        return (
          <div key={field.name} className="flex flex-col space-y-1.5">
            {/* Label Styling */}
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>

            {field.type === "select" ? (
              <div className={`relative ${isDisabled ? 'opacity-70' : ''}`}>
                <CommonSelect
                  name={field.name}
                  value={getValue(field)}
                  options={field.options}
                  onChange={handleChange}
                  disabled={isDisabled}
                  // Note: Ensure CommonSelect also accepts className for consistent styling
                />
              </div>
            ) : (
              <input
                type={field.type || "text"}
                name={field.name}
                value={getValue(field) || ""}
                onChange={handleChange}
                disabled={isDisabled}
                required={field.required || false}
                placeholder={`Enter ${field.label.toLowerCase()}...`}
                className={`w-full px-4 py-3 border rounded-2xl text-sm font-medium outline-none transition-all duration-200
                  ${isDisabled 
                    ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed select-none" 
                    : "bg-white border-gray-200 text-gray-700 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 focus:bg-white"
                  }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CrudForm;
















// import React from "react";
// import CommonSelect from "./CommonSelect";
// import { toInputDate } from "../utils/reUseableFn";

// const CrudForm = ({ form, setForm, fields }) => {

//   /* ===============================
//       HANDLE CHANGE
//   =============================== */
//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     // Nested (rates.xxx / financials.xxx)
//     if (name.includes(".")) {
//       const [parent, key] = name.split(".");
//       setForm((prev) => ({
//         ...prev,
//         [parent]: {
//           ...prev[parent],
//           [key]: value,
//         },
//       }));
//     } else {
//       setForm((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     }
//   };

//   /* ===============================
//       GET VALUE (SMART, DATE SAFE)
//   =============================== */
//   const getValue = (field) => {

//     let val;

//     // Handle nested fields first
//     if (field.name.includes(".")) {
//       const [p, k] = field.name.split(".");
//       val = form[p]?.[k];
//     } else {
//       val = form[field.name];
//     }

//     /* ===== DATE FIX ===== */
//     if (field.type === "date" && val) {
//       const d = new Date(val);

//       if (!isNaN(d.getTime())) {
//         const yyyy = d.getFullYear();
//         const mm = String(d.getMonth() + 1).padStart(2, "0");
//         const dd = String(d.getDate()).padStart(2, "0");

//         return `${yyyy}-${mm}-${dd}`; // ✅ ONLY VALID FORMAT
//       }

//       return "";
//     }

//     /* ===== OBJECT → ID ===== */
//     if (typeof val === "object" && val !== null) {
//       return val._id || "";
//     }

//     return val || "";
//   };




//   /* ===============================
//       RENDER
//   =============================== */
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[calc(100vh-180px)] overflow-y-auto">
//       {fields.map((field) => (
//         <div key={field.name} className="flex flex-col">
//           <label className="font-semibold mb-1">{field.label}</label>

//           {/* ===== DROPDOWN ===== */}
//           {field.type === "select" ? (
//             <CommonSelect
//               name={field.name}
//               value={getValue(field)}
//               options={field.options}
//               onChange={handleChange}
//             />
//           ) : (
//             /* ===== INPUT ===== */
//             <input
//               type={field.type || "text"}
//               name={field.name}
//               // Value handle karne ke liye getValue(field) kaafi hai kyunki useEffect modal mein ise fill kar chuka hai
//               value={getValue(field) || ""}
//               onChange={handleChange}
              
//               // Dynamic Disabled Logic
//               disabled={
//                 field.disabled || // Hamara naya dynamic rule (Supplier/Company name ke liye)
//                 (field.name === "vehicleNumber" && form?._id) // Aapka purana hardcoded rule
//               }
              
//               required={field.required || false}
              
//               // Styling: Disabled hone par background color change karein taki user ko pata chale wo edit nahi kar sakta
//               className={`border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
//                 (field.disabled || (field.name === "vehicleNumber" && form?._id)) 
//                   ? "bg-gray-100 cursor-not-allowed text-gray-500 font-medium" 
//                   : "bg-white"
//               }`}
//             />
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default CrudForm;