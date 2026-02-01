import React from "react";
import { FaExclamationTriangle, FaInbox } from "react-icons/fa";
import Loader from "../components/Loader";

const DataHandler = ({ 
  isLoading, 
  error, 
  data, 
  isEmpty, 
  children 
}) => {
  
  // 1. Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 w-full">
        <Loader />
        <p className="mt-4 text-sm text-gray-500 font-medium animate-pulse">
          Fetching data, please wait...
        </p>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-red-50 border border-red-100 rounded-3xl my-4">
        <div className="p-4 bg-red-100 rounded-full text-red-600 mb-4">
          <FaExclamationTriangle size={30} />
        </div>
        <h3 className="text-lg font-bold text-red-800">Connection Error</h3>
        <p className="text-sm text-red-600 text-center max-w-xs mt-2">
          {error?.data?.message || "Something went wrong while fetching data. Please check your internet or try again."}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition shadow-lg shadow-red-200"
        >
          Try Refreshing
        </button>
      </div>
    );
  }

  // 3. Empty State (Optional)
  // Agar aap chaho to list khali hone par bhi yahan se handle kar sakte ho
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <FaInbox size={50} className="mb-4 opacity-20" />
        <p className="text-lg font-semibold">No records found</p>
        <p className="text-sm">Try adjusting your filters or search.</p>
      </div>
    );
  }

  // 4. Success State (Actual Content)
  return <>{children}</>;
};

export default DataHandler;