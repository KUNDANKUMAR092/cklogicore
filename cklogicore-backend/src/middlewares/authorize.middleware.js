// middlewares/authorize.middleware

export const authorize = ({
  roles = [],
  accountTypes = [],
  module = null,
  action = null
} = {}) => {

  return (req, res, next) => {
    try {

      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { role, accountType, permissions } = user;

      /* OWNER = FULL ACCESS */
      if (role === "OWNER") {
        return next();
      }

      /* ROLE CHECK */
      if (roles.length && !roles.includes(role)) {
        return res.status(403).json({ message: "Role not allowed" });
      }

      /* ACCOUNT TYPE CHECK */
      if (accountTypes.length && !accountTypes.includes(accountType)) {
        return res.status(403).json({ message: "Account type not allowed" });
      }

      /* STAFF PERMISSION CHECK */
      if (module && action) {

        const allowed = permissions?.[module]?.[action];

        if (!allowed) {
          return res.status(403).json({ message: "Permission denied" });
        }
      }

      next();

    } catch (err) {
      console.error("Authorize Error:", err);
      res.status(500).json({ message: "Authorization failed" });
    }
  };
};
















// import { ROLES } from "../constants/roles.js";

// export const authorize = ({
//   roles = [],
//   accountTypes = [],
//   permissions = [],
// } = {}) => {

//   return (req, res, next) => {
//     try {
//       const user = req.user;

//       if (!user) {
//         return res.status(401).json({ message: "Unauthorized" });
//       }

//       const { role, accountType } = user;

//       /* 🔥 ADMIN = FULL ACCESS */
//       if (role === ROLES.ADMIN) {
//         return next();
//       }

//       /* ✅ ROLE CHECK */
//       if (roles.length && !roles.includes(role)) {
//         return res.status(403).json({
//           message: "Role not allowed",
//         });
//       }

//       /* ✅ ACCOUNT TYPE CHECK */
//       if (accountTypes.length && !accountTypes.includes(accountType)) {
//         return res.status(403).json({
//           message: "Account type not allowed",
//         });
//       }

//       /* ✅ PERMISSION CHECK (for staff) */
//       if (permissions.length) {
//         const hasPermission = permissions.some(
//           (p) => user.permissions?.[p] === true
//         );

//         if (!hasPermission) {
//           return res.status(403).json({
//             message: "Permission denied",
//           });
//         }
//       }

//       next();
//     } catch (err) {
//       console.error("Authorize Error:", err);
//       return res.status(500).json({ message: "Authorization failed" });
//     }
//   };
// };





// import { ACCOUNT_TYPES } from "../constants/accountTypes.js";
// import { ROLES } from "../constants/roles.js";

// export const authorize = ({
//   roles = [],
//   permissions = [],
//   blockVehicle = false
// } = {}) => {

//   return (req, res, next) => {
//     try {

//       const user = req.user;

//       if (!user) {
//         return res.status(401).json({ message: "Unauthorized" });
//       }

//       const { role, accountType } = user;

//       /* ❌ Block VEHICLE account (optional) */
//       if (blockVehicle && accountType === ACCOUNT_TYPES.VEHICLE) {
//         return res.status(403).json({
//           message: "Vehicle account restricted"
//         });
//       }

//       /* ✅ Role check */
//       if (roles.length && !roles.includes(role)) {
//         return res.status(403).json({
//           message: "Role not allowed"
//         });
//       }

//       /* ✅ ADMIN bypass */
//       if (role === ROLES.ADMIN) {
//         return next();
//       }

//       /* ✅ Permission check */
//       if (permissions.length) {

//         const hasPermission = permissions.some(
//           (p) => user.permissions?.[p] === true
//         );

//         if (!hasPermission) {
//           return res.status(403).json({
//             message: "Permission denied"
//           });
//         }
//       }

//       next();

//     } catch (err) {
//       console.error("Authorize Error:", err);

//       return res.status(500).json({
//         message: "Authorization failed"
//       });
//     }
//   };
// };
