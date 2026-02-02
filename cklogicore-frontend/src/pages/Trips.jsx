// TripPage.jsx

import React, { useState, useMemo } from "react";
import CrudList from "../components/CrudList";
import {
  useGetTripsQuery,
  useCreateTripMutation,
  useUpdateTripMutation,
  useToggleTripMutation,
  useDeleteTripMutation,
  useUpdateWorkflowMutation,
  useAddChallansMutation,
  useRemoveChallanMutation,
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
  const [updateWorkflow] = useUpdateWorkflowMutation();
  const [addChallans] = useAddChallansMutation();
  const [removeChallan] = useRemoveChallanMutation();

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

  // const buildTripPayload = (form) => {
  //   const formData = new FormData();

  //   // 1. Basic Fields (Strings and Numbers)
  //   formData.append("tripDate", form.tripDate || new Date().toISOString());
  //   formData.append("loadingPoint", form.loadingPoint || "");
  //   formData.append("unloadingPoint", form.unloadingPoint || "");
  //   formData.append("totalTonLoad", form.totalTonLoad || 0);
  //   formData.append("status", form.status || "pending");
    
  //   if (form.tripId) formData.append("tripId", form.tripId);

  //   // 2. IDs Extraction (Ensuring only String IDs are sent)
  //   // Zod regex string expect karta hai, object nahi.
  //   const sId = user?.accountType === "SUPPLIER" ? entityId : (form.supplierId?._id || form.supplierId);
  //   const cId = user?.accountType === "COMPANY" ? entityId : (form.companyId?._id || form.companyId);
  //   const vId = user?.accountType === "VEHICLE" ? entityId : (form.vehicleId?._id || form.vehicleId);
    
  //   formData.append("supplierId", sId || "");
  //   formData.append("companyId", cId || "");
  //   formData.append("vehicleId", vId || "");

  //   // 3. Nested Rates Handling
  //   // Backend par rates.companyRatePerTon ban jayega
  //   if (form.rates) {
  //     Object.keys(form.rates).forEach((key) => {
  //       const val = form.rates[key] || 0;
  //       formData.append(`rates[${key}]`, val);
  //     });
  //   }

  //   // 4. Nested Financials Handling
  //   if (form.financials) {
  //     Object.keys(form.financials).forEach((key) => {
  //       const val = form.financials[key] || 0;
  //       formData.append(`financials[${key}]`, val);
  //     });
  //   }

  //   // 5. Files Handling (Challans)
  //   // Agar CrudList ne files 'form.challans' me di hain
  //   if (form.challans && Array.isArray(form.challans)) {
  //     form.challans.forEach((file) => {
  //       if (file instanceof File) {
  //         formData.append("challans", file);
  //       }
  //     });
  //   }

  //   return formData;
  // };

  // const buildTripPayload = (form) => {
  //   const formData = new FormData();

  //   // 1. Basic Fields
  //   formData.append("tripDate", form.tripDate || new Date().toISOString());
  //   formData.append("loadingPoint", form.loadingPoint || "");
  //   formData.append("unloadingPoint", form.unloadingPoint || "");
  //   formData.append("totalTonLoad", form.totalTonLoad || 0);
  //   formData.append("status", form.status || "pending");
  //   if (form._id) formData.append("tripId", form._id);

  //   // 2. ID Extraction (Refined)
  //   const getID = (val) => (typeof val === 'object' ? val?._id : val) || "";
    
  //   formData.append("supplierId", user?.accountType === "SUPPLIER" ? entityId : getID(form.supplierId));
  //   formData.append("companyId", user?.accountType === "COMPANY" ? entityId : getID(form.companyId));
  //   formData.append("vehicleId", user?.accountType === "VEHICLE" ? entityId : getID(form.vehicleId));

  //   // 3. Nested Objects (Rates & Financials)
  //   // Backend standard: 'rates.companyRatePerTon' format for nested multer handling
  //   if (form.rates) {
  //     Object.entries(form.rates).forEach(([key, val]) => {
  //       formData.append(`rates.${key}`, val || 0);
  //     });
  //   }
  //   if (form.financials) {
  //     Object.entries(form.financials).forEach(([key, val]) => {
  //       formData.append(`financials.${key}`, val || 0);
  //     });
  //   }

  //   // 4. Files Handling (Challans)
  //   if (form.challans && Array.isArray(form.challans)) {
  //     form.challans.forEach((file) => {
  //       // Agar purani image URL hai toh ignore karein, sirf new File objects append karein
  //       if (file instanceof File) {
  //         formData.append("challans", file);
  //       }
  //     });
  //   }

  //   return formData;
  // };


  const buildTripPayload = (form) => {
    const formData = new FormData();

    // 1. Basic & ID Fields Handling
    const basicFields = [
      "tripDate", "loadingPoint", "unloadingPoint", 
      "totalTonLoad", "status", "tripId", "_id"
    ];
    
    basicFields.forEach(key => {
      if (form[key] !== undefined) formData.append(key, form[key]);
    });

    // 2. ID Extraction (Refined)
    const getID = (val) => (typeof val === 'object' ? val?._id : val) || "";
    formData.append("supplierId", getID(form.supplierId));
    formData.append("companyId", getID(form.companyId));
    formData.append("vehicleId", getID(form.vehicleId));

    // 3. Nested Data Handling (Rates & Financials)
    // Hum poore 'form' object ko scan karenge un keys ke liye jinme '.' hai
    Object.keys(form).forEach(key => {
      // Agar key direct 'rates.xxx' format mein hai (jo CrudForm se aa sakti hai)
      if (key.includes('.')) {
        formData.append(key, form[key]);
      } 
      // Agar key object hai (jo initial state se aa sakti hai)
      else if ((key === 'rates' || key === 'financials') && typeof form[key] === 'object') {
        Object.entries(form[key]).forEach(([subKey, val]) => {
          formData.append(`${key}.${subKey}`, val || 0);
        });
      }
    });

    // 4. Files Handling
    if (form.challans && Array.isArray(form.challans)) {
      form.challans.forEach((file) => {
        if (file instanceof File) formData.append("challans", file);
      });
    }

    return formData;
  };

  // const handleCreate = (form) => 
  //   handleMutation(createTrip, buildTripPayload(form), "Trip created successfully");

  // const handleUpdate = (id, form) => 
  //   handleMutation(updateTrip, { id, body: buildTripPayload(form) }, "Trip updated successfully");

  // TripPage.jsx

  // const handleUpdate = async (id, form) => {
  //   try {
  //     // 1. Payload build karein (vahi function jo create mein use kiya)
  //     const payload = buildTripPayload(form);

  //     // 2. Mutation call karein (id aur body dono bhej rahe hain)
  //     await updateTrip({ id, body: payload }).unwrap();
      
  //     toast.success("Trip updated successfully");
  //     setOpen(false);
  //   } catch (err) {
  //     toast.error(err?.data?.message || "Update failed");
  //   }
  // };

  const handleCreate = async (form) => {
    try {
      // 1. Data se challans hata kar pehle Trip create karein
      const payload = buildTripPayload(form);
      payload.delete("challans"); 

      const result = await createTrip(payload).unwrap();
      const newTripId = result.data?._id;

      // 2. Identify strictly NEW files (Sirf naye File objects)
      const newFiles = Array.isArray(form.challans) 
        ? form.challans.filter(f => f instanceof File) 
        : [];

      console.log(form, newTripId, newFiles)
      // 3. Agar data hai, tabhi addChallans API call hogi
      if (newFiles.length > 0 && newTripId) {
        // Aapki API ({ id, files }) format mang rahi hai
        await addChallans({ id: newTripId, files: newFiles }).unwrap();
      }

      toast.success("Trip created successfully!");
      setOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Create failed");
    }
  };

  const handleUpdate = async (id, form) => {
    try {
      // 1. Basic Update (JSON/FormData bina files ke)
      const payload = buildTripPayload(form);
      payload.delete("challans");
      await updateTrip({ id, body: payload }).unwrap();

      // 2. Check for NEWLY selected files only
      const newFiles = Array.isArray(form.challans) 
        ? form.challans.filter(f => f instanceof File) 
        : [];

      // 3. API tabhi trigger hogi jab koi naya file select hua ho
      if (newFiles.length > 0) {
        await addChallans({ id, files: newFiles }).unwrap();
      }

      toast.success("Trip updated!");
      setOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

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

  // const handleRemoveChallan = async (tripId, challanId) => {
  //   if (window.confirm("Permanent delete this challan?")) {
  //     try {
  //       await removeChallan({ id: tripId, challanId }).unwrap();
  //       toast.success("Challan deleted");
  //     } catch (err) {
  //       toast.error(err?.data?.message || "Delete failed");
  //     }
  //   }
  // };

  // TripPage.jsx mein ye function update karein
  const handleRemoveChallan = async (tripId, challanId, setForm) => {
    if (window.confirm("Are you sure you want to delete this challan?")) {
      try {
        // 1. API Call
        await removeChallan({ id: tripId, challanId }).unwrap();
        
        // 2. 🔥 Local State Update (Modal close kiye bina UI sync karne ke liye)
        if (setForm) {
          setForm((prev) => ({
            ...prev,
            challans: prev.challans.filter((c) => c._id !== challanId),
          }));
        }
        
        toast.success("Challan deleted successfully");
      } catch (err) {
        toast.error(err?.data?.message || "Failed to delete challan");
      }
    }
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
        // onRemoveChallan={handleRemoveChallan}
        onRemoveChallan={(tripId, challanId, setForm) => handleRemoveChallan(tripId, challanId, setForm)}
      />
    </div>
  );
};

export default TripPage;