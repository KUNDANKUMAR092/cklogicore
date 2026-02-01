import React, { useState, useMemo } from "react";
import CrudList from "../components/CrudList";
import { userFields } from "../utils/fieldsConfig"; // Fields wahi rahenge jo users ke liye the
import {
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
} from "../features/staff/staffApi";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

const StaffListPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(4);
  const [open, setOpen] = useState(false);

  // 1. API Call (staffApi use kar rahe hain)
  const { data, error, isLoading, isFetching } = useGetStaffQuery(
    { page, limit, search },
    { refetchOnMountOrArgChange: true, skip: !page }
  );

  const [createStaff] = useCreateStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();
  const [deleteStaff] = useDeleteStaffMutation();

  // 2. Data Memoization
  const { safeList, total } = useMemo(() => ({
    safeList: Array.isArray(data?.list) ? data.list : [],
    total: Number(data?.total) || 0
  }), [data]);

  /* ================= GENERIC HANDLER ================= */
  
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
    handleMutation(createStaff, form, "Staff member added successfully");

  const handleUpdate = (id, form) => {
    // Agar edit mode mein password nahi bhejna hai toh yahan delete kar sakte hain
    const payload = { ...form };
    if (!payload.password) delete payload.password; 
    
    handleMutation(updateStaff, { id, body: payload }, "Staff details updated");
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      handleMutation(deleteStaff, id, "Staff member removed");
    }
  };

  return (
    <div className="w-full min-w-0 overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Staff Directory</h1>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-1 bg-blue-500 text-white rounded flex items-center hover:bg-blue-600 transition disabled:opacity-50"
          disabled={isLoading}
        >
          <FaPlus size={12} className="mr-1" /> Add Staff
        </button>
      </div>

      {/* Standard CrudList Component */}
      <CrudList
        data={safeList}
        total={total}
        fields={userFields}
        isLoading={isLoading}
        error={error}
        loading={isFetching}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
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

export default StaffListPage;