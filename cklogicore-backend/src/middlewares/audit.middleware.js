// middlewares/audit.middleware.js

import AuditLog from "../models/auditLog.model.js";

export const audit = (action, entity) => {

  return (req, res, next) => {

    res.on("finish", async () => {

      try {

        if (res.statusCode < 400 && req.user) {

          await AuditLog.create({
            accountId: req.user.accountId,
            userId: req.user.userId, // ✅ fixed
            action,
            entity,
            entityId: res.locals.entityId || null,
            meta: req.body
          });

        }

      } catch (err) {
        console.error("Audit Error:", err);
      }

    });

    next();
  };
};


















// import AuditLog from "../models/auditLog.model.js";

// export const audit = (action, entity) => {
//   return async (req, res, next) => {
//     res.on("finish", async () => {
//       if (res.statusCode < 400) {
//         await AuditLog.create({
//           accountId: req.user.accountId,
//           userId: req.user.userId,
//           action,
//           entity,
//           entityId: res.locals.entityId,
//           meta: req.body
//         });
//       }
//     });

//     next();
//   };
// };
