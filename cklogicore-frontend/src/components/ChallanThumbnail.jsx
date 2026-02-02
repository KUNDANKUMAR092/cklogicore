import React from "react";
import { FaFilePdf, FaFileAlt, FaTimesCircle } from "react-icons/fa";

const ChallanThumbnail = ({ file, index, onDelete, tripId }) => {
  if (!file) return null;
  
  let src = "";
  let name = "";
  // Check if it's an existing file from DB or a newly selected one
  const isExisting = !!file._id; 

  if (file && typeof file === 'object' && file.fileUrl) {
    const baseUrl = "http://localhost:5000/"; 
    src = file.fileUrl.startsWith("http") ? file.fileUrl : `${baseUrl}${file.fileUrl}`;
    name = file.fileName || "document";
  } else if (file instanceof File) {
    src = URL.createObjectURL(file);
    name = file.name;
  }

  return (
    <div className="relative group">
      <a href={src} target="_blank" rel="noreferrer">
        <div className="h-12 w-12 rounded-xl border-2 border-gray-200 flex items-center justify-center bg-white overflow-hidden hover:border-blue-400 transition-all">
          {name.toLowerCase().endsWith('.pdf') ? (
            <FaFilePdf className="text-red-500" size={20} />
          ) : (
            <img src={src} className="h-full w-full object-cover" alt="thumb" />
          )}
        </div>
      </a>

      {/* 🔥 DELETE BUTTON: Always visible for files in Modal */}
      {onDelete && (
        <button
          type="button" // Important: Isse form submit nahi hoga
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(tripId, file._id);
          }}
          className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full shadow hover:bg-red-50 transition-colors z-20"
        >
          <FaTimesCircle size={18} />
        </button>
      )}
    </div>
  );
};

export default ChallanThumbnail;



// import React from "react";
// import { FaFilePdf, FaFileAlt, FaTimesCircle } from "react-icons/fa";

// const ChallanThumbnail = ({ file, index, onDelete, tripId }) => {
//   if (!file) return null;

//   let src = "";
//   let name = "";
//   let isExisting = false;
//   const challanId = file._id; // Existing files from backend have an _id

//   // 1. Backend Object Check
//   if (file && typeof file === 'object' && file.fileUrl) {
//     const baseUrl = "http://localhost:5000/";
//     src = file.fileUrl.startsWith("http") ? file.fileUrl : `${baseUrl}${file.fileUrl}`;
//     name = file.fileName || "document";
//     isExisting = true;
//   }
//   // 2. Local File Object (Preview)
//   else if (file instanceof File) {
//     src = URL.createObjectURL(file);
//     name = file.name;
//   }
//   // 3. String Fallback
//   else if (typeof file === 'string') {
//     src = file;
//     name = "file";
//   }

//   if (!src) return null;

//   const ext = name.split('.').pop().toLowerCase();
//   const isImg = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
//   const isPDF = ext === "pdf";

//   return (
//     <div className="relative group flex-shrink-0">
//       <a href={src} target="_blank" rel="noreferrer" title={name}>
//         <div className="h-10 w-10 rounded-lg border-2 border-white shadow-md flex items-center justify-center bg-gray-100 overflow-hidden hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer">
//           {isImg ? (
//             <img src={src} className="h-full w-full object-cover" alt="thumb" />
//           ) : isPDF ? (
//             <FaFilePdf className="text-red-500" size={20} />
//           ) : (
//             <FaFileAlt className="text-blue-500" size={20} />
//           )}
//         </div>
//       </a>

//       {/* Show Close Icon only if onDelete is passed (Edit Mode) and it's an existing file */}
//       {onDelete && isExisting && (
//         <button
//           onClick={(e) => {
//             e.preventDefault();
//             onDelete(tripId, challanId);
//           }}
//           className="absolute -top-2 -right-2 text-red-500 bg-white rounded-full hover:text-red-700 shadow-sm transition-colors"
//         >
//           <FaTimesCircle size={16} />
//         </button>
//       )}
//     </div>
//   );
// };

// export default ChallanThumbnail;