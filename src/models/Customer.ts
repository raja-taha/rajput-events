import { Schema, models, model } from "mongoose";
import { auditFields } from "./_base";
import {
  LEAD_SOURCE,
  MARKETING_CONSENT,
  PREFERRED_CONTACT_METHOD,
} from "./enums";

const CustomerSchema = new Schema(
  {
    customerId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    familyOrCompany: { type: String, default: "" },
    mobileWhatsApp: { type: String, default: "" },
    email: { type: String, default: "" },
    billingAddress: { type: String, default: "" },
    cityArea: { type: String, default: "" },
    preferredContactMethod: {
      type: String,
      enum: PREFERRED_CONTACT_METHOD,
      default: "WhatsApp",
    },
    bestContactTime: { type: String, default: "" },
    decisionMaker: { type: String, default: "" },
    backupContact: { type: String, default: "" },
    leadSource: { type: String, enum: LEAD_SOURCE, default: "WhatsApp" },
    relationshipOwner: { type: String, default: "" },
    addedOn: { type: Date, default: Date.now },
    marketingConsent: {
      type: String,
      enum: MARKETING_CONSENT,
      default: "Not asked",
    },
    notes: { type: String, default: "" },
    ...auditFields,
  },
  { timestamps: true },
);

CustomerSchema.index({ customerId: 1 }, { unique: true });
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ mobileWhatsApp: 1 });
CustomerSchema.index({ fullName: "text", familyOrCompany: "text" });

export const Customer =
  models.Customer || model("Customer", CustomerSchema, "customers");
