// supplierStaff.controller.js
import User from "../models/user.model.js";
import StaffPermission from "../models/staffPermission.model.js";
import bcrypt from "bcryptjs";

export const createSupplierStaff = async (req, res) => {
  const { name, email, password, permissions } = req.body;

  const staff = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role: "STAFF",
    accountId: req.user.accountId,
    accountType: "SUPPLIER"
  });

  await StaffPermission.create({
    userId: staff._id,
    accountId: req.user.accountId,
    permissions
  });

  res.json({ message: "Supplier staff created" });
};
