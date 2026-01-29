const ROLES = require("../constants/roles");
const PERMISSIONS = require("../constants/permissions");

exports.checkPermission = (permission) => {
  return (req, res, next) => {
    const role = req.user.role;

    // ADMIN = boss
    if (role === ROLES.ADMIN) {
      return next();
    }

    const allowedPermissions = PERMISSIONS[role] || [];

    if (!allowedPermissions.includes(permission)) {
      return res.status(403).json({
        message: "Access denied for this role"
      });
    }

    next();
  };
};











// const { ROLES } = require("../constants/roles");
// const { PERMISSIONS } = require("../constants/permissions");

// exports.checkAccess = (requiredPermission) => {
//   return (req, res, next) => {
//     const { role } = req.user;

//     // ADMIN = boss
//     if (role === ROLES.ADMIN) {
//       return next();
//     }

//     const rolePermissions = PERMISSIONS[role];

//     if (!rolePermissions || !rolePermissions[requiredPermission]) {
//       return res.status(403).json({
//         message: "Access denied for this role"
//       });
//     }

//     next();
//   };
// };
