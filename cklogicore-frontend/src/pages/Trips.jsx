// TripPage.jsx
import React, { useEffect, useState } from "react";
import CrudList from "../components/CrudList";
import CrudModal from "../components/CrudModal";
import {
  useGetTripsQuery,
  useCreateTripMutation,
  useUpdateTripMutation,
  useDeleteTripMutation,
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

const TripPage = () => {
  const [open, setOpen] = useState(false);

  const { data = [], isLoading, isFetching } = useGetTripsQuery();

  const [createTrip] = useCreateTripMutation();
  const [updateTrip] = useUpdateTripMutation();
  const [deleteTrip] = useDeleteTripMutation();

  // fetch related dropdowns
  const { data: suppliers = [] } = useGetSuppliersQuery();
  const { data: companies = [] } = useGetCompaniesQuery();
  const { data: vehicles = [] } = useGetVehiclesQuery();

  const handleCreate = async (form) => {
    try {
      await createTrip(form).unwrap();
    } catch (err) {
      console.error("Create Error:", err);
    }
  };

  const handleUpdate = async (id, form) => {
    try {
      await updateTrip({ id, body: form }).unwrap();
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
          <FaPlus size={12} className="mr-[2px]" /> Edit
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
          onDelete={handleDelete}
          open={open}
          setOpen={setOpen}
        />
      )}
    </div>
  );
};

export default TripPage;
