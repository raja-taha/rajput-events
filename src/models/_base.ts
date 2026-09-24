import { Schema } from "mongoose";

export const auditFields = {
  createdBy: { type: String, default: "env-admin" },
  updatedBy: { type: String, default: "env-admin" },
  archivedAt: { type: Date, default: null },
  archivedBy: { type: String, default: null },
};

export function withTimestamps(schema: Schema) {
  schema.set("timestamps", true);
  return schema;
}
