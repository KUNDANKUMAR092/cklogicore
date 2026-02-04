// CrudForm.jsx

import React, { useState } from "react";
import CommonSelect from "./CommonSelect";
import ChallanThumbnail from "./ChallanThumbnail";

const CrudForm = ({ form, setForm, fields, onRemoveChallan }) => {
  const [errors, setErrors] = useState({});

  /* ===============================
      VALIDATION LOGIC
  =============================== */
  const validate = (name, value, validationType, required) => {
    if (required && (!value || value === "")) return "This field is required";
    if (!value) return "";

    switch (validationType) {
      case "name":
        if (!/^[a-zA-Z\s]{2,}/.test(value)) return "Must start with 2+ letters";
        break;
      case "mobile":
        if (!/^\d{10}$/.test(value)) return "Must be exactly 10 digits";
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email address";
        break;
      case "gst":
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstRegex.test(value)) return "GST Format is 22AAAAA0000A1Z5";
        break;
      case "pan":
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(value)) return "PAN Format is ABCDE1234F";
        break;
      case "vehicle":
        if (!/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/.test(value.replace(/\s/g, ""))) 
          return "Format: MH12AB1234";
        break;
      case "positiveNumber":
        if (parseFloat(value) < 0) return "Negative value not allowed";
        break;
      default:
        return "";
    }
    return "";
  };

  /* ===============================
      HANDLE CHANGE (With Input Restrictions)
  =============================== */
  const handleChange = (e, validationType) => {
    const { name, value, type, files } = e.target;

    // 1. Immediate Input Blockers
    if (type === "number" && value < 0) return; 
    if (validationType === "mobile" && value !== "" && !/^\d+$/.test(value)) return;

    let finalValue;
    if (type === "file") {
      const newSelectedFiles = Array.from(files);
      const existingChallans = Array.isArray(form.challans) ? form.challans : [];
      if (existingChallans.length + newSelectedFiles.length > 4) {
        alert("Maximum 4 challans allowed");
        return;
      }
      finalValue = [...existingChallans, ...newSelectedFiles];
    } else {
      finalValue = value;
    }

    // 2. Update Form State (Nested Support)
    let updatedForm = { ...form }; // Shallow copy
    if (name.includes(".")) {
      const [parent, key] = name.split(".");
      updatedForm = {
        ...updatedForm,
        [parent]: { ...(updatedForm[parent] || {}), [key]: finalValue },
      };
    } else {
      updatedForm = { ...updatedForm, [name]: finalValue };
    }

    // 3. TRIP CALCULATION LOGIC (Sirf tab chalega jab Trip se related fields change hon)
    // Ye check ensures ki Supplier/Company forms break na hon
    const isTripField = name === "totalTonLoad" || name.startsWith("rates.") || name.startsWith("financials.");

    if (isTripField) {
      const load = Number(updatedForm.totalTonLoad || 0);
      const r = updatedForm.rates || {};
      const f = updatedForm.financials || {};

      // Basic Totals
      const companyGross = load * Number(r.companyRatePerTon || 0);
      const supplierGross = load * Number(r.supplierRatePerTon || 0);
      const vehicleGross = load * Number(r.vehicleRatePerTon || 0);
      
      // Expense Sums
      const companyExpTotal = 
        Number(f.companyAdvance || 0) + Number(f.companyDiesel || 0) + 
        Number(f.companyTollCost || 0) + Number(f.companyDriverExpense || 0) + 
        Number(f.companyOtherExpense || 0);

      const supplierExpTotal = 
        Number(f.supplierAdvance || 0) + Number(f.supplierDiesel || 0) + 
        Number(f.supplierTollCost || 0) + Number(f.supplierDriverExpense || 0) + 
        Number(f.supplierOtherExpense || 0);

      const vehicleExpTotal = companyExpTotal + supplierExpTotal;

      // Profit and Pendings
      const profit = companyGross - vehicleGross;
      const companyPending = companyGross - companyExpTotal;
      const supplierPending = supplierGross - supplierExpTotal;
      const vehiclePending = vehicleGross - vehicleExpTotal;

      // Calculated object update
      updatedForm.calculated = {
        companyGrossAmount: companyGross,
        supplierGrossAmount: supplierGross,
        vehicleGrossAmount: vehicleGross,
        companyTotalExpense: companyExpTotal,
        supplierTotalExpense: supplierExpTotal,
        vehicleTotalExpense: vehicleExpTotal,
        companyPendingAmount: companyPending,
        supplierPendingAmount: supplierPending,
        vehiclePendingAmount: vehiclePending,
        tripProfit: profit
      };
    }

    // Clear error on change
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));

    setForm(updatedForm);
  };
  // const handleChange = (e, validationType) => {
  //   const { name, value, type, files } = e.target;
    
  //   // 1. Immediate Input Blockers
  //   if (type === "number" && value < 0) return; // Prevent negative typing
  //   if (validationType === "mobile" && value !== "" && !/^\d+$/.test(value)) return; // Only numbers in mobile

  //   let finalValue;
  //   if (type === "file") {
  //     const newSelectedFiles = Array.from(files);
  //     const existingChallans = Array.isArray(form.challans) ? form.challans : [];
  //     if (existingChallans.length + newSelectedFiles.length > 4) {
  //       alert("Maximum 4 challans allowed");
  //       return;
  //     }
  //     finalValue = [...existingChallans, ...newSelectedFiles];
  //   } else {
  //     finalValue = value;
  //   }

  //   // Update Form State (Nested Support)
  //   let updatedForm = {};
  //   if (name.includes(".")) {
  //     const [parent, key] = name.split(".");
  //     updatedForm = {
  //       ...form,
  //       [parent]: { ...(form[parent] || {}), [key]: finalValue },
  //     };
  //   } else {
  //     updatedForm = { ...form, [name]: finalValue };
  //   }

  //   // Auto-Calculation Logic (Preserved)
  //   const load = Number(updatedForm.totalTonLoad || 0);
  //   const r = updatedForm.rates || {};
  //   const f = updatedForm.financials || {};

  //   const totalCompany = load * Number(r.companyRatePerTon || 0);
  //   const totalVehicle = load * Number(r.vehicleRatePerTon || 0);
  //   const totalSupplier = load * Number(r.supplierRatePerTon || 0);
    
  //   const totalExpenses = 
  //     Number(f.companyDiesel || 0) + 
  //     Number(f.companyTollCost || 0) + 
  //     Number(f.companyDriverExpense || 0) + 
  //     Number(f.companyOtherExpense || 0);

  //   const profit = totalCompany - totalVehicle - totalExpenses;

  //   // Clear error on change if it becomes valid
  //   if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));

  //   setForm({
  //     ...updatedForm,
  //     totalFinancials: {
  //       totalAmountForCompany: totalCompany,
  //       totalAmountForVehicle: totalVehicle,
  //       totalAmountForSupplier: totalSupplier,
  //       profitPerTrip: profit
  //     }
  //   });
  // };

  const handleBlur = (e, validationType, required) => {
    const { name, value } = e.target;
    const errorMsg = validate(name, value, validationType, required);
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleWheel = (e) => {
    if (e.target.type === "number") e.target.blur(); // Scroll prevent
  };

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

  const removeNewlySelectedFile = (indexToRemove) => {
    const updatedChallans = form.challans.filter((_, index) => index !== indexToRemove);
    setForm({ ...form, challans: updatedChallans });
  };

  return (
    <div className="flex flex-col space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto px-1 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        {fields.map((field) => {
          if (field.hidden) return null;
          const isDisabled = field.disabled || (field.name === "vehicleNumber" && form?._id);
          const error = errors[field.name];

          return (
            <div key={field.name} className="flex flex-col space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>

              {field.type === "select" ? (
                <div className={`${isDisabled ? 'opacity-70' : ''}`}>
                  <CommonSelect
                    name={field.name}
                    value={getValue(field)}
                    options={field.options}
                    onChange={(e) => handleChange(e, field.validationType)}
                    onBlur={(e) => handleBlur(e, field.validationType, field.required)}
                    disabled={isDisabled}
                  />
                </div>
              ) : (
                <input
                  type={field.type || "text"}
                  name={field.name}
                  {...(field.type !== "file" ? { value: getValue(field) || "" } : {})}
                  onChange={(e) => handleChange(e, field.validationType)}
                  onBlur={(e) => handleBlur(e, field.validationType, field.required)}
                  onWheel={handleWheel}
                  disabled={isDisabled}
                  required={field.required}
                  multiple={field.multiple}
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  className={`w-full px-4 py-3 border rounded-2xl text-sm font-medium outline-none transition-all duration-200
                    ${error ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"}
                    ${isDisabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}
                  `}
                />
              )}
              {error && (
                <span className="text-[10px] text-red-500 font-bold ml-2 italic">
                  {error}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {form.challans && form.challans.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
            Uploaded Documents ({form.challans.length}/4)
          </p>
          <div className="flex flex-wrap gap-4">
            {form.challans.map((file, index) => (
              <ChallanThumbnail
                key={file._id || index}
                file={file}
                tripId={form._id}
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
// import ChallanThumbnail from "./ChallanThumbnail"; // 🔥 New Component Import

// const CrudForm = ({ form, setForm, fields, onRemoveChallan }) => {

//   /* ===============================
//       HANDLE CHANGE
//   =============================== */
//   const handleChange = (e) => {
//     const { name, value, type, files } = e.target;
//     let updatedForm = {};

//     // 🔥 Identify Value: File inputs ke liye existing files + new files merge karein
//     let finalValue;
//     if (type === "file") {
//       const newSelectedFiles = Array.from(files);
//       const existingChallans = Array.isArray(form.challans) ? form.challans : [];
      
//       // Limit check (frontend level safety)
//       if (existingChallans.length + newSelectedFiles.length > 4) {
//         alert("Maximum 4 challans allowed");
//         return;
//       }
//       finalValue = [...existingChallans, ...newSelectedFiles];
//     } else {
//       finalValue = value;
//     }

//     // 1. Nested Object Logic (Preserved)
//     if (name.includes(".")) {
//       const [parent, key] = name.split(".");
//       updatedForm = {
//         ...form,
//         [parent]: { ...(form[parent] || {}), [key]: finalValue },
//       };
//     } else {
//       updatedForm = { ...form, [name]: finalValue };
//     }

//     // 2. AUTO-CALCULATION LOGIC (Exact same as your original)
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
//       LOCAL REMOVE (For newly selected files only)
//   =============================== */
//   const removeNewlySelectedFile = (indexToRemove) => {
//     const updatedChallans = form.challans.filter((_, index) => index !== indexToRemove);
//     setForm({ ...form, challans: updatedChallans });
//   };

//   /* ===============================
//       GET VALUE (Preserved)
//   =============================== */
//   const getValue = (field) => {
//     let val;
//     if (field.name.includes(".")) {
//       const [p, k] = field.name.split(".");
//       val = form[p]?.[k];
//     } else {
//       val = form[field.name];
//     }
//     if (val && typeof val === "object" && val._id) return val._id;
//     return val || "";
//   };

//   return (
//     <div className="flex flex-col space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto px-1 pb-4">
//       {/* 1. Main Form Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
//         {fields.map((field) => {
//           if (field.hidden) return null;
//           const isDisabled = field.disabled || (field.name === "vehicleNumber" && form?._id);

//           return (
//             <div key={field.name} className="flex flex-col space-y-1.5">
//               <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
//                 {field.label} {field.required && <span className="text-red-500">*</span>}
//               </label>

//               {field.type === "select" ? (
//                 <div className={`relative ${isDisabled ? 'opacity-70' : ''}`}>
//                   <CommonSelect
//                     name={field.name}
//                     value={getValue(field)}
//                     options={field.options}
//                     onChange={handleChange}
//                     disabled={isDisabled}
//                   />
//                 </div>
//               ) : (
//                 <input
//                   type={field.type || "text"}
//                   name={field.name}
//                   {...(field.type !== "file" ? { value: getValue(field) || "" } : {})}
//                   onChange={handleChange}
//                   disabled={isDisabled}
//                   required={field.required || false}
//                   multiple={field.multiple}
//                   placeholder={`Enter ${field.label.toLowerCase()}...`}
//                   className={`w-full px-4 py-3 border rounded-2xl text-sm font-medium outline-none transition-all duration-200
//                     ${isDisabled 
//                       ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed select-none" 
//                       : "bg-white border-gray-200 text-gray-700 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 focus:bg-white"
//                     } ${field.type === "file" ? "cursor-pointer" : ""}`}
//                 />
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* 2. 🔥 CHALLAN PREVIEW SECTION (Always visible if files exist) */}
//       {form.challans && form.challans.length > 0 && (
//         <div className="mt-4 p-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
//           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
//             Uploaded Documents ({form.challans.length}/4)
//           </p>
//           <div className="flex flex-wrap gap-4">
//             {form.challans.map((file, index) => (
//               <ChallanThumbnail
//                 key={file._id || index}
//                 file={file}
//                 tripId={form._id}
//                 // Yahan setForm pass ho raha hai takki delete ke baad local state update ho jaye
//                 onDelete={file._id ? (tId, cId) => onRemoveChallan(tId, cId, setForm) : () => removeNewlySelectedFile(index)}
//               />
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CrudForm;