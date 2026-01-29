// CrudModal.jsx
import React, { useState, useEffect } from "react";
import CrudForm from "./CrudForm";

const CrudModal = ({ open, setOpen, fields, data, onSubmit }) => {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (data) setForm(data);
    else setForm({});
  }, [data]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
        <h2 className="text-xl font-bold mb-4">{data ? "Edit" : "Add"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <CrudForm form={form} setForm={setForm} fields={fields} />

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {data ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrudModal;
