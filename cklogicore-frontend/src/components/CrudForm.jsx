// CrudForm.jsx
import React from "react";
import CommonSelect from "./CommonSelect";
import { toInputDate } from "../utils/reUseableFn";

const CrudForm = ({ form, setForm, fields }) => {

  console.log(form, toInputDate(form?.documents?.insuranceExpiry))
  /* ===============================
      HANDLE CHANGE
  =============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Nested (rates.xxx / financials.xxx)
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
      GET VALUE (SMART, DATE SAFE)
  =============================== */
  const getValue = (field) => {

    let val;

    // Handle nested fields first
    if (field.name.includes(".")) {
      const [p, k] = field.name.split(".");
      val = form[p]?.[k];
    } else {
      val = form[field.name];
    }

    /* ===== DATE FIX ===== */
    if (field.type === "date" && val) {
      const d = new Date(val);

      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");

        return `${yyyy}-${mm}-${dd}`; // ✅ ONLY VALID FORMAT
      }

      return "";
    }

    /* ===== OBJECT → ID ===== */
    if (typeof val === "object" && val !== null) {
      return val._id || "";
    }

    return val || "";
  };




  /* ===============================
      RENDER
  =============================== */
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[calc(100vh-180px)] overflow-y-auto">
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col">
          <label className="font-semibold mb-1">{field.label}</label>

          {/* ===== DROPDOWN ===== */}
          {field.type === "select" ? (
            <CommonSelect
              name={field.name}
              value={getValue(field)}
              options={field.options}
              onChange={handleChange}
            />
          ) : (
            /* ===== INPUT ===== */
            <input
              type={field.type || "text"}
              name={field.name}
              value={getValue(field) || ""}
              onChange={handleChange}
              disabled={field.name === "vehicleNumber" && form?._id} // edit mode safe
              required={field.required || false}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default CrudForm;





// import React from "react";
// import CommonSelect from "./CommonSelect";

// const CrudForm = ({ form, setForm, fields }) => {

//   const handleChange = (e) => {
//     const { name, value } = e.target;

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

//   // 👉 Edit time object → _id
//   const getValue = (field) => {
//     const val = form[field.name];

//     // select + object case
//     if (field.type === "select" && typeof val === "object") {
//       return val?._id || "";
//     }

//     return val || "";
//   };

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[calc(100vh-180px)] overflow-y-auto">

//       {fields.map((field) => (
//         <div key={field.name} className="flex flex-col">

//           <label className="font-semibold mb-1">
//             {field.label}
//           </label>

//           {/* ===== SELECT FIELD ===== */}
//           {field.type === "select" ? (
//             <CommonSelect
//               name={field.name}
//               value={getValue(field)}
//               options={field.options}
//               onChange={handleChange}
//             />
//           ) : (

//             /* ===== NORMAL INPUT ===== */
//             <input
//               type={field.type || "text"}
//               name={field.name}
//               value={getValue(field)}
//               onChange={handleChange}
//               required={field.required || false}
//               className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />

//           )}

//         </div>
//       ))}

//     </div>
//   );
// };

// export default CrudForm;







// // CrudForm.jsx
// import React from "react";

// const CrudForm = ({ form, setForm, fields }) => {

//   console.log("form====>",form)
//   console.log("setForm====>",setForm)
//   console.log("fields====>",fields)

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     if (name.includes(".")) {
//       const [parent, key] = name.split(".");
//       setForm((prev) => ({ ...prev, [parent]: { ...prev[parent], [key]: value } }));
//     } else {
//       setForm((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//     // Get nested value (supports: rates.companyRatePerTon etc)
//     const getNestedValue = (obj, path) => {
//       return path.split(".").reduce((acc, key) => acc?.[key], obj);
//     };
  
//     // Safe render value
//     const renderValue = (row, field) => {
//       const value = getNestedValue(row, field.name);
  
//       if (value === null || value === undefined) return "-";
  
//       // 👉 Handle Date
//       if (field.type === "date") {
//         return formatDate(value);
//       }
  
//       // 👉 Handle Object
//       if (typeof value === "object") {
//         return (
//           value.vehicleNumber ||
//           value.name ||
//           value.title ||
//           "-"
//         );
//       }
  
//       // 👉 Handle Boolean
//       if (typeof value === "boolean") {
//         return value ? "Yes" : "No";
//       }
  
//       // 👉 Default
//       return value;
//     };

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[calc(100vh-180px)] overflow-y-auto">
//       {fields.map((field) => (
//         <div key={field.name} className="flex flex-col">
//           <label className="font-semibold mb-1">{field.label}</label>
//           <input
//             type={field.type}
//             name={field.name}
//             value={
//               field.name.includes(".")
//                 ? form[field.name.split(".")[0]]?.[field.name.split(".")[1]] || ""
//                 : form[field.name] || ""
//             }

//             // value={renderValue(field, fields)}
//             onChange={handleChange}
//             required={field.required || false}
//             className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//       ))}
//     </div>
//   );
// };

// export default CrudForm;
