import AuditLog from "../models/AuditLog.js";

export function writeAudit(actor, action, targetType, target, details = {}) {
  return AuditLog.create({
    actor: actor?._id,
    actorName: actor?.name || "System",
    action,
    targetType,
    targetId: target?._id ? String(target._id) : target ? String(target) : "",
    targetLabel: target?.name || target?.email || target?.orderNumber || "",
    details,
  });
}
