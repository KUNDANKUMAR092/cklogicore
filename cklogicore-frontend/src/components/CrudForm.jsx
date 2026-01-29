// CrudForm.jsx
import React from "react";

const CrudForm = ({ form, setForm, fields }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, key] = name.split(".");
      setForm((prev) => ({ ...prev, [parent]: { ...prev[parent], [key]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col">
          <label className="font-semibold mb-1">{field.label}</label>
          <input
            type={field.type}
            name={field.name}
            value={
              field.name.includes(".")
                ? form[field.name.split(".")[0]]?.[field.name.split(".")[1]] || ""
                : form[field.name] || ""
            }
            onChange={handleChange}
            required={field.required || false}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}
    </div>
  );
};

export default CrudForm;
