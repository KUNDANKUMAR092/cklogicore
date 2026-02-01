// TripPage.jsx

import React, { useState, useMemo } from "react";
import CrudList from "../components/CrudList";
import {
  useGetTripsQuery,
  useCreateTripMutation,
  useUpdateTripMutation,
  useToggleTripMutation,
  useDeleteTripMutation,
} from "../features/trips/tripApi";

import { useGetSuppliersQuery } from "../features/suppliers/supplierApi";
import { useGetCompaniesQuery } from "../features/companies/companyApi";
import { useGetVehiclesQuery } from "../features/vehicles/vehicleApi";

import { tripFields } from "../utils/fieldsConfig";
import { FaPlus } from "react-icons/fa";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const TripPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // 1. Fetch Related Data for Dropdowns (Sare data ek sath mangwa rahe hain dropdown ke liye)
  // Hum limit 1000 rakh rahe hain taki dropdown mein sare options dikhein
  const { data: supplierData } = useGetSuppliersQuery({ limit: 1000 });
  const { data: companyData } = useGetCompaniesQuery({ limit: 1000 });
  const { data: vehicleData } = useGetVehiclesQuery({ limit: 1000 });

  // 2. Main Trip Data
  const { data, isLoading, isFetching, error } = useGetTripsQuery({ page, limit, search });

  const [createTrip] = useCreateTripMutation();
  const [updateTrip] = useUpdateTripMutation();
  const [toggleTrip] = useToggleTripMutation();
  const [deleteTrip] = useDeleteTripMutation();

  // Data Memoization for CrudList
  const { safeList, total } = useMemo(() => ({
    safeList: Array.isArray(data?.list) ? data.list : [],
    total: Number(data?.total) || 0
  }), [data]);

  /* ================= HELPERS ================= */
  
  const handleMutation = async (mutationFn, payload, successMsg) => {
    try {
      await mutationFn(payload).unwrap();
      toast.success(successMsg);
      setOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Operation failed");
    }
  };

  // const buildTripPayload = (form) => ({
  //   accountId: user.accountId,
  //   createdByUserId: user._id,
  //   supplierId: form.supplierId?._id || form.supplierId,
  //   companyId: form.companyId?._id || form.companyId,
  //   vehicleId: form.vehicleId?._id || form.vehicleId,
  //   tripDate: form.tripDate,
  //   loadingPoint: form.loadingPoint,
  //   unloadingPoint: form.unloadingPoint,
  //   totalTonLoad: Number(form.totalTonLoad),
  //   rates: {
  //     companyRatePerTon: Number(form.rates?.companyRatePerTon || form.companyRatePerTon || 0),
  //     vehicleRatePerTon: Number(form.rates?.vehicleRatePerTon || form.vehicleRatePerTon || 0),
  //   },
  //   financials: {
  //     freightAmount: Number(form.financials?.freightAmount || form.freightAmount || 0),
  //     advancePaid: Number(form.financials?.advancePaid || form.advancePaid || 0),
  //     dieselCost: Number(form.financials?.dieselCost || form.dieselCost || 0),
  //     tollCost: Number(form.financials?.tollCost || form.tollCost || 0),
  //     driverExpense: Number(form.financials?.driverExpense || form.driverExpense || 0),
  //     otherExpense: Number(form.financials?.otherExpense || form.otherExpense || 0),
  //   },
  //   status: form.status || "pending",
  // });

  // const buildTripPayload = (form) => {
    
  //   const accountId = user?.accountId;
  //   const type = user?.accountType;

  //   // Final structured payload
  //   return {
  //     // Ye hamesha Owner ki main ID rahegi (Common for all)
  //     accountId: accountId, 
  //     createdByUserId: user?._id,
      
  //     tripDate: form.tripDate,
  //     loadingPoint: form.loadingPoint,
  //     unloadingPoint: form.unloadingPoint,
  //     status: form.status || "pending",
  //     totalTonLoad: Number(form.totalTonLoad || 0),

  //     /* ============================================================
  //       DYNAMIC ID MAPPING: 
  //       Jo user login hai, uska accountId hi uska Entity ID ban jayega.
  //     ============================================================ */
  //     supplierId: type === "SUPPLIER" ? accountId : (form.supplierId?._id || form.supplierId),
  //     companyId: type === "COMPANY" ? accountId : (form.companyId?._id || form.companyId),
  //     vehicleId: type === "VEHICLE" ? accountId : (form.vehicleId?._id || form.vehicleId),

  //     // Financial Nesting
  //     rates: {
  //       companyRatePerTon: Number(form.companyRatePerTon || form.rates?.companyRatePerTon || 0),
  //       vehicleRatePerTon: Number(form.vehicleRatePerTon || form.rates?.vehicleRatePerTon || 0),
  //     },

  //     financials: {
  //       freightAmount: Number(form.freightAmount || form.financials?.freightAmount || 0),
  //       advancePaid: Number(form.advancePaid || form.financials?.advancePaid || 0),
  //       dieselCost: Number(form.dieselCost || form.financials?.dieselCost || 0),
  //       tollCost: Number(form.tollCost || form.financials?.tollCost || 0),
  //       driverExpense: Number(form.driverExpense || form.financials?.driverExpense || 0),
  //       otherExpense: Number(form.otherExpense || form.financials?.otherExpense || 0),
  //     },
  //   };
  // };

  const buildTripPayload = (form) => {
    const type = user?.accountType;
    const entityId = user?.entityId; // Profile API se aayi hui asli ID

    return {
      ...form,
      accountId: user?.accountId, 
      createdByUserId: user?._id,
      
      // 🔥 FIX: Jo user login hai, uska "entityId" hi jayega
      supplierId: type === "SUPPLIER" ? entityId : (form.supplierId?._id || form.supplierId),
      companyId: type === "COMPANY" ? entityId : (form.companyId?._id || form.companyId),
      vehicleId: type === "VEHICLE" ? entityId : (form.vehicleId?._id || form.vehicleId),

      // Financials
      totalTonLoad: Number(form.totalTonLoad || 0),
      rates: {
        companyRatePerTon: Number(form.companyRatePerTon || form.rates?.companyRatePerTon || 0),
        vehicleRatePerTon: Number(form.vehicleRatePerTon || form.rates?.vehicleRatePerTon || 0),
      },
      financials: {
        advancePaid: Number(form.advancePaid || form.financials?.advancePaid || 0),
        dieselCost: Number(form.dieselCost || form.financials?.dieselCost || 0),
        tollCost: Number(form.tollCost || form.financials?.tollCost || 0),
        driverExpense: Number(form.driverExpense || form.financials?.driverExpense || 0),
        otherExpense: Number(form.otherExpense || form.financials?.otherExpense || 0),
      }
    };
  };

  const handleCreate = (form) => 
    handleMutation(createTrip, buildTripPayload(form), "Trip created successfully");

  const handleUpdate = (id, form) => 
    handleMutation(updateTrip, { id, body: buildTripPayload(form) }, "Trip updated successfully");

  const handleToggale = (id, status) => 
    handleMutation(toggleTrip, { id, isActive: status }, "Status updated");

  const handleDelete = (id) => {
    if (window.confirm("Delete this trip?")) {
      handleMutation(deleteTrip, id, "Trip deleted");
    }
  };

  // 3. Dynamic Fields with Dropdown Options
  // const fieldsWithDropdowns = useMemo(() => {
  //   return tripFields.map((f) => {
  //     if (f.name === "supplierId") {
  //       return { 
  //         ...f, 
  //         options: (supplierData?.list || []).map(s => ({ label: s.name, value: s._id })) 
  //       };
  //     }
  //     if (f.name === "companyId") {
  //       return { 
  //         ...f, 
  //         options: (companyData?.list || []).map(c => ({ label: c.name, value: c._id })) 
  //       };
  //     }
  //     if (f.name === "vehicleId") {
  //       return { 
  //         ...f, 
  //         options: (vehicleData?.list || []).map(v => ({ label: v.vehicleNumber, value: v._id })) 
  //       };
  //     }
  //     return f;
  //   });
  // }, [supplierData, companyData, vehicleData]);


  const fieldsWithDropdowns = useMemo(() => {
    return tripFields.map((f) => {
      // 1. Identify Entity Context: Kya ye field wahi hai jo user ka accountType hai?
      const isSupplierField = user?.accountType === "SUPPLIER" && f.name === "supplierId";
      const isCompanyField = user?.accountType === "COMPANY" && f.name === "companyId";
      const isVehicleField = user?.accountType === "VEHICLE" && f.name === "vehicleId";

      // 2. Fixed Field Logic: Agar user wahi entity hai, to dropdown ki jagah disabled text dikhao
      if (isSupplierField || isCompanyField || isVehicleField) {
        return { 
          ...f, 
          type: "text", 
          disabled: true, 
          // Staff ya Owner login ho, unka name/vehicle number context ke liye dikhega
          defaultValue: user?.name || user?.vehicleNumber || "Your Account" 
        };
      }

      // 3. Dropdown Logic: Baki fields ke liye normal options fill karein
      if (f.name === "supplierId") {
        return { 
          ...f, 
          options: (supplierData?.list || []).map(s => ({ label: s.name, value: s._id })) 
        };
      }
      
      if (f.name === "companyId") {
        return { 
          ...f, 
          options: (companyData?.list || []).map(c => ({ label: c.name, value: c._id })) 
        };
      }
      
      if (f.name === "vehicleId") {
        return { 
          ...f, 
          options: (vehicleData?.list || []).map(v => ({ label: v.vehicleNumber, value: v._id })) 
        };
      }

      // 4. Status Field: Agar options fieldsConfig mein pehle se hain toh unhe rehne dein
      return f;
    });
  }, [supplierData, companyData, vehicleData, user]);


  // const fieldsWithDropdowns = useMemo(() => {
  //   return tripFields.map((f) => {
  //     // 1. Identify Context
  //     const isSupplierField = user?.accountType === "SUPPLIER" && f.name === "supplierId";
  //     const isCompanyField = user?.accountType === "COMPANY" && f.name === "companyId";
  //     const isVehicleField = user?.accountType === "VEHICLE" && f.name === "vehicleId";

  //     // 2. Base Options Mapping
  //     let options = [];
  //     if (f.name === "supplierId") options = (supplierData?.list || []).map(s => ({ label: s.name, value: s._id }));
  //     if (f.name === "companyId") options = (companyData?.list || []).map(c => ({ label: c.name, value: c._id }));
  //     if (f.name === "vehicleId") options = (vehicleData?.list || []).map(v => ({ label: v.vehicleNumber || v.name, value: v._id }));

  //     // 3. Status logic (Aapka status dropdown yahan se fix hoga)
  //     if (f.name === "status" && f.options) {
  //       return f; // Agar fieldsConfig mein options hain, toh wahi rehne do
  //     }

  //     // 4. Fixed Entity Logic (Visual and Data fix)
  //     if (isSupplierField || isCompanyField || isVehicleField) {
  //       return { 
  //         ...f, 
  //         type: "select", // Is baar Select hi rakhte hain
  //         options: options, // Options dena zaroori hai taki ID se Name map ho sake
  //         disabled: true, 
  //         // 🔥 Yahan hum entityId bhej rahe hain taki backend ko ID mile
  //         // Lekin UI par options hone ki wajah se "Name" hi dikhega
  //         value: user?.entityId 
  //       };
  //     }

  //     // 5. Normal Dropdowns
  //     return { ...f, options };
  //   });
  // }, [supplierData, companyData, vehicleData, user]);

  // const fieldsWithDropdowns = useMemo(() => {
  //   return tripFields.map((f) => {
  //     const isMyField = 
  //       (user?.accountType === "SUPPLIER" && f.name === "supplierId") ||
  //       (user?.accountType === "COMPANY" && f.name === "companyId") ||
  //       (user?.accountType === "VEHICLE" && f.name === "vehicleId");

  //     // Options Mapping
  //     let options = [];
  //     if (f.name === "supplierId") options = (supplierData?.list || []).map(s => ({ label: s.name, value: s._id }));
  //     if (f.name === "companyId") options = (companyData?.list || []).map(c => ({ label: c.name, value: c._id }));
  //     if (f.name === "vehicleId") options = (vehicleData?.list || []).map(v => ({ label: v.vehicleNumber || v.name, value: v._id }));

  //     if (isMyField) {
  //       return { 
  //         ...f, 
  //         type: "select", 
  //         options: options,
  //         disabled: true, 
  //         // 🚨 Important: Agar list abhi fetch ho rahi hai, toh value null dikh sakti hai
  //         // Isliye options ka hona zaroori hai
  //         value: user?.entityId 
  //       };
  //     }

  //     if (f.name === "status" && f.options) return f;

  //     return { ...f, options };
  //   });
  // }, [supplierData, companyData, vehicleData, user]);

  // const fieldsWithDropdowns = useMemo(() => {
  //   return tripFields.map((f) => {
  //     const isMyField = 
  //       (user?.accountType === "SUPPLIER" && f.name === "supplierId") ||
  //       (user?.accountType === "COMPANY" && f.name === "companyId") ||
  //       (user?.accountType === "VEHICLE" && f.name === "vehicleId");

  //     let options = [];
  //     if (f.name === "supplierId") options = (supplierData?.list || []).map(s => ({ label: s.name, value: s._id }));
  //     if (f.name === "companyId") options = (companyData?.list || []).map(c => ({ label: c.name, value: c._id }));
  //     if (f.name === "vehicleId") options = (vehicleData?.list || []).map(v => ({ label: v.vehicleNumber || v.name, value: v._id }));

  //     if (isMyField) {
  //       return { 
  //         ...f, 
  //         type: "select", 
  //         options: options,
  //         disabled: true, 
  //         // 🚨 defaultValue add karein, value nahi
  //         defaultValue: user?.entityId 
  //       };
  //     }

  //     if (f.name === "status" && f.options) return f;

  //     return { ...f, options };
  //   });
  // }, [supplierData, companyData, vehicleData, user]);


  // TripPage.jsx ke andar handlers ke paas add karein:

  // const handleAddClick = () => {
  //   // 1. Ek empty form object create karein
  //   const initialFormValues = {};

  //   // 2. User ke accountType ke basis par default value set karein
  //   // Taki modal khulte hi field bhari hui dikhe
  //   if (user?.accountType === "SUPPLIER") {
  //     initialFormValues.supplierId = user.name;
  //   } else if (user?.accountType === "COMPANY") {
  //     initialFormValues.companyId = user.name;
  //   } else if (user?.accountType === "VEHICLE") {
  //     initialFormValues.vehicleId = user.vehicleNumber || user.name;
  //   }

  //   // 3. CrudList ko batayein ki ye 'Add' mode hai aur default data pass karein
  //   // setEditData(null); // Purana edit data clear karein
  //   setOpen(true);     // Modal open karein
    
  //   // Note: Agar aapka CrudList default data accept karta hai, 
  //   // toh aap use yahan se set kar sakte hain.
  // };

  const handleAddClick = () => {
    const initialFormValues = {};

    // 🔥 Yahan hum entityId set karenge taki dropdown use auto-select kar sake
    if (user?.accountType === "SUPPLIER") {
      initialFormValues.supplierId = user.entityId; 
    } else if (user?.accountType === "COMPANY") {
      initialFormValues.companyId = user.entityId;
    } else if (user?.accountType === "VEHICLE") {
      initialFormValues.vehicleId = user.entityId;
    }

    setOpen(true);
    // Agar aapka CrudList ya Modal state handle karta hai, 
    // toh ensure karein ki ye initialFormValues wahan pass ho rahe hain.
  };

  return (
    <div className="w-full min-w-0 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Trips</h1>
        <button onClick={handleAddClick} className="px-4 py-1 bg-blue-500 text-white rounded flex items-center hover:bg-blue-600 transition">
          <FaPlus size={12} className="mr-1" /> Add
        </button>
      </div>

      <CrudList
        data={safeList}
        total={total}
        fields={fieldsWithDropdowns}
        isLoading={isLoading}
        loading={isFetching}
        error={error}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onToggale={handleToggale}
        onDelete={handleDelete}
        onEdit={true}
        open={open}
        setOpen={setOpen}
        search={search}
        setSearch={setSearch}
        page={page}
        setPage={setPage}
        limit={limit}
      />
    </div>
  );
};

