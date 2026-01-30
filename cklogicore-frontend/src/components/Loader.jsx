import React from "react";

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center absolute inset-x-0 top-0 border-0 h-screen z-[999] py-16">
      <div className="absolute inset-x-0 top-0 border-0 h-screen z-[99] bg-[#00000070]"></div>
      {/* Spinner */}
      <div className="relative w-16 h-16 relative z-[99]">

        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>

        <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>

      </div>

      {/* Text */}
      <p className="mt-4 text-sm text-gray-600 animate-pulse">
        Loading data...
      </p>

    </div>
  );
}
