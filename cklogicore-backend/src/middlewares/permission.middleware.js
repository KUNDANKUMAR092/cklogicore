// src/middlewares/permission.middleware.js
import StaffPermission from "../models/staffPermission.model.js";
import { ROLES } from "../constants/roles.js";

export const requirePermission = (permission) => {
  return async (req, res, next) => {
    // 🔥 ADMIN → ALL ACCESS
    if (req.user.role === ROLES.ADMIN) {
      return next();
    }

    const staffPerm = await StaffPermission.findOne({
      userId: req.user.userId,
      accountId: req.user.accountId
    });

    if (!staffPerm || !staffPerm.permissions.includes(permission)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    next();
  };
};
