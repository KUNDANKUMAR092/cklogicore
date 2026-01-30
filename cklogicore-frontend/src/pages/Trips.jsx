// TripPage.jsx
import React, { useEffect, useState } from "react";
import CrudList from "../components/CrudList";
import CrudModal from "../components/CrudModal";
import {
  useGetTripsQuery,
  useCreateTripMutation,
  useUpdateTripMutation,
  useToggleTripMutation,
} from "../features/trips/tripApi";

import {
  useGetSuppliersQuery,
} from "../features/suppliers/supplierApi";

import {
  useGetCompaniesQuery,
} from "../features/companies/companyApi";

import {
  useGetVehiclesQuery,
} from "../features/vehicles/vehicleApi";

import { tripFields } from "../utils/fieldsConfig";
import { FaPlus } from "react-icons/fa";
import { useSelector } from "react-redux";

const TripPage = () => {
  const { user } = useSelector((state) => state.auth)
  const [open, setOpen] = useState(false);

  const { data = [], isLoading, isFetching } = useGetTripsQuery();
  const [createTrip] = useCreateTripMutation();
  const [updateTrip] = useUpdateTripMutation();
  const [toggleTrip] = useToggleTripMutation();

  console.log(useGetVehiclesQuery())

  // fetch related dropdowns
  const { data: suppliers = [] } = useGetSuppliersQuery();
  const { data: companies = [] } = useGetCompaniesQuery();
  const { vehiclesList } = useGetVehiclesQuery();
  const vehicles = vehiclesList?.list || [];


  const buildTripPayload = (form, accountId, userId) => {
    return {
      // ===== REQUIRED IDS =====
      accountId,
      createdByUserId: userId,

      supplierId: form.supplierId?._id || form.supplierId,
      companyId: form.companyId?._id || form.companyId,
      vehicleId: form.vehicleId?._id || form.vehicleId,

      // ===== BASIC =====
      tripDate: form.tripDate ? new Date(form.tripDate) : null,

      loadingPoint: form.loadingPoint,
      unloadingPoint: form.unloadingPoint,

      totalTonLoad: Number(form.totalTonLoad),

      // ===== RATES =====
      rates: {
        companyRatePerTon: Number(
          form.rates?.companyRatePerTon || form.companyRatePerTon || 0
        ),

        vehicleRatePerTon: Number(
          form.rates?.vehicleRatePerTon || form.vehicleRatePerTon || 0
        ),
      },

      // ===== FINANCIALS =====
      financials: {
        freightAmount: Number(
          form.financials?.freightAmount || form.freightAmount || 0
        ),

        advancePaid: Number(
          form.financials?.advancePaid || form.advancePaid || 0
        ),

        dieselCost: Number(
          form.financials?.dieselCost || form.dieselCost || 0
        ),

        tollCost: Number(
          form.financials?.tollCost || form.tollCost || 0
        ),

        driverExpense: Number(
          form.financials?.driverExpense || form.driverExpense || 0
        ),

        otherExpense: Number(
          form.financials?.otherExpense || form.otherExpense || 0
        ),
      },

      // ===== OPTIONAL =====
      status: form.status || "pending",
      profit: Number(form.profit || 0),
    };
  };


  const handleCreate = async (form) => {
    console.log(form)
    try {
      const payload = buildTripPayload(
        form,
        user.accountId,   // from auth
        user._id          // from auth
      );
      await createTrip(payload).unwrap();
    } catch (err) {
      console.error("Create Error:", err);
    }
  };

  const handleUpdate = async (id, form) => {
    try {
      const payload = buildTripPayload(
        form,
        user.accountId,
        user._id
      );
      await updateTrip({ id, body: payload }).unwrap();
    } catch (err) {
      console.error("Update Error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      try {
        await deleteTrip(id).unwrap();
      } catch (err) {
        console.error("Delete Error:", err);
      }
    }
  };

  const handleToggale = async (id, status) => {
    try {
      await toggleTrip({
        id,
        isDeleted: status, // backend field
      }).unwrap();

    } catch (err) {
      console.error("Toggle Error:", err);
    }
  };

  // Extend tripFields dynamically for dropdowns
  const fieldsWithDropdowns = tripFields.map((f) => {
    if (f.name === "supplierId") return { ...f, options: suppliers.map(s => ({ label: s.name, value: s._id })), type: "select" };
    if (f.name === "companyId") return { ...f, options: companies.map(c => ({ label: c.name, value: c._id })), type: "select" };
    if (f.name === "vehicleId") return { ...f, options: vehicles.map(v => ({ label: v.vehicleNumber, value: v._id })), type: "select" };
    return f;
  });

  return (
    <div className="w-full min-w-0 overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">Trips</h1>
        <button onClick={() => setOpen(true)} className="px-4 py-1 bg-blue-500 text-white rounded text-base flex justify-around items-center cursor-pointer"
        >
          <FaPlus size={12} className="mr-[2px]" /> Add
        </button>
      </div>

      {isLoading || isFetching ? (
        <p>Loading...</p>
      ) : (
        <CrudList
          data={data}
          fields={fieldsWithDropdowns}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onEdit={true}
          // onDelete={handleDelete}
          onToggale={handleToggale}
          open={open}
          setOpen={setOpen}
        />
      )}
    </div>
  );
};

export default TripPage;

