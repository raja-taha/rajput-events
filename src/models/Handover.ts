import { Schema, models, model } from "mongoose";
import { auditFields } from "./_base";
import { INVENTORY_CONDITION } from "./enums";

const HandoverSchema = new Schema(
  {
    handoverId: { type: String, required: true, unique: true },
    eventId: String,
    itemId: String,
    vendorIdIfRented: String,
    issuedOn: Date,
    returnDue: Date,
    quantityOut: Number,
    quantityReturned: Number,
    quantityUsedLost: Number,
    returnedOn: Date,
    conditionOut: { type: String, enum: INVENTORY_CONDITION },
    conditionInDamage: String,
    receivedByContact: String,
    returnAcceptedBy: String,
    handoverPhotoEvidence: String,
    varianceResolutionNotes: String,
    ...auditFields,
  },
  { timestamps: true },
);

HandoverSchema.index({ handoverId: 1 }, { unique: true });
HandoverSchema.index({ eventId: 1 });
HandoverSchema.index({ itemId: 1 });
HandoverSchema.index({ returnDue: 1 });

export const Handover =
  models.Handover || model("Handover", HandoverSchema, "handovers");
