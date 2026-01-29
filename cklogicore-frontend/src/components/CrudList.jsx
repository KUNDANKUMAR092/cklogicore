import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa"
import { formatDate } from "../utils/reUseableFn";
import CrudModal from "./CrudModal";

export default function CrudList({ data = [], fields = [], onCreate, onUpdate, onDelete, onEdit,   open, setOpen }) {
  const [editData, setEditData] = useState(null);

  // Get nested value (supports: rates.companyRatePerTon etc)
  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
  };

  // Safe render value
  const renderValue = (row, field) => {
    const value = getNestedValue(row, field.name);

    if (value === null || value === undefined) return "-";

    // 👉 Handle Date
    if (field.type === "date") {
      return formatDate(value);
    }

    // 👉 Handle Object
    if (typeof value === "object") {
      return (
        value.vehicleNumber ||
        value.name ||
        value.title ||
        "-"
      );
    }

    // 👉 Handle Boolean
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    // 👉 Default
    return value;
  };

  // const renderValue = (row, field) => {
  //   const value = getNestedValue(row, field.name);

  //   if (value === null || value === undefined) return "-";

  //   if (typeof value === "object") {
  //     // return value.name || JSON.stringify(value);
  //     return value?.vehicleNumber ? value?.vehicleNumber : value.name || JSON.stringify(value);
  //   }

  //   return value;
  // };

  /* ============================
      MOBILE CARD VIEW
  ============================ */
  const MobileView = () => (
    <div className="space-y-4 md:hidden">
      {data.map((row) => (
        <div
          key={row._id}
          className="bg-white border rounded-lg p-4 shadow-sm"
        >
          {fields.map((field) => (
            <div
              key={field.name}
              className="flex justify-between text-sm py-1 border-b last:border-b-0"
            >
              <span className="font-medium text-gray-600">
                {field.label}
              </span>

              <span className="text-gray-800 text-right max-w-[60%] break-words">
                {renderValue(row, field)}
              </span>
            </div>
          ))}

          {/* {(onEdit || onDelete) && ( */}
            <div className="flex gap-3 mt-3 justify-end">
              {onEdit && (
                <button
                  onClick={() => {setEditData(row); setOpen(true)}}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  Edit
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => onDelete(row._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          {/* )} */}
        </div>
      ))}
    </div>
  );

/* ============================
    DESKTOP TABLE VIEW
============================ */
const DesktopView = () => {
  const middleFields = fields.slice(1, fields.length);

  return (
    <div className="hidden md:block w-full border rounded bg-white overflow-hidden">

      {/* Main Wrapper */}
      <div className="flex w-full max-w-full">

        {/* ============ LEFT FIXED ============ */}
        <div className="min-w-[180px] shrink-0 border-r bg-white z-20">

          {/* Header */}
          <div className="bg-gray-100 font-semibold px-3 py-2 border-b">
            {fields[0]?.label}
          </div>

          {/* Body */}
          {data.map((row) => (
            <div
              key={row._id}
              className="px-3 py-2 text-sm border-b whitespace-nowrap pt-3 min-h-[40px]"
            >
              {renderValue(row, fields[0])}
            </div>
          ))}
        </div>


        {/* ============ CENTER SCROLL ============ */}
        <div className="flex-1 min-w-0 overflow-x-auto">
          <div style={{
              width: `${middleFields.length * 180}px`,
              maxWidth: "calc(100vw - 675px)",
              minWidth: "calc(100%)"
            }}>
            <div className="min-w-max" >

              {/* Header */}
              <div className="min-w-max flex bg-gray-100 font-semibold border-b sticky top-0 pt-1 z-10">

                {middleFields.map((f) => (
                  <div
                    key={f.name}
                    className="min-w-[180px] flex-1 px-3 py-2 font-semibold text-sm whitespace-nowrap"
                  >
                    {f.label}
                  </div>
                ))}

              </div>


              {/* Body */}
              {data.map((row) => (
                <div
                  key={row._id}
                  className="min-w-max flex border-b hover:bg-gray-50"
                >

                  {middleFields.map((f) => (
                    <div
                      key={f.name}
                      className="min-w-[180px] flex-1 px-3 py-2 text-sm whitespace-nowrap min-h-[40px]"
                    >
                      {renderValue(row, f)}
                    </div>
                  ))}

                </div>
              ))}

            </div>
          </div>
        </div>


        {/* ============ RIGHT FIXED ============ */}
        {/* {(onEdit || onDelete) && ( */}
          <div className="w-[140px] shrink-0 border-l bg-white z-20">

            {/* Header */}
            <div className="bg-gray-100 font-semibold px-3 py-2 border-b">
              Actions
            </div>

            {/* Body */}
            {data.map((row) => (
              <div
                key={row._id}
                className="px-2 py-2 border-b flex gap-2"
              >

                {onEdit && (
                  <button
                    onClick={() => {setEditData(row); setOpen(true)}}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs flex justify-around items-center cursor-pointer"
                  >
                    <FaEdit size={12} className="mr-[2px]" /> Edit
                  </button>
                )}

                {onDelete && (
                  <button
                    onClick={() => onDelete(row._id)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs flex justify-around items-center cursor-pointer"
                  >
                    <FaTrash size={10} className="mr-[2px]" /> Delete
                  </button>
                )}

              </div>
            ))}

          </div>
        {/* )} */}

      </div>
    </div>
  );
};







  /* ============================
      MAIN RENDER
  ============================ */
  return (
    <>
    <div className="w-full min-w-0 overflow-hidden">

      {/* Mobile */}
      <MobileView />

      {/* Desktop */}
      <DesktopView />

    </div>

    {open && (
      <CrudModal
        open={open}
        setOpen={setOpen}
        fields={fields}
        data={editData}
        onSubmit={(form) => {
          if (editData) onUpdate(editData._id, form);
          else onCreate(form);
          setOpen(false);
          setEditData(null);
        }}
      />
    )}
    </>
  );
}