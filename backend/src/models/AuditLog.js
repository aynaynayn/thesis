import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  actorName: { type: String, trim: true, maxlength: 120 },
  action: { type: String, required: true, trim: true, maxlength: 100, index: true },
  targetType: { type: String, required: true, trim: true, maxlength: 60 },
  targetId: { type: String, trim: true, maxlength: 100 },
  targetLabel: { type: String, trim: true, maxlength: 200 },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });
export default mongoose.model("AuditLog", auditLogSchema);