export default TripPage;













// import React, { useEffect, useState } from "react";
// import CrudList from "../components/CrudList";
// import CrudModal from "../components/CrudModal";
// import {
//   useGetTripsQuery,
//   useCreateTripMutation,
//   useUpdateTripMutation,
//   useToggleTripMutation,
// } from "../features/trips/tripApi";

// import {
//   useGetSuppliersQuery,
// } from "../features/suppliers/supplierApi";

// import {
//   useGetCompaniesQuery,
// } from "../features/companies/companyApi";

// import {
//   useGetVehiclesQuery,
// } from "../features/vehicles/vehicleApi";

// import { tripFields } from "../utils/fieldsConfig";
// import { FaPlus } from "react-icons/fa";
// import { useSelector } from "react-redux";

// const TripPage = () => {
//   const { user } = useSelector((state) => state.auth)
//   const [open, setOpen] = useState(false);

//   const { data = [], isLoading, isFetching } = useGetTripsQuery();
//   const [createTrip] = useCreateTripMutation();
//   const [updateTrip] = useUpdateTripMutation();
//   const [toggleTrip] = useToggleTripMutation();

//   // fetch related dropdowns
//   const { data: suppliers = [] } = useGetSuppliersQuery();
//   const { data: companies = [] } = useGetCompaniesQuery();
//   const { vehiclesList } = useGetVehiclesQuery();
//   const vehicles = vehiclesList?.list || [];


