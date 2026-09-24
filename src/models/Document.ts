import { Schema, models, model } from "mongoose";
import { auditFields } from "./_base";
import {
  DOCUMENT_APPLICABILITY,
  DOCUMENT_SCOPE,
  DOCUMENT_STATUS,
} from "./enums";

const DocumentSchema = new Schema(
  {
    documentId: { type: String, required: true, unique: true },
    scope: { type: String, enum: DOCUMENT_SCOPE },
    entityId: String,
    eventId: String,
    vendorId: String,
    documentCheck: String,
    applicability: { type: String, enum: DOCUMENT_APPLICABILITY },
    responsiblePerson: String,
    reviewerAuthority: String,
    status: { type: String, enum: DOCUMENT_STATUS },
    dueRenewalDate: Date,
    certificateAgreementNo: String,
    completedFileEvidenceLink: String,
    lastVerified: Date,
    notesTemplateFilename: String,
    isTemplate: { type: Boolean, default: false },
    ...auditFields,
  },
  { timestamps: true },
);

DocumentSchema.index({ documentId: 1 }, { unique: true });
DocumentSchema.index({ eventId: 1 });
DocumentSchema.index({ vendorId: 1 });
DocumentSchema.index({ status: 1 });
DocumentSchema.index({ dueRenewalDate: 1 });

export const Document =
  models.Document || model("Document", DocumentSchema, "documents");
