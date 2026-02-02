import React from "react";
import { FaChevronDown } from "react-icons/fa";

const CommonSelect = ({
  name,
  value,
  options = [],
  onChange,
  disabled,
  required
}) => {
  const finalValue =
    disabled && (value === "" || value === null || value === undefined)
      ? options?.[0]?.value || ""
      : value || "";

  // Placeholder color logic: agar value empty hai toh text grey dikhega (input placeholder ki tarah)
  const isPlaceholderActive = finalValue === "";

  return (
    <div className="relative w-full">
      <select
        name={name}
        value={finalValue}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full px-4 py-3 border rounded-2xl text-sm font-medium outline-none transition-all duration-200 appearance-none
          ${disabled 
            ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed" 
            : `bg-white border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 ${
                isPlaceholderActive ? "text-gray-400" : "text-gray-700"
              }`
          }`}
      >
        <option value="" disabled>
          Enter {name?.replace("Id", "").toLowerCase()}...
        </option>

        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="text-gray-700">
            {opt.label}
          </option>
        ))}
      </select>
      
      {/* Icon ko dubara add karna zaroori hai kyunki appearance-none ne arrow hata diya hai */}
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
        <FaChevronDown className={`text-xs ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
      </div>
    </div>
  );
};

export default CommonSelect;