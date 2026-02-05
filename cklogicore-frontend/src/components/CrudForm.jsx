// CrudForm.jsx


import React, { useState, useEffect } from "react";
import CommonSelect from "./CommonSelect";
import ChallanThumbnail from "./ChallanThumbnail";

const CrudForm = ({ form, setForm, fields, onRemoveChallan }) => {
  const [errors, setErrors] = useState({});
  const [showCompanyFinancials, setShowCompanyFinancials] = useState(false);

  // Initialize for Edit Mode (Cklogicore specific)
  useEffect(() => {
    if (form?.financials) {
      const f = form.financials;
      const hasValues = !!(
        f.companyAdvance || 
        f.companyDiesel || 
        f.companyTollCost || 
        f.companyDriverExpense || 
        f.companyOtherExpense
      );
      setShowCompanyFinancials(hasValues);
    }
  }, [form._id]);

  /* ===============================
      CALCULATION HELPER (Safe for all)
  =============================== */
  const updateTripCalculations = (currentForm) => {
    // Agar calculation fields nahi hain (like in Supplier form), to skip karein
    if (!currentForm.totalTonLoad && !currentForm.rates) return currentForm;

    const load = Number(currentForm.totalTonLoad || 0);
    const r = currentForm.rates || {};
    const f = currentForm.financials || {};

    const companyGross = load * Number(r.companyRatePerTon || 0);
    const supplierGross = load * Number(r.supplierRatePerTon || 0);
    const vehicleGross = load * Number(r.vehicleRatePerTon || 0);
    
    const companyExpTotal = 
      Number(f.companyAdvance || 0) + Number(f.companyDiesel || 0) + 
      Number(f.companyTollCost || 0) + Number(f.companyDriverExpense || 0) + 
      Number(f.companyOtherExpense || 0);

    const supplierExpTotal = 
      Number(f.supplierAdvance || 0) + Number(f.supplierDiesel || 0) + 
      Number(f.supplierTollCost || 0) + Number(f.supplierDriverExpense || 0) + 
      Number(f.supplierOtherExpense || 0);

    const vehicleExpTotal = companyExpTotal + supplierExpTotal;

    return {
      ...currentForm,
      calculated: {
        ...currentForm.calculated,
        companyGrossAmount: companyGross,
        supplierGrossAmount: supplierGross,
        vehicleGrossAmount: vehicleGross,
        companyTotalExpense: companyExpTotal,
        supplierTotalExpense: supplierExpTotal,
        vehicleTotalExpense: vehicleExpTotal,
        companyPendingAmount: companyGross - companyExpTotal,
        supplierPendingAmount: supplierGross - supplierExpTotal,
        vehiclePendingAmount: vehicleGross - vehicleExpTotal,
        tripProfit: companyGross - vehicleGross
      }
    };
  };

  /* ===============================
      HANDLERS
  =============================== */
  const handleToggleFinancials = (e) => {
    const isChecked = e.target.checked;
    setShowCompanyFinancials(isChecked);

    if (!isChecked) {
      setForm((prev) => {
        const resetFinancials = {
          ...prev.financials,
          companyAdvance: 0,
          companyDiesel: 0,
          companyTollCost: 0,
          companyDriverExpense: 0,
          companyOtherExpense: 0,
        };
        // Reset karke calculation update karein
        return updateTripCalculations({ ...prev, financials: resetFinancials });
      });
    }
  };

  const handleChange = (e, validationType) => {
    const { name, value, type, files } = e.target;

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

    let updatedForm = { ...form };
    if (name.includes(".")) {
      const [parent, key] = name.split(".");
      updatedForm = {
        ...updatedForm,
        [parent]: { ...(updatedForm[parent] || {}), [key]: finalValue },
      };
    } else {
      updatedForm = { ...updatedForm, [name]: finalValue };
    }

    // Only update calculations if relevant fields change
    const isCalculationField = name === "totalTonLoad" || name.startsWith("rates.") || name.startsWith("financials.");
    if (isCalculationField) {
      updatedForm = updateTripCalculations(updatedForm);
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    setForm(updatedForm);
  };

  const handleBlur = (e, validationType, required) => {
    const { name, value } = e.target;
    // Basic required check
    if (required && (!value || value === "")) {
      setErrors(prev => ({ ...prev, [name]: "This field is required" }));
      return;
    }
    // Form specific validation logic (same as your previous code)
    // ... validation logic yahan add kar sakte hain (name, mobile, gst etc.)
  };

  const handleWheel = (e) => {
    if (e.target.type === "number") e.target.blur();
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

  return (
    <div className="flex flex-col space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto px-1 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        {fields.map((field) => {
          if (field.hidden) return null;

          // 🟢 SAFE CHECK: Logic for toggle only for company financials
          if (field.name.startsWith("financials.company") && !showCompanyFinancials) {
            return null;
          }

          const isDisabled = field.disabled || (field.name === "vehicleNumber" && form?._id);
          const error = errors[field.name];

          const fieldBody = (
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
              {error && <span className="text-[10px] text-red-500 font-bold ml-2 italic">{error}</span>}
            </div>
          );

          // 🟢 LOGIC: Supplier end hone ke baad hi Checkbox dikhega
          if (field.name === "financials.supplierOtherExpense") {
            return (
              <React.Fragment key="wrapper-company-toggle">
                {fieldBody}
                <div className="col-span-1 md:col-span-2 flex justify-end items-center mt-2 mb-1">
                   <div className="flex items-center space-x-2 bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100">
                      <input 
                        type="checkbox" 
                        id="toggleCompany" 
                        checked={showCompanyFinancials} 
                        onChange={handleToggleFinancials}
                        className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                      />
                      <label htmlFor="toggleCompany" className="text-[10px] font-black text-blue-700 cursor-pointer uppercase tracking-tight">
                        Add Company Expenses?
                      </label>
                   </div>
                </div>
              </React.Fragment>
            );
          }

          return fieldBody;
        })}
      </div>

      {/* Challans Rendering */}
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
                onDelete={file._id ? (tId, cId) => onRemoveChallan(tId, cId, setForm) : () => {
                  const updated = form.challans.filter((_, idx) => idx !== index);
                  setForm({ ...form, challans: updated });
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CrudForm;




// import React, { useState, useEffect } from "react";
// import CommonSelect from "./CommonSelect";
// import ChallanThumbnail from "./ChallanThumbnail";

// const CrudForm = ({ form, setForm, fields, onRemoveChallan }) => {
//   const [errors, setErrors] = useState({});

//   // 1. Local state for Company Financials Toggle
//   const [showCompanyFinancials, setShowCompanyFinancials] = useState(false);

//   // 2. Initialize checkbox state on mount (for Edit mode)
//   useEffect(() => {
//     const f = form.financials || {};
//     const hasValues = !!(
//       f.companyAdvance || 
//       f.companyDiesel || 
//       f.companyTollCost || 
//       f.companyDriverExpense || 
//       f.companyOtherExpense
//     );
//     setShowCompanyFinancials(hasValues);
//   }, [form._id]); // Sirf tab chale jab edit data load ho

//   /* ===============================
//       CALCULATION HELPER
//   =============================== */
//   const updateTripCalculations = (currentForm) => {
//     const load = Number(currentForm.totalTonLoad || 0);
//     const r = currentForm.rates || {};
//     const f = currentForm.financials || {};

//     const companyGross = load * Number(r.companyRatePerTon || 0);
//     const supplierGross = load * Number(r.supplierRatePerTon || 0);
//     const vehicleGross = load * Number(r.vehicleRatePerTon || 0);
    
//     const companyExpTotal = 
//       Number(f.companyAdvance || 0) + Number(f.companyDiesel || 0) + 
//       Number(f.companyTollCost || 0) + Number(f.companyDriverExpense || 0) + 
//       Number(f.companyOtherExpense || 0);

//     const supplierExpTotal = 
//       Number(f.supplierAdvance || 0) + Number(f.supplierDiesel || 0) + 
//       Number(f.supplierTollCost || 0) + Number(f.supplierDriverExpense || 0) + 
//       Number(f.supplierOtherExpense || 0);

//     const vehicleExpTotal = companyExpTotal + supplierExpTotal;

//     return {
//       ...currentForm,
//       calculated: {
//         ...currentForm.calculated,
//         companyGrossAmount: companyGross,
//         supplierGrossAmount: supplierGross,
//         vehicleGrossAmount: vehicleGross,
//         companyTotalExpense: companyExpTotal,
//         supplierTotalExpense: supplierExpTotal,
//         vehicleTotalExpense: vehicleExpTotal,
//         companyPendingAmount: companyGross - companyExpTotal,
//         supplierPendingAmount: supplierGross - supplierExpTotal,
//         vehiclePendingAmount: vehicleGross - vehicleExpTotal,
//         tripProfit: companyGross - vehicleGross
//       }
//     };
//   };

//   /* ===============================
//       TOGGLE HANDLER (Checkbox)
//   =============================== */
//   const handleToggleFinancials = (e) => {
//     const isChecked = e.target.checked;
//     setShowCompanyFinancials(isChecked);

//     if (!isChecked) {
//       // Jab uncheck ho, to values zero set karein aur calculation update karein
//       setForm((prev) => {
//         const resetFinancials = {
//           ...prev.financials,
//           companyAdvance: 0,
//           companyDiesel: 0,
//           companyTollCost: 0,
//           companyDriverExpense: 0,
//           companyOtherExpense: 0,
//         };
//         return updateTripCalculations({ ...prev, financials: resetFinancials });
//       });
//     }
//   };

//   /* ===============================
//       VALIDATION LOGIC
//   =============================== */
//   const validate = (name, value, validationType, required) => {
//     if (required && (!value || value === "")) return "This field is required";
//     if (!value) return "";

//     switch (validationType) {
//       case "name":
//         if (!/^[a-zA-Z\s]{2,}/.test(value)) return "Must start with 2+ letters";
//         break;
//       case "mobile":
//         if (!/^\d{10}$/.test(value)) return "Must be exactly 10 digits";
//         break;
//       case "email":
//         if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email address";
//         break;
//       case "gst":
//         const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
//         if (!gstRegex.test(value)) return "GST Format is 22AAAAA0000A1Z5";
//         break;
//       case "pan":
//         const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
//         if (!panRegex.test(value)) return "PAN Format is ABCDE1234F";
//         break;
//       case "vehicle":
//         if (!/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/.test(value.replace(/\s/g, ""))) 
//           return "Format: MH12AB1234";
//         break;
//       case "positiveNumber":
//         if (parseFloat(value) < 0) return "Negative value not allowed";
//         break;
//       default:
//         return "";
//     }
//     return "";
//   };

//   /* ===============================
//       HANDLE CHANGE
//   =============================== */
//   const handleChange = (e, validationType) => {
//     const { name, value, type, files } = e.target;

//     if (type === "number" && value < 0) return; 
//     if (validationType === "mobile" && value !== "" && !/^\d+$/.test(value)) return;

//     let finalValue;
//     if (type === "file") {
//       const newSelectedFiles = Array.from(files);
//       const existingChallans = Array.isArray(form.challans) ? form.challans : [];
//       if (existingChallans.length + newSelectedFiles.length > 4) {
//         alert("Maximum 4 challans allowed");
//         return;
//       }
//       finalValue = [...existingChallans, ...newSelectedFiles];
//     } else {
//       finalValue = value;
//     }

//     let updatedForm = { ...form };
//     if (name.includes(".")) {
//       const [parent, key] = name.split(".");
//       updatedForm = {
//         ...updatedForm,
//         [parent]: { ...(updatedForm[parent] || {}), [key]: finalValue },
//       };
//     } else {
//       updatedForm = { ...updatedForm, [name]: finalValue };
//     }

//     // Identify if it's a Trip field for calculation
//     const isTripField = name === "totalTonLoad" || name.startsWith("rates.") || name.startsWith("financials.");

//     if (isTripField) {
//       updatedForm = updateTripCalculations(updatedForm);
//     }

//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
//     setForm(updatedForm);
//   };

//   const handleBlur = (e, validationType, required) => {
//     const { name, value } = e.target;
//     const errorMsg = validate(name, value, validationType, required);
//     setErrors(prev => ({ ...prev, [name]: errorMsg }));
//   };

//   const handleWheel = (e) => {
//     if (e.target.type === "number") e.target.blur();
//   };

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

//   const removeNewlySelectedFile = (indexToRemove) => {
//     const updatedChallans = form.challans.filter((_, index) => index !== indexToRemove);
//     setForm({ ...form, challans: updatedChallans });
//   };

//   return (
//     <div className="flex flex-col space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto px-1 pb-4">
      
//       {/* 🟢 CONDITIONAL CHECKBOX FOR COMPANY FINANCIALS */}
//       {fields.some(f => f.name.startsWith("financials.company")) && (
//         <div className="flex items-center space-x-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mx-1">
//           <input 
//             type="checkbox" 
//             id="toggleCompanyExp"
//             checked={showCompanyFinancials}
//             onChange={handleToggleFinancials}
//             className="w-5 h-5 accent-blue-600 cursor-pointer"
//           />
//           <label htmlFor="toggleCompanyExp" className="text-sm font-bold text-blue-800 cursor-pointer select-none">
//             Include Company Expenses (Advance, Diesel, Toll, etc.)
//           </label>
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
//         {fields.map((field) => {
//           if (field.hidden) return null;
          
//           // 🟢 CONDITIONAL RENDERING: Hide specific company fields if checkbox is false
//           if (field.name.startsWith("financials.company") && !showCompanyFinancials) {
//             return null;
//           }

//           const isDisabled = field.disabled || (field.name === "vehicleNumber" && form?._id);
//           const error = errors[field.name];

//           return (
//             <div key={field.name} className="flex flex-col space-y-1.5">
//               <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
//                 {field.label} {field.required && <span className="text-red-500">*</span>}
//               </label>

//               {field.type === "select" ? (
//                 <div className={`${isDisabled ? 'opacity-70' : ''}`}>
//                   <CommonSelect
//                     name={field.name}
//                     value={getValue(field)}
//                     options={field.options}
//                     onChange={(e) => handleChange(e, field.validationType)}
//                     onBlur={(e) => handleBlur(e, field.validationType, field.required)}
//                     disabled={isDisabled}
//                   />
//                 </div>
//               ) : (
//                 <input
//                   type={field.type || "text"}
//                   name={field.name}
//                   {...(field.type !== "file" ? { value: getValue(field) || "" } : {})}
//                   onChange={(e) => handleChange(e, field.validationType)}
//                   onBlur={(e) => handleBlur(e, field.validationType, field.required)}
//                   onWheel={handleWheel}
//                   disabled={isDisabled}
//                   required={field.required}
//                   multiple={field.multiple}
//                   placeholder={`Enter ${field.label.toLowerCase()}...`}
//                   className={`w-full px-4 py-3 border rounded-2xl text-sm font-medium outline-none transition-all duration-200
//                     ${error ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"}
//                     ${isDisabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}
//                   `}
//                 />
//               )}
//               {error && <span className="text-[10px] text-red-500 font-bold ml-2 italic">{error}</span>}
//             </div>
//           );
//         })}
//       </div>

//       {form.challans && form.challans.length > 0 && (
//         <div className="mt-4 p-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
//           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
//             Uploaded Documents ({form.challans.length}/4)
//           </p>
//           <div className="flex flex-wrap gap-4">
//             {form.challans.map((file, index) => (
//               <ChallanThumbnail
//                 key={file._id || index}
//                 file={file}
//                 tripId={form._id}
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

// import React, { useState } from "react";
// import CommonSelect from "./CommonSelect";
// import ChallanThumbnail from "./ChallanThumbnail";

// const CrudForm = ({ form, setForm, fields, onRemoveChallan }) => {
//   const [errors, setErrors] = useState({});

//   /* ===============================
//       VALIDATION LOGIC
//   =============================== */
//   const validate = (name, value, validationType, required) => {
//     if (required && (!value || value === "")) return "This field is required";
//     if (!value) return "";

//     switch (validationType) {
//       case "name":
//         if (!/^[a-zA-Z\s]{2,}/.test(value)) return "Must start with 2+ letters";
//         break;
//       case "mobile":
//         if (!/^\d{10}$/.test(value)) return "Must be exactly 10 digits";
//         break;
//       case "email":
//         if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email address";
//         break;
//       case "gst":
//         const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
//         if (!gstRegex.test(value)) return "GST Format is 22AAAAA0000A1Z5";
//         break;
//       case "pan":
//         const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
//         if (!panRegex.test(value)) return "PAN Format is ABCDE1234F";
//         break;
//       case "vehicle":
//         if (!/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/.test(value.replace(/\s/g, ""))) 
//           return "Format: MH12AB1234";
//         break;
//       case "positiveNumber":
//         if (parseFloat(value) < 0) return "Negative value not allowed";
//         break;
//       default:
//         return "";
//     }
//     return "";
//   };

//   /* ===============================
//       HANDLE CHANGE (With Input Restrictions)
//   =============================== */
//   const handleChange = (e, validationType) => {
//     const { name, value, type, files } = e.target;

//     // 1. Immediate Input Blockers
//     if (type === "number" && value < 0) return; 
//     if (validationType === "mobile" && value !== "" && !/^\d+$/.test(value)) return;

//     let finalValue;
//     if (type === "file") {
//       const newSelectedFiles = Array.from(files);
//       const existingChallans = Array.isArray(form.challans) ? form.challans : [];
//       if (existingChallans.length + newSelectedFiles.length > 4) {
//         alert("Maximum 4 challans allowed");
//         return;
//       }
//       finalValue = [...existingChallans, ...newSelectedFiles];
//     } else {
//       finalValue = value;
//     }

//     // 2. Update Form State (Nested Support)
//     let updatedForm = { ...form }; // Shallow copy
//     if (name.includes(".")) {
//       const [parent, key] = name.split(".");
//       updatedForm = {
//         ...updatedForm,
//         [parent]: { ...(updatedForm[parent] || {}), [key]: finalValue },
//       };
//     } else {
//       updatedForm = { ...updatedForm, [name]: finalValue };
//     }

//     // 3. TRIP CALCULATION LOGIC (Sirf tab chalega jab Trip se related fields change hon)
//     // Ye check ensures ki Supplier/Company forms break na hon
//     const isTripField = name === "totalTonLoad" || name.startsWith("rates.") || name.startsWith("financials.");

//     if (isTripField) {
//       const load = Number(updatedForm.totalTonLoad || 0);
//       const r = updatedForm.rates || {};
//       const f = updatedForm.financials || {};

//       // Basic Totals
//       const companyGross = load * Number(r.companyRatePerTon || 0);
//       const supplierGross = load * Number(r.supplierRatePerTon || 0);
//       const vehicleGross = load * Number(r.vehicleRatePerTon || 0);
      
//       // Expense Sums
//       const companyExpTotal = 
//         Number(f.companyAdvance || 0) + Number(f.companyDiesel || 0) + 
//         Number(f.companyTollCost || 0) + Number(f.companyDriverExpense || 0) + 
//         Number(f.companyOtherExpense || 0);

//       const supplierExpTotal = 
//         Number(f.supplierAdvance || 0) + Number(f.supplierDiesel || 0) + 
//         Number(f.supplierTollCost || 0) + Number(f.supplierDriverExpense || 0) + 
//         Number(f.supplierOtherExpense || 0);

//       const vehicleExpTotal = companyExpTotal + supplierExpTotal;

//       // Profit and Pendings
//       const profit = companyGross - vehicleGross;
//       const companyPending = companyGross - companyExpTotal;
//       const supplierPending = supplierGross - supplierExpTotal;
//       const vehiclePending = vehicleGross - vehicleExpTotal;

//       // Calculated object update
//       updatedForm.calculated = {
//         companyGrossAmount: companyGross,
//         supplierGrossAmount: supplierGross,
//         vehicleGrossAmount: vehicleGross,
//         companyTotalExpense: companyExpTotal,
//         supplierTotalExpense: supplierExpTotal,
//         vehicleTotalExpense: vehicleExpTotal,
//         companyPendingAmount: companyPending,
//         supplierPendingAmount: supplierPending,
//         vehiclePendingAmount: vehiclePending,
//         tripProfit: profit
//       };
//     }

//     // Clear error on change
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));

//     setForm(updatedForm);
//   };

//   const handleBlur = (e, validationType, required) => {
//     const { name, value } = e.target;
//     const errorMsg = validate(name, value, validationType, required);
//     setErrors(prev => ({ ...prev, [name]: errorMsg }));
//   };

//   const handleWheel = (e) => {
//     if (e.target.type === "number") e.target.blur(); // Scroll prevent
//   };

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

//   const removeNewlySelectedFile = (indexToRemove) => {
//     const updatedChallans = form.challans.filter((_, index) => index !== indexToRemove);
//     setForm({ ...form, challans: updatedChallans });
//   };

//   return (
//     <div className="flex flex-col space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto px-1 pb-4">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
//         {fields.map((field) => {
//           if (field.hidden) return null;
//           const isDisabled = field.disabled || (field.name === "vehicleNumber" && form?._id);
//           const error = errors[field.name];

//           return (
//             <div key={field.name} className="flex flex-col space-y-1.5">
//               <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
//                 {field.label} {field.required && <span className="text-red-500">*</span>}
//               </label>

//               {field.type === "select" ? (
//                 <div className={`${isDisabled ? 'opacity-70' : ''}`}>
//                   <CommonSelect
//                     name={field.name}
//                     value={getValue(field)}
//                     options={field.options}
//                     onChange={(e) => handleChange(e, field.validationType)}
//                     onBlur={(e) => handleBlur(e, field.validationType, field.required)}
//                     disabled={isDisabled}
//                   />
//                 </div>
//               ) : (
//                 <input
//                   type={field.type || "text"}
//                   name={field.name}
//                   {...(field.type !== "file" ? { value: getValue(field) || "" } : {})}
//                   onChange={(e) => handleChange(e, field.validationType)}
//                   onBlur={(e) => handleBlur(e, field.validationType, field.required)}
//                   onWheel={handleWheel}
//                   disabled={isDisabled}
//                   required={field.required}
//                   multiple={field.multiple}
//                   placeholder={`Enter ${field.label.toLowerCase()}...`}
//                   className={`w-full px-4 py-3 border rounded-2xl text-sm font-medium outline-none transition-all duration-200
//                     ${error ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"}
//                     ${isDisabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}
//                   `}
//                 />
//               )}
//               {error && (
//                 <span className="text-[10px] text-red-500 font-bold ml-2 italic">
//                   {error}
//                 </span>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {form.challans && form.challans.length > 0 && (
//         <div className="mt-4 p-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
//           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
//             Uploaded Documents ({form.challans.length}/4)
//           </p>
//           <div className="flex flex-wrap gap-4">
//             {form.challans.map((file, index) => (
//               <ChallanThumbnail
//                 key={file._id || index}
//                 file={file}
//                 tripId={form._id}
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
