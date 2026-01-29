import AuditLog from "../models/auditLog.model.js";

export const logAudit = async ({
  accountId,
  userId,
  action,
  entity,
  entityId,
  changes
}) => {
  await AuditLog.create({
    accountId,
    userId,
    action,
    entity,
    entityId,
    changes
  });
};
