// SupplierPage.jsx
import React, { useState } from "react";
import CrudList from "../components/CrudList";
import { supplierFields } from "../utils/fieldsConfig";
import {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} from "../features/suppliers/supplierApi";
import { FaPlus } from "react-icons/fa";

const SupplierPage = () => {
  const [open, setOpen] = useState(false);

  // 1️⃣ Fetch Suppliers
  const { data = [], isLoading, isFetching } = useGetSuppliersQuery();

  // 2️⃣ Mutations
  const [createSupplier] = useCreateSupplierMutation();
  const [updateSupplier] = useUpdateSupplierMutation();
  const [deleteSupplier] = useDeleteSupplierMutation();

  // 3️⃣ Handlers
  const handleCreate = async (form) => {
    try {
      await createSupplier(form).unwrap();
    } catch (err) {
      console.error("Create Error:", err);
    }
  };

  const handleUpdate = async (id, form) => {
    try {
      await updateSupplier({ id, body: form }).unwrap();
    } catch (err) {
      console.error("Update Error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        await deleteSupplier(id).unwrap();
      } catch (err) {
        console.error("Delete Error:", err);
      }
    }
  };

  return (
    <div className="w-full min-w-0 overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">Suppliers</h1>
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
          fields={supplierFields }
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

export default SupplierPage;