//   const buildTripPayload = (form, accountId, userId) => {
//     return {
//       // ===== REQUIRED IDS =====
//       accountId,
//       createdByUserId: userId,

//       supplierId: form.supplierId?._id || form.supplierId,
//       companyId: form.companyId?._id || form.companyId,
//       vehicleId: form.vehicleId?._id || form.vehicleId,

//       // ===== BASIC =====
//       tripDate: form.tripDate ? new Date(form.tripDate) : null,

//       loadingPoint: form.loadingPoint,
//       unloadingPoint: form.unloadingPoint,

//       totalTonLoad: Number(form.totalTonLoad),

//       // ===== RATES =====
//       rates: {
//         companyRatePerTon: Number(
//           form.rates?.companyRatePerTon || form.companyRatePerTon || 0
//         ),

//         vehicleRatePerTon: Number(
//           form.rates?.vehicleRatePerTon || form.vehicleRatePerTon || 0
//         ),
//       },

//       // ===== FINANCIALS =====
//       financials: {
//         freightAmount: Number(
//           form.financials?.freightAmount || form.freightAmount || 0
//         ),

//         advancePaid: Number(
//           form.financials?.advancePaid || form.advancePaid || 0
//         ),

//         dieselCost: Number(
//           form.financials?.dieselCost || form.dieselCost || 0
//         ),

