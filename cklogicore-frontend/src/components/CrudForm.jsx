// CrudForm.jsx


import React from "react";
import CommonSelect from "./CommonSelect";

const CrudForm = ({ form, setForm, fields }) => {

  /* ===============================
      HANDLE CHANGE
  =============================== */
  // const handleChange = (e) => {
  //   const { name, value } = e.target;

  //   if (name.includes(".")) {
  //     const [parent, key] = name.split(".");
  //     setForm((prev) => ({
  //       ...prev,
  //       [parent]: {
  //         ...prev[parent],
  //         [key]: value,
  //       },
  //     }));
  //   } else {
  //     setForm((prev) => ({
  //       ...prev,
  //       [name]: value,
  //     }));
  //   }
  // };

  // CrudForm.jsx ke andar handleChange ko update karein
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = {};

    if (name.includes(".")) {
      const [parent, key] = name.split(".");
      updatedForm = {
        ...form,
        [parent]: { ...form[parent], [key]: value },
      };
    } else {
      updatedForm = { ...form, [name]: value };
    }

    // 🔥 AUTO-CALCULATION LOGIC
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

    // Form state update with calculated values
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

    // AGAR VALUE OBJECT HAI (Backend se populated data)
    if (val && typeof val === "object" && val._id) {
      return val._id;
    }

    return val || "";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 max-h-[calc(100vh-250px)] overflow-y-auto px-1 pb-4">
      {fields.map((field) => {
        if (field.hidden) return null;
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