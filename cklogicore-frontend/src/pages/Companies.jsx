// CompanyPage.jsx
import React, { useState } from "react";
import CrudList from "../components/CrudList";
import { companyFields } from "../utils/fieldsConfig";
import {
  useGetCompaniesQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
} from "../features/companies/companyApi"; // similar to supplierApi
import { FaPlus } from "react-icons/fa";

const CompanyPage = () => {
  const [open, setOpen] = useState(false);

  const { data = [], isLoading, isFetching } = useGetCompaniesQuery();

  const [createCompany] = useCreateCompanyMutation();
  const [updateCompany] = useUpdateCompanyMutation();
  const [deleteCompany] = useDeleteCompanyMutation();

  const handleCreate = async (form) => {
    try {
      await createCompany(form).unwrap();
    } catch (err) {
      console.error("Create Error:", err);
    }
  };

  const handleUpdate = async (id, form) => {
    try {
      await updateCompany({ id, body: form }).unwrap();
    } catch (err) {
      console.error("Update Error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        await deleteCompany(id).unwrap();
      } catch (err) {
        console.error("Delete Error:", err);
      }
    }
  };

  return (
    <div className="w-full min-w-0 overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">Companies</h1>
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
          fields={companyFields}
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

export default CompanyPage;
