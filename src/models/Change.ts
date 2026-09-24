import { Schema, models, model } from "mongoose";
import { auditFields } from "./_base";
import {
  CHANGE_CATEGORY,
  CHANGE_DECISION,
  CHANGE_IMPLEMENTATION_STATUS,
} from "./enums";

const ChangeSchema = new Schema(
  {
    changeId: { type: String, required: true, unique: true },
    eventId: String,
    requestedOn: Date,
    requestedBy: String,
    changeCategory: { type: String, enum: CHANGE_CATEGORY },
    originalScope: String,
    requestedChange: String,
    feeChangeExclTax: Number,
    taxChange: Number,
    decision: { type: String, enum: CHANGE_DECISION },
    approvedOn: Date,
    signedApprovalLink: String,
    scheduleVendorImpact: String,
    implementationOwner: String,
    paymentDueDate: Date,
    implementationStatus: {
      type: String,
      enum: [...CHANGE_IMPLEMENTATION_STATUS],
      default: "Pending",
    },
    ...auditFields,
  },
  { timestamps: true },
);

ChangeSchema.index({ changeId: 1 }, { unique: true });
ChangeSchema.index({ eventId: 1 });
ChangeSchema.index({ decision: 1 });

function readEnumValues(modelName: string, pathName: string): string[] {
  const existing = models[modelName];
  if (!existing) return [];
  const path = existing.schema.path(pathName) as
    | { enumValues?: string[]; options?: { enum?: string[] | { values?: string[] } } }
    | undefined;
  if (!path) return [];
  if (Array.isArray(path.enumValues) && path.enumValues.length) {
    return path.enumValues;
  }
  const opt = path.options?.enum;
  if (Array.isArray(opt)) return opt.map(String);
  if (opt && typeof opt === "object" && Array.isArray(opt.values)) {
    return opt.values.map(String);
  }
  return [];
}

export function getChangeModel() {
  const expected = [...CHANGE_IMPLEMENTATION_STATUS];
  const current = readEnumValues("Change", "implementationStatus");
  const stale =
    Boolean(models.Change) &&
    (expected.length !== current.length ||
      expected.some((v) => !current.includes(v)));

  if (stale) {
    delete models.Change;
  }

  return models.Change || model("Change", ChangeSchema, "changes");
}

export const Change = getChangeModel();
