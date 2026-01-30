// middlewares/accountPermission.middleware.js

import { ROLES } from "../constants/roles.js";

/**
 * Account + Role + Permission Checker
 */
export const checkPermission = ({
  allowFor = [], // kaunse accountType ke liye allowed
  allowedRoles = [],
  requiredPermission = null,
}) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { role, accountType, permissions } = user;

      /* ================= ADMIN = FULL ACCESS ================= */
      if (role === ROLES.ADMIN) {
        return next();
      }

      /* ================= ROLE CHECK ================= */
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({
          message: "Role not allowed",
        });
      }

      /* ================= ACCOUNT TYPE CHECK ================= */
      if (!allowFor.includes(accountType)) {
        return res.status(403).json({
          message: `${accountType} cannot perform this action`,
        });
      }

      /* ================= STAFF PERMISSION CHECK ================= */
      if (role === ROLES.STAFF && requiredPermission) {
        if (!permissions?.[requiredPermission]) {
          return res.status(403).json({
            message: "Permission denied by admin",
          });
        }
      }

      next();
    } catch (err) {
      console.error("Permission error:", err);
      return res.status(500).json({ message: "Permission error" });
    }
  };
};







// 

// import { ACCOUNT_TYPES } from "../constants/accountTypes.js";
// import { ROLES } from "../constants/roles.js";

// /**
//  * Generic middleware to check account type and permissions
//  * 
//  * @param {Object} options
//  *   - blockedAccountTypes: array of account types which cannot perform action
//  *   - allowedRoles: array of roles which can perform action
//  *   - requiredPermission: permission key to check for STAFF
//  */
// export const checkPermission = ({ blockedAccountTypes = [], allowedRoles = [], requiredPermission = null }) => {
//   return (req, res, next) => {
//     try {
//       const user = req.user;

//       if (!user) {
//         return res.status(401).json({ message: "Unauthorized" });
//       }

//       const { role, accountType, permissions } = user;

//       // ❌ Blocked account types
//       if (blockedAccountTypes.includes(accountType)) {
//         return res.status(403).json({
//           message: `${accountType} account cannot perform this action`
//         });
//       }

//       // ✅ Allowed roles
//       if (allowedRoles.includes(role)) {
//         // STAFF needs required permission check
//         if (role === ROLES.STAFF && requiredPermission) {
//           if (!permissions?.[requiredPermission]) {
//             return res.status(403).json({
//               message: "Not allowed: permission missing"
//             });
//           }
//         }
//         return next();
//       }

//       // ❌ Not allowed by role
//       return res.status(403).json({ message: "Not allowed to perform this action" });

//     } catch (err) {
//       console.error("Permission middleware error:", err);
//       return res.status(500).json({ message: "Permission error" });
//     }
//   };
// };
