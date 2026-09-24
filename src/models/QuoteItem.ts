import { Schema, models, model } from "mongoose";
import { auditFields } from "./_base";
import { QUOTE_ITEM_CATEGORY } from "./enums";

const QuoteItemSchema = new Schema(
  {
    lineId: { type: String, required: true, unique: true },
    quoteId: { type: String, required: true },
    category: { type: String, enum: QUOTE_ITEM_CATEGORY },
    serviceDeliverable: String,
    specificationFinish: String,
    quantity: Number,
    unit: String,
    unitPriceExclTax: Number,
    approvalDeadline: Date,
    notes: String,
    ...auditFields,
  },
  { timestamps: true },
);

QuoteItemSchema.index({ lineId: 1 }, { unique: true });
QuoteItemSchema.index({ quoteId: 1 });

export const QuoteItem =
  models.QuoteItem || model("QuoteItem", QuoteItemSchema, "quoteItems");
