import React from "react";
import Loader from "./Loader";

const DataHandler = ({ loading, error, children }) => {

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 min-h-[200px]">
        <Loader />
        <p className="text-gray-500 mt-2 text-sm animate-pulse">Fetching data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-lg border border-red-100 text-center my-4">
        <p className="font-semibold">Oops! Something went wrong.</p>
        <p className="text-sm opacity-80">{error?.data?.message || "Failed to load data."}</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default DataHandler;