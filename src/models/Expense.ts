import { Schema, models, model } from "mongoose";
import { auditFields } from "./_base";
import {
  EXPENSE_APPROVAL_STATUS,
  EXPENSE_CATEGORY,
  EXPENSE_COST_SCOPE,
} from "./enums";

const ExpenseSchema = new Schema(
  {
    expenseId: { type: String, required: true, unique: true },
    recordedOn: Date,
    costScope: { type: String, enum: EXPENSE_COST_SCOPE },
    eventId: String,
    category: { type: String, enum: EXPENSE_CATEGORY },
    description: String,
    plannedCost: Number,
    actualAgreedCost: Number,
    paymentDueDate: Date,
    approvalStatus: { type: String, enum: EXPENSE_APPROVAL_STATUS },
    payee: String,
    invoiceReceiptEvidence: String,
    notes: String,
    ...auditFields,
  },
  { timestamps: true },
);

ExpenseSchema.index({ expenseId: 1 }, { unique: true });
ExpenseSchema.index({ eventId: 1 });
ExpenseSchema.index({ costScope: 1 });
ExpenseSchema.index({ approvalStatus: 1 });

export const Expense =
  models.Expense || model("Expense", ExpenseSchema, "expenses");
