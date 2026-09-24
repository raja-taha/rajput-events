import { Schema, models, model } from "mongoose";
import { auditFields } from "./_base";
import { INVOICE_MILESTONE, INVOICE_STATUS } from "./enums";

const InvoiceSchema = new Schema(
  {
    invoiceId: { type: String, required: true, unique: true },
    eventId: String,
    milestone: { type: String, enum: INVOICE_MILESTONE },
    issueDate: Date,
    dueDate: Date,
    amountBilledInclTax: Number,
    status: { type: String, enum: INVOICE_STATUS },
    invoiceLink: String,
    notesAdjustments: String,
    ...auditFields,
  },
  { timestamps: true },
);

InvoiceSchema.index({ invoiceId: 1 }, { unique: true });
InvoiceSchema.index({ eventId: 1 });
InvoiceSchema.index({ dueDate: 1 });
InvoiceSchema.index({ status: 1 });

export const Invoice =
  models.Invoice || model("Invoice", InvoiceSchema, "invoices");