//         tollCost: Number(
//           form.financials?.tollCost || form.tollCost || 0
//         ),

//         driverExpense: Number(
//           form.financials?.driverExpense || form.driverExpense || 0
//         ),

//         otherExpense: Number(
//           form.financials?.otherExpense || form.otherExpense || 0
//         ),
//       },

//       // ===== OPTIONAL =====
//       status: form.status || "pending",
//       profit: Number(form.profit || 0),
//     };
//   };


//   const handleCreate = async (form) => {
//     try {
//       const payload = buildTripPayload(
//         form,
//         user.accountId,   // from auth
//         user._id          // from auth
//       );
//       await createTrip(payload).unwrap();
//     } catch (err) {
//       console.error("Create Error:", err);
//     }
//   };

//   const handleUpdate = async (id, form) => {
//     try {
//       const payload = buildTripPayload(
//         form,
//         user.accountId,
//         user._id
//       );
//       await updateTrip({ id, body: payload }).unwrap();
//     } catch (err) {
//       console.error("Update Error:", err);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this trip?")) {
//       try {
//         await deleteTrip(id).unwrap();
//       } catch (err) {
//         console.error("Delete Error:", err);
//       }
//     }
//   };

//   const handleToggale = async (id, status) => {
//     try {
//       await toggleTrip({
//         id,
//         isDeleted: status, // backend field
//       }).unwrap();

