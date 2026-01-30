import { ACCOUNT_TYPES } from "../constants/accountTypes.js";
import { ROLES } from "../constants/roles.js";

export const authorize = ({
  roles = [],
  permissions = [],
  blockVehicle = false
} = {}) => {

  return (req, res, next) => {
    try {

      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { role, accountType } = user;

      /* ❌ Block VEHICLE account (optional) */
      if (blockVehicle && accountType === ACCOUNT_TYPES.VEHICLE) {
        return res.status(403).json({
          message: "Vehicle account restricted"
        });
      }

      /* ✅ Role check */
      if (roles.length && !roles.includes(role)) {
        return res.status(403).json({
          message: "Role not allowed"
        });
      }

      /* ✅ ADMIN bypass */
      if (role === ROLES.ADMIN) {
        return next();
      }

      /* ✅ Permission check */
      if (permissions.length) {

        const hasPermission = permissions.some(
          (p) => user.permissions?.[p] === true
        );

        if (!hasPermission) {
          return res.status(403).json({
            message: "Permission denied"
          });
        }
      }

      next();

    } catch (err) {
      console.error("Authorize Error:", err);

      return res.status(500).json({
        message: "Authorization failed"
      });
    }
  };
};
