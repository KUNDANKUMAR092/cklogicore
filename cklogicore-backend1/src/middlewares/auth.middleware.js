const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      name: decoded.name
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * ROLE BASED ACCESS CONTROL
 * ADMIN => sab access
 */
exports.checkAccess = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ADMIN boss hai
    if (req.user.role === "ADMIN") {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};
























// const jwt = require("jsonwebtoken");

// exports.verifyToken = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//       return res.status(401).json({ message: "Token missing" });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

//     req.user = {
//       userId: decoded.userId,
//       role: decoded.role,
//       name: decoded.name
//     };

//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };














// // const jwt = require("jsonwebtoken");

// // exports.verifyToken = (req, res, next) => {
// //   try {
// //     const authHeader = req.headers.authorization;

// //     if (!authHeader) {
// //       return res.status(401).json({ message: "Token missing" });
// //     }

// //     // Bearer TOKEN
// //     const token = authHeader.split(" ")[1];
// //     if (!token) {
// //       return res.status(401).json({ message: "Invalid token format" });
// //     }

// //     const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

// //     // decoded data attach to request
// //     req.user = {
// //       userId: decoded.userId,
// //       role: decoded.role,
// //       name: decoded.name
// //     };

// //     next();
// //   } catch (err) {
// //     return res.status(401).json({ message: "Unauthorized / Token expired" });
// //   }
// // };










// // const jwt = require("jsonwebtoken");

// // module.exports = (req, res, next) => {
// //   const token = req.headers.authorization?.split(" ")[1];
// //   if (!token) return res.sendStatus(401);

// //   jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
// //     if (err) return res.sendStatus(403);
// //     req.user = user;
// //     next();
// //   });
// // };
