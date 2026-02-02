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

import { getTripFields } from "../utils/fieldsConfig";
import { FaPlus } from "react-icons/fa";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const TripPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { entityId } = useSelector((state) => state.auth);
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

  const buildTripPayload = (form) => {
    const formData = new FormData();

    // 1. Basic Fields (Strings and Numbers)
    formData.append("tripDate", form.tripDate || new Date().toISOString());
    formData.append("loadingPoint", form.loadingPoint || "");
    formData.append("unloadingPoint", form.unloadingPoint || "");
    formData.append("totalTonLoad", form.totalTonLoad || 0);
    formData.append("status", form.status || "pending");
    
    if (form.tripId) formData.append("tripId", form.tripId);

    // 2. IDs Extraction (Ensuring only String IDs are sent)
    // Zod regex string expect karta hai, object nahi.
    const sId = user?.accountType === "SUPPLIER" ? entityId : (form.supplierId?._id || form.supplierId);
    const cId = user?.accountType === "COMPANY" ? entityId : (form.companyId?._id || form.companyId);
    const vId = user?.accountType === "VEHICLE" ? entityId : (form.vehicleId?._id || form.vehicleId);
    
    formData.append("supplierId", sId || "");
    formData.append("companyId", cId || "");
    formData.append("vehicleId", vId || "");

    // 3. Nested Rates Handling
    // Backend par rates.companyRatePerTon ban jayega
    if (form.rates) {
      Object.keys(form.rates).forEach((key) => {
        const val = form.rates[key] || 0;
        formData.append(`rates[${key}]`, val);
      });
    }

    // 4. Nested Financials Handling
    if (form.financials) {
      Object.keys(form.financials).forEach((key) => {
        const val = form.financials[key] || 0;
        formData.append(`financials[${key}]`, val);
      });
    }

    // 5. Files Handling (Challans)
    // Agar CrudList ne files 'form.challans' me di hain
    if (form.challans && Array.isArray(form.challans)) {
      form.challans.forEach((file) => {
        if (file instanceof File) {
          formData.append("challans", file);
        }
      });
    }

    return formData;
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

  // TripPage.jsx mein useMemo wala part update karein
  const fieldsWithDropdowns = useMemo(() => {
    const role = user?.accountType?.toLowerCase();
    const baseFields = getTripFields(role, entityId);

    return baseFields.map((f) => {
      let options = [];

      // 1. Supplier Data Extraction
      if (f.name === "supplierId") {
        const list = supplierData?.list || (Array.isArray(supplierData) ? supplierData : []);
        options = list.map(s => ({ 
          label: s.name || s.companyName || "Unknown Supplier", 
          value: s._id 
        }));
      }
      
      // 2. Company Data Extraction
      if (f.name === "companyId") {
        const list = companyData?.list || (Array.isArray(companyData) ? companyData : []);
        options = list.map(c => ({ 
          label: c.name || "Unknown Company", 
          value: c._id 
        }));
      }

      // 3. Vehicle Data Extraction
      if (f.name === "vehicleId") {
        const list = vehicleData?.list || (Array.isArray(vehicleData) ? vehicleData : []);
        options = list.map(v => ({ 
          label: v.vehicleNumber || v.name || "Unknown Vehicle", 
          value: v._id 
        }));
      }

      // Status is already handled in config
      if (f.name === "status") return f;

      // Return field with the extracted options
      return { 
        ...f, 
        options: options.length > 0 ? options : (f.options || []) 
      };
    });
  }, [supplierData, companyData, vehicleData, user, open]);

  const handleAddClick = () => {
    const initialFormValues = {};

    // 🔥 Yahan hum entityId set karenge taki dropdown use auto-select kar sake
    if (user?.accountType === "SUPPLIER") {
      initialFormValues.supplierId = entityId; 
    } else if (user?.accountType === "COMPANY") {
      initialFormValues.companyId = entityId;
    } else if (user?.accountType === "VEHICLE") {
      initialFormValues.vehicleId = entityId;
    }

    setOpen(true);
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