//     } catch (err) {
//       console.error("Toggle Error:", err);
//     }
//   };

//   // Extend tripFields dynamically for dropdowns
//   const fieldsWithDropdowns = tripFields.map((f) => {
//   // Check if suppliers is an array and has data
//   if (f.name === "supplierId") {
//     const sOptions = Array.isArray(suppliers) 
//       ? suppliers.map(s => ({ label: s.name, value: s._id })) 
//       : [];
//     return { ...f, options: sOptions, type: "select" };
//   }

//   // Check if companies is an array
//   if (f.name === "companyId") {
//     const cOptions = Array.isArray(companies) 
//       ? companies.map(c => ({ label: c.name, value: c._id })) 
//       : [];
//     return { ...f, options: cOptions, type: "select" };
//   }

//   // Check if vehicles is an array
//   if (f.name === "vehicleId") {
//     const vOptions = Array.isArray(vehicles) 
//       ? vehicles.map(v => ({ label: v.vehicleNumber, value: v._id })) 
//       : [];
//     return { ...f, options: vOptions, type: "select" };
//   }

//   return f;
// });
//   // const fieldsWithDropdowns = tripFields.map((f) => {
//   //   if (f.name === "supplierId") return { ...f, options: suppliers?.map(s => ({ label: s.name, value: s._id })), type: "select" };
//   //   if (f.name === "companyId") return { ...f, options: companies?.map(c => ({ label: c.name, value: c._id })), type: "select" };
//   //   if (f.name === "vehicleId") return { ...f, options: vehicles?.map(v => ({ label: v.vehicleNumber, value: v._id })), type: "select" };
//   //   return f;
//   // });

//   return (
//     <div className="w-full min-w-0 overflow-hidden">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold mb-4">Trips</h1>
//         <button onClick={() => setOpen(true)} className="px-4 py-1 bg-blue-500 text-white rounded text-base flex justify-around items-center cursor-pointer"
//         >
//           <FaPlus size={12} className="mr-[2px]" /> Add
//         </button>
//       </div>

//       {isLoading || isFetching ? (
//         <p>Loading...</p>
//       ) : (
//         <CrudList
//           data={data}
//           fields={fieldsWithDropdowns}
//           onCreate={handleCreate}
//           onUpdate={handleUpdate}
//           onEdit={true}
//           // onDelete={handleDelete}
//           onToggale={handleToggale}
//           open={open}
//           setOpen={setOpen}
//         />
//       )}
//     </div>
//   );
// };

// export default TripPage;

