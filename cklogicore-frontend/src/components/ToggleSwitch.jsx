import { useState } from "react";

export default function ToggleSwitch({ enabled = false, onChange }) {

  return (
    <div
      onClick={() => onChange(!enabled)}
      className={`
        w-12 h-6 flex items-center rounded-full p-1 cursor-pointer
        transition-colors duration-300
        ${enabled ? "bg-green-500" : "bg-gray-400"}
      `}
    >
      <div
        className={`
          w-4 h-4 bg-white rounded-full shadow-md
          transform transition-transform duration-300
          ${enabled ? "translate-x-6" : "translate-x-0"}
        `}
      />
    </div>
  );
}
