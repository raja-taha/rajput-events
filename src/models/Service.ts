import { Schema, models, model } from "mongoose";
import { auditFields } from "./_base";
import { SERVICE_STATUS } from "./enums";

const ServiceSchema = new Schema(
  {
    serviceId: { type: String, required: true, unique: true },
    servicePackageName: String,
    categoryLevel: String,
    pricingUnit: String,
    includedScope: String,
    excludedOptionalItems: String,
    estimatedDeliveryCost: Number,
    sellingPriceExclTax: Number,
    status: { type: String, enum: SERVICE_STATUS },
    reviewedOn: Date,
    pricingNotes: String,
    ...auditFields,
  },
  { timestamps: true },
);

ServiceSchema.index({ serviceId: 1 }, { unique: true });
ServiceSchema.index({ status: 1 });

export const Service =
  models.Service || model("Service", ServiceSchema, "services");
