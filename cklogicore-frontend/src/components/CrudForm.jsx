// CrudForm.jsx

import React from "react";
import CommonSelect from "./CommonSelect";
import ChallanThumbnail from "./ChallanThumbnail"; // 🔥 New Component Import

const CrudForm = ({ form, setForm, fields, onRemoveChallan }) => {

  /* ===============================
      HANDLE CHANGE
  =============================== */
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    let updatedForm = {};

    // 🔥 Identify Value: File inputs ke liye existing files + new files merge karein
    let finalValue;
    if (type === "file") {
      const newSelectedFiles = Array.from(files);
      const existingChallans = Array.isArray(form.challans) ? form.challans : [];
      
      // Limit check (frontend level safety)
      if (existingChallans.length + newSelectedFiles.length > 4) {
        alert("Maximum 4 challans allowed");
        return;
      }
      finalValue = [...existingChallans, ...newSelectedFiles];
    } else {
      finalValue = value;
    }

    // 1. Nested Object Logic (Preserved)
    if (name.includes(".")) {
      const [parent, key] = name.split(".");
      updatedForm = {
        ...form,
        [parent]: { ...(form[parent] || {}), [key]: finalValue },
      };
    } else {
      updatedForm = { ...form, [name]: finalValue };
    }

    // 2. AUTO-CALCULATION LOGIC (Exact same as your original)
    const load = Number(updatedForm.totalTonLoad || 0);
    const r = updatedForm.rates || {};
    const f = updatedForm.financials || {};

    const totalCompany = load * Number(r.companyRatePerTon || 0);
    const totalVehicle = load * Number(r.vehicleRatePerTon || 0);
    const totalSupplier = load * Number(r.supplierRatePerTon || 0);
    
    const totalExpenses = 
      Number(f.dieselCost || 0) + 
      Number(f.tollCost || 0) + 
      Number(f.driverExpense || 0) + 
      Number(f.otherExpense || 0);

    const profit = totalCompany - totalVehicle - totalExpenses;

    setForm({
      ...updatedForm,
      totalFinancials: {
        totalAmountForCompany: totalCompany,
        totalAmountForVehicle: totalVehicle,
        totalAmountForSupplier: totalSupplier,
        profitPerTrip: profit
      }
    });
  };

  /* ===============================
      LOCAL REMOVE (For newly selected files only)
  =============================== */
  const removeNewlySelectedFile = (indexToRemove) => {
    const updatedChallans = form.challans.filter((_, index) => index !== indexToRemove);
    setForm({ ...form, challans: updatedChallans });
  };

  /* ===============================
      GET VALUE (Preserved)
  =============================== */
  const getValue = (field) => {
    let val;
    if (field.name.includes(".")) {
      const [p, k] = field.name.split(".");
      val = form[p]?.[k];
    } else {
      val = form[field.name];
    }
    if (val && typeof val === "object" && val._id) return val._id;
    return val || "";
  };

  return (
    <div className="flex flex-col space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto px-1 pb-4">
      {/* 1. Main Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        {fields.map((field) => {
          if (field.hidden) return null;
          const isDisabled = field.disabled || (field.name === "vehicleNumber" && form?._id);

          return (
            <div key={field.name} className="flex flex-col space-y-1.5">
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
                  />
                </div>
              ) : (
                <input
                  type={field.type || "text"}
                  name={field.name}
                  {...(field.type !== "file" ? { value: getValue(field) || "" } : {})}
                  onChange={handleChange}
                  disabled={isDisabled}
                  required={field.required || false}
                  multiple={field.multiple}
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  className={`w-full px-4 py-3 border rounded-2xl text-sm font-medium outline-none transition-all duration-200
                    ${isDisabled 
                      ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed select-none" 
                      : "bg-white border-gray-200 text-gray-700 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 focus:bg-white"
                    } ${field.type === "file" ? "cursor-pointer" : ""}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 2. 🔥 CHALLAN PREVIEW SECTION (Always visible if files exist) */}
      {form.challans && form.challans.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
            Uploaded Documents ({form.challans.length}/4)
          </p>
          <div className="flex flex-wrap gap-4">
            {form.challans.map((file, index) => (
              <ChallanThumbnail
                key={file._id || index}
                file={file}
                tripId={form._id}
                // Yahan setForm pass ho raha hai takki delete ke baad local state update ho jaye
                onDelete={file._id ? (tId, cId) => onRemoveChallan(tId, cId, setForm) : () => removeNewlySelectedFile(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudForm;











// import React from "react";
// import CommonSelect from "./CommonSelect";

// const CrudForm = ({ form, setForm, fields }) => {

//   /* ===============================
//       HANDLE CHANGE
//   =============================== */
//   const handleChange = (e) => {
//     const { name, value, type, files } = e.target;
//     let updatedForm = {};

//     // 🔥 File inputs ke liye FileList ko array mein convert karein, warna normal value lein
//     let finalValue = type === "file" ? Array.from(files) : value;

//     // 1. Nested Object Logic (Don't break this)
//     if (name.includes(".")) {
//       const [parent, key] = name.split(".");
//       updatedForm = {
//         ...form,
//         [parent]: { 
//           ...(form[parent] || {}), // Ensure parent exists
//           [key]: finalValue 
//         },
//       };
//     } else {
//       updatedForm = { ...form, [name]: finalValue };
//     }

//     // 2. AUTO-CALCULATION LOGIC (Preserving your exact logic)
//     const load = Number(updatedForm.totalTonLoad || 0);
//     const r = updatedForm.rates || {};
//     const f = updatedForm.financials || {};

//     const totalCompany = load * Number(r.companyRatePerTon || 0);
//     const totalVehicle = load * Number(r.vehicleRatePerTon || 0);
//     const totalSupplier = load * Number(r.supplierRatePerTon || 0);
    
//     const totalExpenses = 
//       Number(f.dieselCost || 0) + 
//       Number(f.tollCost || 0) + 
//       Number(f.driverExpense || 0) + 
//       Number(f.otherExpense || 0);

//     const profit = totalCompany - totalVehicle - totalExpenses;

//     // 3. Final State Update
//     setForm({
//       ...updatedForm,
//       totalFinancials: {
//         totalAmountForCompany: totalCompany,
//         totalAmountForVehicle: totalVehicle,
//         totalAmountForSupplier: totalSupplier,
//         profitPerTrip: profit
//       }
//     });
//   };

//   /* ===============================
//       GET VALUE
//   =============================== */
//   const getValue = (field) => {
//     let val;
//     if (field.name.includes(".")) {
//       const [p, k] = field.name.split(".");
//       val = form[p]?.[k];
//     } else {
//       val = form[field.name];
//     }

//     // AGAR VALUE OBJECT HAI (Backend se populated data)
//     if (val && typeof val === "object" && val._id) {
//       return val._id;
//     }

//     return val || "";
//   };

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 max-h-[calc(100vh-250px)] overflow-y-auto px-1 pb-4">
//       {fields.map((field) => {
//         if (field.hidden) return null;
//         const isDisabled = field.disabled || (field.name === "vehicleNumber" && form?._id);

//         return (
//           <div key={field.name} className="flex flex-col space-y-1.5">
//             {/* Label Styling */}
//             <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
//               {field.label} {field.required && <span className="text-red-500">*</span>}
//             </label>

//             {field.type === "select" ? (
//               <div className={`relative ${isDisabled ? 'opacity-70' : ''}`}>
//                 <CommonSelect
//                   name={field.name}
//                   value={getValue(field)}
//                   options={field.options}
//                   onChange={handleChange}
//                   disabled={isDisabled}
//                 />
//               </div>
//             ) : (
//               <input
//                 type={field.type || "text"}
//                 name={field.name}
//                 // 🔥 FIX: Agar type 'file' hai toh 'value' property nahi deni hai
//                 {...(field.type !== "file" ? { value: getValue(field) || "" } : {})}
//                 onChange={handleChange}
//                 disabled={isDisabled}
//                 required={field.required || false}
//                 // File inputs ke liye multiple support agar config mein multiple: true hai
//                 multiple={field.multiple}
//                 placeholder={`Enter ${field.label.toLowerCase()}...`}
//                 className={`w-full px-4 py-3 border rounded-2xl text-sm font-medium outline-none transition-all duration-200
//                   ${isDisabled 
//                     ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed select-none" 
//                     : "bg-white border-gray-200 text-gray-700 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 focus:bg-white"
//                   } ${field.type === "file" ? "cursor-pointer" : ""}`}
//               />
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default CrudForm;

// import React from "react";
// import CommonSelect from "./CommonSelect";

// const CrudForm = ({ form, setForm, fields }) => {

//   /* ===============================
//       HANDLE CHANGE
//   =============================== */
//   // const handleChange = (e) => {
//   //   const { name, value } = e.target;

//   //   if (name.includes(".")) {
//   //     const [parent, key] = name.split(".");
//   //     setForm((prev) => ({
//   //       ...prev,
//   //       [parent]: {
//   //         ...prev[parent],
//   //         [key]: value,
//   //       },
//   //     }));
//   //   } else {
//   //     setForm((prev) => ({
//   //       ...prev,
//   //       [name]: value,
//   //     }));
//   //   }
//   // };

//   // CrudForm.jsx ke andar handleChange ko update karein
//   // const handleChange = (e) => {
//   //   const { name, value } = e.target;
//   //   let updatedForm = {};

//   //   if (name.includes(".")) {
//   //     const [parent, key] = name.split(".");
//   //     updatedForm = {
//   //       ...form,
//   //       [parent]: { ...form[parent], [key]: value },
//   //     };
//   //   } else {
//   //     updatedForm = { ...form, [name]: value };
//   //   }

//   //   console.log("updatedForm=====>", updatedForm)

//   //   // 🔥 AUTO-CALCULATION LOGIC
//   //   const load = Number(updatedForm.totalTonLoad || 0);
//   //   const r = updatedForm.rates || {};
//   //   const f = updatedForm.financials || {};

//   //   const totalCompany = load * Number(r.companyRatePerTon || 0);
//   //   const totalVehicle = load * Number(r.vehicleRatePerTon || 0);
//   //   const totalSupplier = load * Number(r.supplierRatePerTon || 0);
    
//   //   const totalExpenses = 
//   //     Number(f.dieselCost || 0) + 
//   //     Number(f.tollCost || 0) + 
//   //     Number(f.driverExpense || 0) + 
//   //     Number(f.otherExpense || 0);

//   //   const profit = totalCompany - totalVehicle - totalExpenses;

//   //   // Form state update with calculated values
//   //   setForm({
//   //     ...updatedForm,
//   //     totalFinancials: {
//   //       totalAmountForCompany: totalCompany,
//   //       totalAmountForVehicle: totalVehicle,
//   //       totalAmountForSupplier: totalSupplier,
//   //       profitPerTrip: profit
//   //     }
//   //   });
//   // };

//   const handleChange = (e) => {
//     const { name, value, type, files } = e.target; // 🔥 Added 'type' and 'files'
//     let updatedForm = {};

//     // 1. Identify Value (Standard vs File)
//     // Agar file input hai toh files array lo, warna normal value
//     let finalValue = type === "file" ? Array.from(files) : value;

//     // 2. Nested Object Logic (Don't break this)
//     if (name.includes(".")) {
//       const [parent, key] = name.split(".");
//       updatedForm = {
//         ...form,
//         [parent]: { 
//           ...(form[parent] || {}), // Safety for undefined parents
//           [key]: finalValue 
//         },
//       };
//     } else {
//       updatedForm = { ...form, [name]: finalValue };
//     }

//     // console.log("updatedForm=====>", updatedForm);

//     // 3. AUTO-CALCULATION LOGIC (Maintaining your exact logic)
//     const load = Number(updatedForm.totalTonLoad || 0);
//     const r = updatedForm.rates || {};
//     const f = updatedForm.financials || {};

//     const totalCompany = load * Number(r.companyRatePerTon || 0);
//     const totalVehicle = load * Number(r.vehicleRatePerTon || 0);
//     const totalSupplier = load * Number(r.supplierRatePerTon || 0);
    
//     const totalExpenses = 
//       Number(f.dieselCost || 0) + 
//       Number(f.tollCost || 0) + 
//       Number(f.driverExpense || 0) + 
//       Number(f.otherExpense || 0);

//     const profit = totalCompany - totalVehicle - totalExpenses;

//     // 4. Final State Update
//     setForm({
//       ...updatedForm,
//       totalFinancials: {
//         totalAmountForCompany: totalCompany,
//         totalAmountForVehicle: totalVehicle,
//         totalAmountForSupplier: totalSupplier,
//         profitPerTrip: profit
//       }
//     });
//   };
//   /* ===============================
//       GET VALUE
//   =============================== */
//   const getValue = (field) => {
//     let val;
//     if (field.name.includes(".")) {
//       const [p, k] = field.name.split(".");
//       val = form[p]?.[k];
//     } else {
//       val = form[field.name];
//     }

//     // AGAR VALUE OBJECT HAI (Backend se populated data)
//     if (val && typeof val === "object" && val._id) {
//       return val._id;
//     }

//     return val || "";
//   };

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 max-h-[calc(100vh-250px)] overflow-y-auto px-1 pb-4">
//       {fields.map((field) => {
//         if (field.hidden) return null;
//         const isDisabled = field.disabled || (field.name === "vehicleNumber" && form?._id);

//         return (
//           <div key={field.name} className="flex flex-col space-y-1.5">
//             {/* Label Styling */}
//             <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
//               {field.label} {field.required && <span className="text-red-500">*</span>}
//             </label>

//             {field.type === "select" ? (
//               <div className={`relative ${isDisabled ? 'opacity-70' : ''}`}>
//                 <CommonSelect
//                   name={field.name}
//                   value={getValue(field)}
//                   options={field.options}
//                   onChange={handleChange}
//                   disabled={isDisabled}
//                   // Note: Ensure CommonSelect also accepts className for consistent styling
//                 />
//               </div>
//             ) : (
//               <input
//                 type={field.type || "text"}
//                 name={field.name}
//                 value={getValue(field) || ""}
//                 onChange={handleChange}
//                 disabled={isDisabled}
//                 required={field.required || false}
//                 placeholder={`Enter ${field.label.toLowerCase()}...`}
//                 className={`w-full px-4 py-3 border rounded-2xl text-sm font-medium outline-none transition-all duration-200
//                   ${isDisabled 
//                     ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed select-none" 
//                     : "bg-white border-gray-200 text-gray-700 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 focus:bg-white"
//                   }`}
//               />
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default CrudForm;