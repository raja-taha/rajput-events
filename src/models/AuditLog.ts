import { Schema, models, model } from "mongoose";

const AuditLogSchema = new Schema(
  {
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: String,
    businessId: String,
    actor: { type: String, default: "env-admin" },
    changes: Schema.Types.Mixed,
    metadata: Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

AuditLogSchema.index({ resource: 1, businessId: 1, createdAt: -1 });

export const AuditLog =
  models.AuditLog || model("AuditLog", AuditLogSchema, "auditLogs");
