// components/CommonSelect.jsx
import React from "react";

const CommonSelect = ({ name, value, options = [], onChange }) => {
  return (
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Select</option>

      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default CommonSelect;
