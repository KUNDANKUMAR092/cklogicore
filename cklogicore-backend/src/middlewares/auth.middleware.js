// middlewares/auth.middleware.js

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.accountId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await User.findOne({
      _id: decoded.id || decoded.userId,
      accountId: decoded.accountId
    }).lean(); // ⚡ faster

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    /* ✅ Standard user object */
    req.user = {
      _id: user._id,
      accountId: user.accountId,
      role: user.role,
      accountType: user.accountType,
      permissions: user.permissions || {}
    };

    next();

  } catch (err) {
    console.error("Auth Error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};


















// import jwt from "jsonwebtoken";
// import User from "../models/user.model.js";

// export const authMiddleware = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // 🔥 IMPORTANT CHECK
//     if (!decoded.accountId) {
//       return res.status(401).json({ message: "AccountId missing in token" });
//     }

//     const user = await User.findOne({
//       _id: decoded.id || decoded.userId,
//       accountId: decoded.accountId,
//       // accountType: decoded.accountType,
//       // role: decoded.role
//     });

//     if (!user) {
//       return res.status(401).json({ message: "Invalid token" });
//     }

//     req.user = user; // ✅ full user object
//     next();
//   } catch (err) {
//     console.error(err);
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };


// export const protect = async (req, res, next) => {
//   try {

//     let token;

//     if (
//       req.headers.authorization &&
//       req.headers.authorization.startsWith("Bearer")
//     ) {
//       token = req.headers.authorization.split(" ")[1];
//     }

//     if (!token) {
//       return res.status(401).json({ message: "Not authorized" });
//     }


//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findOne({
//       _id: decoded.userId,
//       accountId: decoded.accountId
//     });

//     if (!user) {
//       return res.status(401).json({ message: "Invalid token" });
//     }


//     req.user = user; // Account safe
//     next();

//   } catch (err) {
//     res.status(401).json({ message: "Unauthorized" });
//   }
// };