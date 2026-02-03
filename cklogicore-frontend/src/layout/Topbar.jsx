import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaCog, FaInfoCircle, FaPhoneAlt, FaUser, FaSignOutAlt } from "react-icons/fa";
import { logout } from "../features/auth/authSlice";
import { useAppDispatch } from "../app/hooks";

export default function Topbar({ toggleSidebar }) {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useAppDispatch()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Logout Handler
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true })
  };

  // Dropdown ko bahar click karne par close karne ke liye
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pyaara Message Logic based on AccountType
  const accountStatus = useMemo(() => {
    const type = user?.accountType?.toUpperCase();
    // Check if it's mobile (optional, but better to handle in JSX via CSS)
    const isMobile = window.innerWidth < 768; 

    if (type === "VEHICLE") {
      return isMobile ? "Logistics Partner" : "Your Account is Registered as a Logistics Partner (Vehicle)";
    }
    if (type === "COMPANY") {
      return isMobile ? "Corporate Client" : "You are Managing this Account as a Corporate Client (Company)";
    }
    if (type === "SUPPLIER") {
      return isMobile ? "Verified Supplier" : "This is a Verified Supplier Type Account";
    }
    return type || 'General';
  }, [user]);

  const getWelcomeMessage = () => {
    const type = user?.accountType?.toUpperCase();
    const name = user?.name?.split(" ")[0] || "User";
    
    if (type === "VEHICLE") return `🚚 Hello ${name}, Drive safe!`;
    if (type === "COMPANY") return `🏢 Welcome ${name}, Let's manage business!`;
    if (type === "SUPPLIER") return `📦 Hi ${name}, Stock looks good!`;
    return `👋 Welcome back, ${name}!`;
  };

  const welcomeMessage = useMemo(() => {
    const type = user?.accountType?.toUpperCase();
    const name = user?.name?.split(" ")[0] || "User";
    
    if (type === "VEHICLE") return `🚚 Hello ${name}, Drive safe!`;
    if (type === "COMPANY") return `🏢 Welcome ${name}, Let's manage business!`;
    if (type === "SUPPLIER") return `📦 Hi ${name}, Stock looks good!`;
    return `👋 Welcome back, ${name}!`;
  }, [user]);

  return (
    <div className="w-full h-16 min-h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-6 relative z-50 ">
      
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-3 min-w-0"> {/* min-w-0 is key for truncate */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 flex-shrink-0 rounded-full hover:bg-gray-100"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex flex-col overflow-hidden">
          <h2 className="text-sm md:text-lg font-bold text-gray-800 leading-none truncate">
            {accountStatus}
          </h2>
          <span className="text-[10px] md:text-xs text-blue-500 font-medium italic truncate mt-1">
            {welcomeMessage}
          </span>
        </div>
      </div>

      {/* Right: User Profile Circle & Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
        >
          {/* User Initial or Image Circle */}
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm overflow-hidden">
            {user?.profilePic ? (
              <img src={user.profilePic} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name?.charAt(0).toUpperCase() || "U"}</span>
            )}
          </div>
          <div className="hidden md:block text-left">
             <p className="text-xs font-bold text-gray-700 leading-none">{user?.name}</p>
             <p className="text-[10px] text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in duration-200">
            <div className="px-4 py-2 border-b border-gray-50 mb-1">
              <p className="text-sm font-bold text-gray-800 truncate">{user?.name}</p>
              <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
            </div>

            <button onClick={() => navigate("/profile")} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer">
              <FaUser size={14} /> Profile
            </button>

            <button onClick={() => navigate("/settings")} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer">
              <FaCog size={14} /> Settings
            </button>

            <button onClick={() => navigate("/about")} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer">
              <FaInfoCircle size={14} /> About Us
            </button>

            <button onClick={() => navigate("/contact")} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer">
              <FaPhoneAlt size={14} /> Contact Us
            </button>

            <div className="border-t border-gray-50 mt-1 pt-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition font-medium cursor-pointer"
              >
                <FaSignOutAlt size={14} /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}