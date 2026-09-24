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
      enum: CHANGE_IMPLEMENTATION_STATUS,
    },
    ...auditFields,
  },
  { timestamps: true },
);

ChangeSchema.index({ changeId: 1 }, { unique: true });
ChangeSchema.index({ eventId: 1 });
ChangeSchema.index({ decision: 1 });

export const Change =
  models.Change || model("Change", ChangeSchema, "changes");
