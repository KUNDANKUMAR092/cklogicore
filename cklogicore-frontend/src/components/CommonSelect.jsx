import React from "react";
import { FaChevronDown } from "react-icons/fa"; // Ek sundar icon ke liye

const CommonSelect = ({ name, value, options = [], onChange, disabled, required }) => {
  const isValueInOptions = options.some(opt => String(opt.value) === String(value));
  return (
    <div className="relative w-full group">
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        required={required}
        // Design ko Input fields se match karne ke liye padding aur rounding fix ki hai
        className={`w-full px-4 py-3 border rounded-2xl text-sm font-medium outline-none transition-all duration-200 appearance-none cursor-pointer
          ${disabled 
            ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed" 
            : "bg-white border-gray-200 text-gray-700 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 hover:border-gray-300"
          }`}
      >
        <option value="" disabled className="text-gray-400">
          Select {name?.replace("Id", "")}...
        </option>

        {/* FIX: Agar disabled hai aur options abhi load nahi huye, to current value dikhao */}
        {disabled && value && !isValueInOptions && (
          <option value={value}>Loading name...</option>
        )}

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Custom Dropdown Arrow Icon - Default arrow ko hata kar ye lagaya hai */}
      <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors 
        ${disabled ? 'text-gray-300' : 'text-gray-400 group-hover:text-blue-500'}`}>
        <FaChevronDown size={10} />
      </div>
    </div>
  );
};

export default CommonSelect;
