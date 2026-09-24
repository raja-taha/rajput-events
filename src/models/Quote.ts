import { Schema, models, model } from "mongoose";
import { auditFields } from "./_base";
import { QUOTE_STATUS, TAX_TREATMENT_CONFIRMED } from "./enums";

const QuoteSchema = new Schema(
  {
    quoteId: { type: String, required: true, unique: true },
    customerId: String,
    enquiryId: String,
    eventId: String,
    issueDate: Date,
    validUntil: Date,
    version: { type: Number, default: 1 },
    status: { type: String, enum: QUOTE_STATUS, default: "Draft" },
    discount: { type: Number, default: 0 },
    taxTreatmentConfirmed: {
      type: String,
      enum: TAX_TREATMENT_CONFIRMED,
    },
    taxAmount: { type: Number, default: 0 },
    bookingAdvancePercent: { type: Number, default: 0.6 },
    acceptanceDate: Date,
    acceptanceQuoteLink: String,
    scopeAndExclusions: String,
    ...auditFields,
  },
  { timestamps: true },
);

QuoteSchema.index({ quoteId: 1 }, { unique: true });
QuoteSchema.index({ customerId: 1 });
QuoteSchema.index({ enquiryId: 1 });
QuoteSchema.index({ eventId: 1 });
QuoteSchema.index({ status: 1 });

export const Quote = models.Quote || model("Quote", QuoteSchema, "quotes");
