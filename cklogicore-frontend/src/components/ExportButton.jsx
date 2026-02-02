import React from "react";
import { useLazyExportTripsQuery } from "../features/excel/excelApi";
import { toast } from "react-hot-toast";

export default function ExportButton({ filters, title = "Export Excel" }) {
  // Yahan humne sirf API trigger ko call kiya hai
  const [triggerExport, { isLoading }] = useLazyExportTripsQuery();

  const handleDownload = async () => {
    try {
      // 1. API call with filters (jo Dashboard se aa rahe hain)
      const blob = await triggerExport(filters).unwrap();
      
      // 2. Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Filename logic
      const fileName = `Report_${filters?.target || 'Data'}_${Date.now()}.xlsx`;
      link.setAttribute("download", fileName);
      
      document.body.appendChild(link);
      link.click();
      
      // 3. Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Excel downloaded successfully!");
    } catch (err) {
      console.error("Export Error:", err);
      toast.error(err?.data?.message || "Failed to download excel");
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className={`px-4 py-2 rounded text-white font-medium shadow-sm transition-all ${
        isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 active:scale-95"
      }`}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating...
        </span>
      ) : (
        `📥 ${title}`
      )}
    </button>
  );
}