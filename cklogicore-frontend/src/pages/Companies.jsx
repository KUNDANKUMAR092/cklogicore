// src/pages/Companies.jsx

import { useState, useMemo } from "react";
import CrudList from "../components/CrudList";
import { companyFields } from "../utils/fieldsConfig";
import {
  useGetCompaniesQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useToggleCompanyMutation,
  useDeleteCompanyMutation,
} from "../features/companies/companyApi";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

const CompanyPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [open, setOpen] = useState(false);

  // API Call
  const { data, error, isLoading, isFetching } = useGetCompaniesQuery(
    { page, limit, search },
    { refetchOnMountOrArgChange: true, skip: !page }
  );

  const [createCompany] = useCreateCompanyMutation();
  const [updateCompany] = useUpdateCompanyMutation();
  const [toggleCompany] = useToggleCompanyMutation();
  const [deleteCompany] = useDeleteCompanyMutation();

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
    handleMutation(createCompany, form, "Company created successfully");

  const handleUpdate = (id, form) => 
    handleMutation(updateCompany, { id, body: form }, "Company updated successfully");

  const handleToggale = (id, status) => 
    handleMutation(toggleCompany, { id, isActive: status }, "Status updated");

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      handleMutation(deleteCompany, id, "Company deleted successfully");
    }
  };

  return (
    <div className="w-full min-w-0 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Companies</h1>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-1 bg-blue-500 text-white rounded flex items-center hover:bg-blue-600 transition disabled:opacity-50 cursor-pointer"
          disabled={isLoading}
        >
          <FaPlus size={12} className="mr-1" /> Add Companies
        </button>
      </div>

      <CrudList
        data={safeList}
        total={total}
        fields={companyFields}
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

export default CompanyPage;