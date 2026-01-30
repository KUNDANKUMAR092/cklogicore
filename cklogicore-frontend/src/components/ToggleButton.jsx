import { useState } from "react";

export default function ToggleButton() {
  const [isOn, setIsOn] = useState(false);

  return (
    <button
      onClick={() => setIsOn(!isOn)}
      className={`
        px-4 py-2 rounded-md font-semibold cursor-pointer
        transition-all duration-300
        ${isOn ? "bg-green-500 text-white" : "bg-gray-300 text-black"}
      `}
    >
      {isOn ? "ON" : "OFF"}
    </button>
  );
}
