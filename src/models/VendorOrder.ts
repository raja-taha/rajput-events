import { Schema, models, model } from "mongoose";
import { auditFields } from "./_base";
import { VENDOR_ORDER_STATUS } from "./enums";

const VendorOrderSchema = new Schema(
  {
    poId: { type: String, required: true, unique: true },
    eventId: String,
    vendorId: String,
    scopeSpecification: String,
    quantity: Number,
    unit: String,
    unitRate: Number,
    deliverySetupExtras: Number,
    taxAmount: Number,
    status: { type: String, enum: VENDOR_ORDER_STATUS },
    advanceDue: Number,
    advanceDueDate: Date,
    balanceDueDate: Date,
    deliverySetupTime: String,
    collectionTime: String,
    signedPoAgreement: String,
    cancellationRefundTerms: String,
    backupContactSupplier: String,
    deliveryNotes: String,
    ...auditFields,
  },
  { timestamps: true },
);

VendorOrderSchema.index({ poId: 1 }, { unique: true });
VendorOrderSchema.index({ eventId: 1 });
VendorOrderSchema.index({ vendorId: 1 });
VendorOrderSchema.index({ status: 1 });

export const VendorOrder =
  models.VendorOrder || model("VendorOrder", VendorOrderSchema, "vendorOrders");
