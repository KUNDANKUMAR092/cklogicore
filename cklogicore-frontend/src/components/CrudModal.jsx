// CrudModal.jsx
import React, { useState, useEffect } from "react";
import CrudForm from "./CrudForm";
import { toInputDate } from "../utils/reUseableFn";

/* ================================
   Safe Helper Function
================================ */
const isValidObject = (obj) => obj && typeof obj === "object" && !Array.isArray(obj);

const CrudModal = ({ open, setOpen, fields = [], data, onSubmit }) => {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================================
     Handle Incoming Data Safely
  ================================ */
  useEffect(() => {
    let safeForm = {};

    if (data) {
      // 1. Edit Mode: Purana data load karein
      safeForm = { ...data };
    } else {
      // 2. Add Mode: Default values (Supplier/Company Name) set karein
      fields.forEach((f) => {
        if (f.disabled && f.defaultValue) {
          safeForm[f.name] = f.defaultValue;
        }
      });
    }

    // 3. Date Handling (Sabhi Modules ke liye)
    fields.forEach((field) => {
      if (field.type === "date") {
        if (safeForm[field.name]) {
          // Agar date pehle se hai (Edit mode), to use format karein
          safeForm[field.name] = toInputDate(safeForm[field.name]);
        } else {
          // Agar date nahi hai (Add mode), to Aaj ki date set karein
          safeForm[field.name] = toInputDate(new Date());
        }
      }
    });

    setForm(safeForm);
  }, [data, fields, open]);

  
  /* ================================
     Close Modal Protection
  ================================ */
  if (!open) return null;

  /* ================================
     Form Validation
  ================================ */
  const validateForm = () => {
    if (!isValidObject(form) || Object.keys(form).length === 0) {
      setError("Please fill the form");
      return false;
    }
    return true;
  };

  /* ================================
     Submit Handler (Safe)
  ================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    if (typeof onSubmit !== "function") {
      setError("Submit handler not found");
      return;
    }

    try {
      setLoading(true);
      await onSubmit(form);
      setOpen(false); // close on success
    } catch (err) {
      console.error("Submit Error:", err);
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     Safe Close
  ================================ */
  const handleClose = () => {
    setForm({});
    setError("");
    setOpen(false);
  };

  /* ================================
     UI
  ================================ */
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">

        {/* Title */}
        <h2 className="text-xl font-bold mb-4">
          {isValidObject(data) ? "Edit" : "Add"}
        </h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <CrudForm
            form={form}
            setForm={setForm}
            fields={Array.isArray(fields) ? fields : []}
          />

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded text-white ${
                loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading
                ? "Please wait..."
                : isValidObject(data)
                ? "Update"
                : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrudModal;