import React, { useState, useEffect } from "react";
import { 
  useGetProfileQuery, 
  useUpdateProfileMutation, 
  useUpdateAvatarMutation, 
  useUpdateBannerMutation,
  useChangePasswordMutation 
} from "../features/profile/profileApi";
import { toast } from "react-toastify";
import { FaCamera, FaUserEdit, FaLock, FaSave, FaTimes, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { formatDate } from "../utils/reUseableFn";
import DataHandler from "../components/DataHandler";

const ProfilePage = () => {
  const { data: user, isLoading, error } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [updateAvatar] = useUpdateAvatarMutation();
  const [updateBanner] = useUpdateBannerMutation();
  const [changePassword] = useChangePasswordMutation();

  const [isEdit, setIsEdit] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  
  // Local state for editable fields (Nested logic handled)
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    bio: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [passData, setPassData] = useState({ oldPassword: "", newPassword: "" });

  // Sync Schema Data to Form
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        mobile: user.mobile || "",
        bio: user.bio || "",
        address: user.personalDetails?.address || "",
        city: user.personalDetails?.city || "",
        state: user.personalDetails?.state || "",
        pincode: user.personalDetails?.pincode || "",
      });
    }
  }, [user]);

  /* ================= HANDLERS ================= */

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      // Backend expects address fields inside personalDetails based on your controller logic
      // Agar backend direct flat fields le raha hai to theek hai, varna nested object bhejein
      const payload = {
        name: formData.name,
        mobile: formData.mobile,
        bio: formData.bio,
        personalDetails: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        }
      };
      
      await updateProfile(payload).unwrap();
      toast.success("Profile synced successfully!");
      setIsEdit(false);
    } catch (err) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append("avatar", file);
    try {
      await updateAvatar(uploadData).unwrap();
      toast.success("Avatar updated!");
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  // Image Upload Handlers
  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append(type, file); // 'avatar' or 'banner'

    try {
      if (type === 'avatar') await updateAvatar(uploadData).unwrap();
      else await updateBanner(uploadData).unwrap();
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} updated!`);
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  const handlePasswordSubmit = async (e) => {
  e.preventDefault();
  
  if (passData.oldPassword === passData.newPassword) {
    return toast.warning("New password cannot be the same as old one!");
  }

  try {
    // Backend expects { oldPassword, newPassword }
    await changePassword(passData).unwrap();
    toast.success("Password updated successfully!");
    setShowPassModal(false);
    setPassData({ oldPassword: "", newPassword: "" }); // Form clear karein
  } catch (err) {
    toast.error(err?.data?.message || "Failed to update password. Check old password.");
  }
};

  return (
    <DataHandler isLoading={isLoading} error={error}>
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Banner Section */}
          <div className="h-48 md:h-64 bg-gray-200 relative group">
            {user?.banner ? (
              <img src={`${import.meta.env.VITE_API_URL}/${user.banner}`} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-700 to-indigo-600"></div>
            )}
            <label className="absolute top-4 right-4 p-3 bg-black/40 backdrop-blur-md text-white rounded-2xl cursor-pointer opacity-0 group-hover:opacity-100 transition shadow-lg border border-white/20">
              <div className="flex items-center gap-2 text-xs font-bold uppercase">
                <FaCamera /> Change Banner
              </div>
              <input type="file" hidden onChange={(e) => handleImageUpload(e, 'banner')} />
            </label>
          </div>
          <div className="px-8 pb-8">
            <div className="relative flex flex-col md:flex-row items-center md:items-end -mt-20 gap-6">
              <div className="relative">
                <div className="w-40 h-40 rounded-3xl border-8 border-white bg-gray-100 overflow-hidden shadow-2xl flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={`${import.meta.env.VITE_API_URL}/${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl font-bold text-blue-600">{user?.name?.charAt(0)}</span>
                  )}
                </div>
                <label className="absolute bottom-4 -right-2 p-3 bg-blue-600 text-white rounded-2xl cursor-pointer shadow-xl hover:bg-blue-700 transition">
                  <FaCamera size={18} />
                  <input type="file" hidden onChange={handleAvatarChange} />
                </label>
              </div>

              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-extrabold text-gray-800">{user?.name}</h1>
                <div className="flex gap-2 mt-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg border border-indigo-100 uppercase">
                    {user?.accountType} • {user?.role}
                  </span>
                  <span className={`px-3 py-1 text-[10px] font-bold rounded-lg border uppercase ${user?.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                    {user?.isActive ? "Account Active" : "Suspended"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mb-2">
                <button onClick={() => setIsEdit(!isEdit)} className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 text-sm font-bold transition shadow-sm ${isEdit ? 'bg-gray-200 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  {isEdit ? <><FaTimes /> Cancel</> : <><FaUserEdit /> Edit Profile</>}
                </button>
                <button onClick={() => setShowPassModal(true)} className="px-5 py-2.5 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-black transition shadow-sm flex items-center gap-2">
                  <FaLock size={14} /> Security
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleProfileUpdate} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input type="text" disabled={!isEdit} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition disabled:opacity-50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Registered Email</label>
                    <input type="text" disabled value={user?.email || ""} className="w-full p-3.5 border border-gray-200 rounded-2xl bg-gray-100 text-gray-400 cursor-not-allowed outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                    <input type="text" disabled={!isEdit} value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="w-full p-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Role</label>
                    <input type="text" disabled value={user?.role || ""} className="w-full p-3.5 border border-gray-200 rounded-2xl bg-gray-100 text-gray-400 uppercase text-xs font-bold" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                  Business Location & Bio
                </h3>
                <div className="space-y-6">
                   <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Short Bio</label>
                    <textarea rows="2" disabled={!isEdit} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full p-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition" placeholder="Write something about your business..."></textarea>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Address</label>
                    <input type="text" disabled={!isEdit} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full p-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                      <input type="text" disabled={!isEdit} value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full p-3.5 border border-gray-200 rounded-2xl bg-gray-50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State</label>
                      <input type="text" disabled={!isEdit} value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full p-3.5 border border-gray-200 rounded-2xl bg-gray-50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pincode</label>
                      <input type="text" disabled={!isEdit} value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className="w-full p-3.5 border border-gray-200 rounded-2xl bg-gray-50" />
                    </div>
                  </div>
                </div>
              </div>

              {isEdit && (
                <div className="flex justify-end pt-4">
                  <button type="submit" disabled={isUpdating} className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition active:scale-95">
                    {isUpdating ? "Syncing..." : "Update Everything"}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Sidebar: Status & Info */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
               <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaCalendarAlt size={24} />
               </div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Partner Since</p>
               <h4 className="text-xl font-bold text-gray-800">{formatDate(user?.createdAt)}</h4>
               <p className="text-xs text-gray-500 mt-2 italic">Last updated {formatDate(user?.updatedAt)}</p>
            </div>

            <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-xl text-white">
               <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
                 <FaMapMarkerAlt className="text-blue-400" /> Account Meta
               </h3>
               <div className="space-y-4">
                  <div>
                    <p className="text-[9px] font-bold text-gray-500 uppercase">Unique ID</p>
                    <p className="text-[10px] font-mono text-blue-300 break-all">{user?._id}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-800">
                    <p className="text-[9px] font-bold text-gray-500 uppercase mb-2">Security Status</p>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-[11px] font-bold">Two-Factor Enabled</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Password Modal Code Here... */}
      </div>
      {/* Password Change Modal */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-gray-100 transform animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 uppercase tracking-tighter">
                <FaLock className="text-blue-600" /> Security Settings
              </h2>
              <button 
                onClick={() => setShowPassModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <FaTimes className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Current Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  required
                  value={passData.oldPassword}
                  onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                  className="w-full p-4 border border-gray-100 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">New Secure Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  required
                  value={passData.newPassword}
                  onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                  className="w-full p-4 border border-gray-100 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition" 
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-lg shadow-blue-200 transition active:scale-95"
                >
                  Update Password
                </button>
              </div>
            </form>
            
            <p className="mt-4 text-center text-[10px] text-gray-400 font-medium">
              Changing your password will keep you logged in on this device.
            </p>
          </div>
        </div>
      )}
    </DataHandler>
  );
};

export default ProfilePage;





// import React, { useState, useEffect } from "react";
// import { 
//   useGetProfileQuery, 
//   useUpdateProfileMutation, 
//   useUpdateAvatarMutation, 
//   useChangePasswordMutation 
// } from "../features/profile/profileApi";
// import { toast } from "react-toastify";
// import { FaCamera, FaUserEdit, FaLock, FaSave, FaTimes, FaInfoCircle, FaCalendarAlt } from "react-icons/fa";
// import { formatDate } from "../utils/reUseableFn"; // Ensure you have this helper
// import DataHandler from "../components/DataHandler";

// const ProfilePage = () => {
//   const { data: user, isLoading, error } = useGetProfileQuery();
//   const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
//   const [updateAvatar] = useUpdateAvatarMutation();
//   const [changePassword] = useChangePasswordMutation();

//   const [isEdit, setIsEdit] = useState(false);
//   const [showPassModal, setShowPassModal] = useState(false);
  
//   // Editable State
//   const [formData, setFormData] = useState({ name: "", mobile: "", address: "", bio: "" });
//   const [passData, setPassData] = useState({ oldPassword: "", newPassword: "" });

//   useEffect(() => {
//     if (user) {
//       setFormData({
//         name: user.name || "",
//         mobile: user.mobile || "",
//         address: user.address || "",
//         bio: user.bio || "",
//       });
//     }
//   }, [user]);

//   const handleProfileUpdate = async (e) => {
//     e.preventDefault();
//     try {
//       await updateProfile(formData).unwrap();
//       toast.success("Profile updated successfully!");
//       setIsEdit(false);
//     } catch (err) {
//       toast.error(err?.data?.message || "Update failed");
//     }
//   };

//   const handleAvatarChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const uploadData = new FormData();
//     uploadData.append("avatar", file);
//     try {
//       await updateAvatar(uploadData).unwrap();
//       toast.success("Avatar updated!");
//     } catch (err) {
//       toast.error("Upload failed");
//     }
//   };

//   return (
//     <DataHandler loading={isLoading} error={error}>
//       <div className="max-w-5xl mx-auto p-4 md:p-6">
        
//         {/* Profile Header */}
//         <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
//           <div className="h-32 bg-gradient-to-r from-indigo-600 to-blue-500"></div>
//           <div className="px-8 pb-8">
//             <div className="relative flex flex-col md:flex-row items-center md:items-end -mt-16 gap-6">
//               <div className="relative group">
//                 <div className="w-32 h-32 rounded-3xl border-4 border-white bg-gray-100 overflow-hidden shadow-lg flex items-center justify-center">
//                   {user?.avatar ? (
//                     <img src={`${import.meta.env.VITE_API_URL}/${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
//                   ) : (
//                     <span className="text-4xl font-bold text-blue-600">{user?.name?.charAt(0)}</span>
//                   )}
//                 </div>
//                 <label className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-xl cursor-pointer shadow-md hover:scale-110 transition">
//                   <FaCamera size={16} />
//                   <input type="file" hidden onChange={handleAvatarChange} />
//                 </label>
//               </div>

//               <div className="text-center md:text-left flex-1">
//                 <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
//                 <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-1">
//                   <span className="px-3 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase border border-blue-100">
//                     {user?.accountType}
//                   </span>
//                   <span className="px-3 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase border border-green-100">
//                     {user?.isActive ? "Active" : "Inactive"}
//                   </span>
//                 </div>
//               </div>

//               <div className="flex gap-2">
//                 <button onClick={() => setIsEdit(!isEdit)} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition ${isEdit ? 'bg-gray-100 text-gray-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
//                   {isEdit ? <><FaTimes /> Cancel</> : <><FaUserEdit /> Edit</>}
//                 </button>
//                 <button onClick={() => setShowPassModal(true)} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition flex items-center gap-2">
//                   <FaLock size={12} /> Security
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Left Side: Editable & Static Info */}
//           <div className="md:col-span-2 space-y-6">
//             <form onSubmit={handleProfileUpdate} className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
//               <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
//                 <FaInfoCircle className="text-blue-500" /> Basic Information
//               </h3>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-1">
//                   <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
//                   <input type="text" disabled={!isEdit} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 border rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition disabled:text-gray-400" />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email (ReadOnly)</label>
//                   <input type="text" disabled value={user?.email || ""} className="w-full p-3 border rounded-2xl bg-gray-100 text-gray-400 outline-none cursor-not-allowed" />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mobile</label>
//                   <input type="text" disabled={!isEdit} value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="w-full p-3 border rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition" />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-bold text-gray-500 uppercase ml-1">Role (ReadOnly)</label>
//                   <input type="text" disabled value={user?.role || ""} className="w-full p-3 border rounded-2xl bg-gray-100 text-gray-400 uppercase font-bold text-xs" />
//                 </div>
//               </div>

//               <div className="space-y-1">
//                 <label className="text-xs font-bold text-gray-500 uppercase ml-1">Bio</label>
//                 <textarea rows="2" disabled={!isEdit} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full p-3 border rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition" placeholder="Write about yourself..."></textarea>
//               </div>

//               <div className="space-y-1">
//                 <label className="text-xs font-bold text-gray-500 uppercase ml-1">Address</label>
//                 <textarea rows="2" disabled={!isEdit} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full p-3 border rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition"></textarea>
//               </div>

//               {isEdit && (
//                 <div className="flex justify-end">
//                   <button type="submit" disabled={isUpdating} className="bg-blue-600 text-white px-10 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition">
//                     <FaSave /> {isUpdating ? "Saving..." : "Save Changes"}
//                   </button>
//                 </div>
//               )}
//             </form>
//           </div>

//           {/* Right Side: Metadata Card */}
//           <div className="space-y-6">
//             <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
//               <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-widest">Account Metadata</h3>
//               <div className="space-y-4">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><FaCalendarAlt size={14}/></div>
//                   <div>
//                     <p className="text-[10px] font-bold text-gray-400 uppercase">Member Since</p>
//                     <p className="text-xs font-bold text-gray-700">{formatDate(user?.createdAt)}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><FaInfoCircle size={14}/></div>
//                   <div>
//                     <p className="text-[10px] font-bold text-gray-400 uppercase">Account ID</p>
//                     <p className="text-[10px] font-mono text-gray-600 break-all">{user?._id}</p>
//                   </div>
//                 </div>
//                 <div className="pt-4 border-t">
//                   <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">System Status</p>
//                   <div className="flex gap-2">
//                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
//                     <span className="text-xs font-bold text-gray-600">Online & Active</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Password Modal remains the same... */}
//       </div>
//     </DataHandler>
//   );
// };

// export default ProfilePage;