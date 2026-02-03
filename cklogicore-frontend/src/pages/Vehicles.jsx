// src/pages/VehiclePage.jsx

import { useState, useMemo } from "react";
import CrudList from "../components/CrudList";
import { vehicleFields } from "../utils/fieldsConfig";
import {
  useGetVehiclesQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useToggleVehicleMutation,
  useDeleteVehicleMutation,
} from "../features/vehicles/vehicleApi";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

const VehiclePage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [open, setOpen] = useState(false);

  // API Call
  const { data, error, isLoading, isFetching } = useGetVehiclesQuery(
    { page, limit, search },
    { refetchOnMountOrArgChange: true, skip: !page }
  );

  const [createVehicle] = useCreateVehicleMutation();
  const [updateVehicle] = useUpdateVehicleMutation();
  const [toggleVehicle] = useToggleVehicleMutation();
  const [deleteVehicle]  = useDeleteVehicleMutation();

  // Data Memoization
  const { safeList, total } = useMemo(() => ({
    safeList: Array.isArray(data?.list) ? data.list : [],
    total: Number(data?.total) || 0
  }), [data]);

  /* ================= GENERIC HANDLERS ================= */
  
  const handleMutation = async (mutationFn, payload, successMsg) => {
    try {
      await mutationFn(payload).unwrap();
      toast.success(successMsg);
      if (open) setOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Operation failed");
    }
  };

  const handleCreate = (form) => 
    handleMutation(createVehicle, form, "Vehicle created successfully");

  const handleUpdate = (id, form) => {
    const { vehicleNumber, ...payload } = form; 
    handleMutation(updateVehicle, { id, body: payload }, "Vehicle updated successfully");
  };

  const handleToggale = (id, status) => 
    handleMutation(toggleVehicle, { id, isActive: status }, "Status updated");
  
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      handleMutation(deleteVehicle,  id,  "Vehicle deleted successfully" );
    }
  };

  return (
    <div className="w-full min-w-0 overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Vehicles</h1>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-1 bg-blue-500 text-white rounded flex items-center hover:bg-blue-600 transition disabled:opacity-50 cursor-pointer"
          disabled={isLoading}
        >
          <FaPlus size={12} className="mr-1" /> Add Vehicles
        </button>
      </div>

      <CrudList
        data={safeList}
        total={total}
        fields={vehicleFields}
        isLoading={isLoading}
        isFetching={isFetching}
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

export default VehiclePage;