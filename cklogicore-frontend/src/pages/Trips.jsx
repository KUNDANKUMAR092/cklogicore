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

  const buildTripPayload = (form) => ({
    accountId: user.accountId,
    createdByUserId: user._id,
    supplierId: form.supplierId?._id || form.supplierId,
    companyId: form.companyId?._id || form.companyId,
    vehicleId: form.vehicleId?._id || form.vehicleId,
    tripDate: form.tripDate,
    loadingPoint: form.loadingPoint,
    unloadingPoint: form.unloadingPoint,
    totalTonLoad: Number(form.totalTonLoad),
    rates: {
      companyRatePerTon: Number(form.rates?.companyRatePerTon || form.companyRatePerTon || 0),
      vehicleRatePerTon: Number(form.rates?.vehicleRatePerTon || form.vehicleRatePerTon || 0),
    },
    financials: {
      freightAmount: Number(form.financials?.freightAmount || form.freightAmount || 0),
      advancePaid: Number(form.financials?.advancePaid || form.advancePaid || 0),
      dieselCost: Number(form.financials?.dieselCost || form.dieselCost || 0),
      tollCost: Number(form.financials?.tollCost || form.tollCost || 0),
      driverExpense: Number(form.financials?.driverExpense || form.driverExpense || 0),
      otherExpense: Number(form.financials?.otherExpense || form.otherExpense || 0),
    },
    status: form.status || "pending",
  });

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
  const fieldsWithDropdowns = useMemo(() => {
    return tripFields.map((f) => {
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
      return f;
    });
  }, [supplierData, companyData, vehicleData]);

  return (
    <div className="w-full min-w-0 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Trips</h1>
        <button onClick={() => setOpen(true)} className="px-4 py-1 bg-blue-500 text-white rounded flex items-center hover:bg-blue-600 transition">
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

