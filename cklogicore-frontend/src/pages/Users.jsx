// UserPage.jsx
import React, { useState } from "react";
import CrudList from "../components/CrudList";
import { userFields } from "../utils/fieldsConfig";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../features/users/userApi";
import { FaPlus } from "react-icons/fa";

const UserPage = () => {
  const [open, setOpen] = useState(false);

  const { data = [], isLoading, isFetching } = useGetUsersQuery();

  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const handleCreate = async (form) => {
    try {
      await createUser(form).unwrap();
    } catch (err) {
      console.error("Create Error:", err);
    }
  };

  const handleUpdate = async (id, form) => {
    try {
      await updateUser({ id, body: form }).unwrap();
    } catch (err) {
      console.error("Update Error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id).unwrap();
      } catch (err) {
        console.error("Delete Error:", err);
      }
    }
  };

  return (
    <div className="w-full min-w-0 overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <button onClick={() => setOpen(true)} className="px-4 py-1 bg-blue-500 text-white rounded text-base flex justify-around items-center cursor-pointer"
        >
          <FaPlus size={12} className="mr-[2px]" /> Edit
        </button>
      </div>

      {isLoading || isFetching ? (
        <p>Loading...</p>
      ) : (
        <CrudList
          data={data}
          fields={userFields}
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

export default UserPage;
