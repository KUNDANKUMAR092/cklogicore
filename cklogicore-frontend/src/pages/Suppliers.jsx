// src/pages/Suppliers.jsx

import React, { useState, useMemo } from "react";
import CrudList from "../components/CrudList";
import { supplierFields } from "../utils/fieldsConfig";
import {
  useGetSuppliersQuery,
  useCreateSuppliersMutation,
  useUpdateSuppliersMutation,
  useToggleSuppliersMutation,
  useDeleteSuppliersMutation,
} from "../features/suppliers/supplierApi";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

const SupplierPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [open, setOpen] = useState(false);

  // API Call
  const { data, error, isLoading, isFetching } = useGetSuppliersQuery(
    { page, limit, search },
    { refetchOnMountOrArgChange: true, skip: !page }
  );

  const [createSuppliers] = useCreateSuppliersMutation();
  const [updateSuppliers] = useUpdateSuppliersMutation();
  const [toggleSuppliers] = useToggleSuppliersMutation();
  const [deleteSuppliers] = useDeleteSuppliersMutation();

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
    handleMutation(createSuppliers, form, "Suppliers created successfully");

  const handleUpdate = (id, form) => 
    handleMutation(updateSuppliers, { id, body: form }, "Suppliers updated successfully");

  const handleToggal = (id, status) => 
    handleMutation(toggleSuppliers, { id, isActive: status }, "Status updated");

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this suppliers?")) {
      handleMutation(deleteSuppliers, id, "Suppliers deleted successfully");
    }
  };

  return (
    <div className="w-full min-w-0 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-1 bg-blue-500 text-white rounded flex items-center hover:bg-blue-600 transition disabled:opacity-50"
          disabled={isLoading}
        >
          <FaPlus size={12} className="mr-1" /> Add
        </button>
      </div>

      <CrudList
        data={safeList}
        total={total}
        fields={supplierFields}
        isLoading={isLoading}
        isFetching={isFetching}
        loading={isFetching}
        error={error}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onToggale={handleToggal}
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

export default SupplierPage;