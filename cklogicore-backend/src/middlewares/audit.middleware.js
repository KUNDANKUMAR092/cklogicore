// middlewares/audit.middleware.js
import AuditLog from "../models/auditLog.model.js";

export const audit = (action, entity) => {
  return async (req, res, next) => {
    res.on("finish", async () => {
      if (res.statusCode < 400) {
        await AuditLog.create({
          accountId: req.user.accountId,
          userId: req.user.userId,
          action,
          entity,
          entityId: res.locals.entityId,
          meta: req.body
        });
      }
    });

    next();
  };
};
