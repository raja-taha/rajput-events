import { Schema, models, model } from "mongoose";
import { auditFields } from "./_base";
import {
  PAYMENT_CLEARANCE,
  PAYMENT_METHOD,
  PAYMENT_TRANSACTION_TYPE,
} from "./enums";

const PaymentSchema = new Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    transactionDate: Date,
    eventId: String,
    transactionType: { type: String, enum: PAYMENT_TRANSACTION_TYPE },
    referenceId: String,
    poId: String,
    expenseId: String,
    invoiceId: String,
    receiptNumber: String,
    payerPayee: String,
    method: { type: String, enum: PAYMENT_METHOD },
    bankWalletReference: String,
    amount: { type: Number, min: 0 },
    clearance: { type: String, enum: PAYMENT_CLEARANCE },
    clearedOn: Date,
    receiptBankEvidence: String,
    ...auditFields,
  },
  { timestamps: true },
);

PaymentSchema.index({ transactionId: 1 }, { unique: true });
PaymentSchema.index({ eventId: 1 });
PaymentSchema.index({ invoiceId: 1 });
PaymentSchema.index({ poId: 1 });
PaymentSchema.index({ expenseId: 1 });
PaymentSchema.index({ transactionDate: 1 });
PaymentSchema.index({ clearance: 1 });

export const Payment =
  models.Payment || model("Payment", PaymentSchema, "payments");
