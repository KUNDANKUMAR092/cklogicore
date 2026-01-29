// src/middlewares/role.middleware.js

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Role not allowed" });
    }

    next();
  };
};


// export const authorizeRoles = (
//   roles = ["ADMIN", "STAFF"],
//   accountTypes = ["SUPPLIER", "COMPANY", "VEHICLE"]
// ) => {
//   return (req, res, next) => {
//     // 🔐 safety check
//     if (!req.user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     // 🔥 ROLE check
//     if (roles.length && !roles.includes(req.user.role)) {
//       return res.status(403).json({ message: "Role not allowed" });
//     }

//     // 🔥 ACCOUNT TYPE check
//     if (
//       accountTypes.length &&
//       !accountTypes.includes(req.user.accountType)
//     ) {
//       return res.status(403).json({ message: "Account type not allowed" });
//     }

//     next();
//   };
// };


export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }
    next();
  };
};

