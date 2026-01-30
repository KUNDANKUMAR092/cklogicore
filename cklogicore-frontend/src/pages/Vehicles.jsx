// VehiclePage.jsx

import React, { useState, useMemo } from "react";
import CrudList from "../components/CrudList";
import { vehicleFields } from "../utils/fieldsConfig";
import {
  useGetVehiclesQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useToggleVehicleMutation,
} from "../features/vehicles/vehicleApi";

import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

const VehiclePage = () => {

  /* ================= FILTER + SEARCH + PAGINATION ================= */
  const [search, setSearch] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(4);
  
  const [open, setOpen] = useState(false);

  /* ================= API ================= */

  const {
    data = {},
    error,
    isLoading,
    isFetching,
  } = useGetVehiclesQuery(
    { page, limit, search },
    {
      refetchOnMountOrArgChange: true,
      skip: !page, // safety
    }
  );

  /* ================= Safe Data ================= */

  const safeList = useMemo(() => {
    return Array.isArray(data?.list) ? data.list : [];
  }, [data]);

  const total = Number(data?.total) || 0;

  const totalPages = Math.ceil(total / limit);

  /* ================= Mutations ================= */

  const [createVehicle] = useCreateVehicleMutation();
  const [updateVehicle] = useUpdateVehicleMutation();
  const [toggleVehicle] = useToggleVehicleMutation();

  /* ================= Handlers ================= */

  const handleCreate = async (form) => {
    try {
      if (!form || typeof form !== "object") {
        toast.error("Invalid form data");
        return;
      }

      await createVehicle(form).unwrap();

      toast.success("Vehicle created successfully");
      setOpen(false);
    } catch (err) {
      console.error("Create Error:", err);

      toast.error(
        err?.data?.message || "Failed to create vehicle"
      );
    }
  };

  const handleUpdate = async (id, form) => {
    try {
      if (!id || !form || typeof form !== "object") {
        toast.error("Invalid update data");
        return;
      }

      // ❌ Remove vehicleNumber
      const { vehicleNumber, ...payload } = form;

      await updateVehicle({
        id,
        body: payload,
      }).unwrap();

      toast.success("Vehicle updated successfully");
    } catch (err) {
      console.error("Update Error:", err);

      toast.error(
        err?.data?.message || "Update failed"
      );
    }
  };

  const handleToggale = async (id, status) => {
    try {
      if (!id || typeof status !== "boolean") {
        toast.error("Invalid toggle data");
        return;
      }

      await toggleVehicle({
        id,
        isActive: status,
      }).unwrap();

      toast.success("Status updated");
    } catch (err) {
      console.error("Toggle Error:", err);

      toast.error(
        err?.data?.message || "Toggle failed"
      );
    }
  };

  /* ================= UI ================= */

  return (
    <div className="w-full min-w-0 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">
          Vehicles
        </h1>

        <button
          onClick={() => setOpen(true)}
          disabled={isLoading}
          className="px-4 py-1 bg-blue-500 text-white rounded text-base flex items-center cursor-pointer disabled:opacity-50"
        >
          <FaPlus size={12} className="mr-[2px]" />
          Add
        </button>
      </div>

      {/* Loading */}
      {(isLoading || isFetching) && (
        <p className="text-gray-500">
          Loading...
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-500 mb-2">
          Failed to load vehicles. Please try again.
        </p>
      )}

      {/* Empty State */}
      {!isLoading &&
        !isFetching &&
        !error &&
        safeList.length === 0 && (
          <p className="text-gray-500">
            No vehicles found.
          </p>
        )}

      {/* List */}
      {!isLoading && !isFetching && safeList.length > 0 && (
        <CrudList
          data={safeList}
          fields={vehicleFields}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onEdit={true}
          onToggale={handleToggale}
          open={open}
          setOpen={setOpen}

          search={search}
          setSearch={setSearch}

          filterValue={filterValue}
          setFilterValue={setFilterValue}

          page={page}
          setPage={setPage}

          limit={limit}
          setLimit={setLimit}

          loading={isLoading || isFetching}
        />
      )}
    </div>
  );
};

export default VehiclePage;