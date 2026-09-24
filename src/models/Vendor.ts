import { Schema, models, model } from "mongoose";
import { auditFields } from "./_base";
import {
  BANK_DETAILS_VERIFIED,
  VENDOR_CATEGORY,
  VENDOR_STATUS,
} from "./enums";

const VendorSchema = new Schema(
  {
    vendorId: { type: String, required: true, unique: true },
    businessName: String,
    category: { type: String, enum: VENDOR_CATEGORY },
    servicesSpecialities: String,
    authorizedContact: String,
    mobileWhatsApp: String,
    email: String,
    addressCoverageArea: String,
    portfolioRateCardLink: String,
    indicativeRate: Number,
    rateUnitInclusions: String,
    rateVerifiedOn: Date,
    leadTimeWeekendAvailability: String,
    depositPaymentTerms: String,
    deliverySetupCollectionTerms: String,
    cancellationRefundTerms: String,
    identityTaxReference: String,
    licenceStatusExpiry: String,
    bankAccountTitle: String,
    bankIban: String,
    bankDetailsVerified: { type: String, enum: BANK_DETAILS_VERIFIED },
    verificationAgreementFolder: String,
    emergencyBackupContact: String,
    performanceRating: { type: Number, min: 1, max: 5 },
    vendorStatus: { type: String, enum: VENDOR_STATUS },
    notesIssues: String,
    ...auditFields,
  },
  { timestamps: true },
);

VendorSchema.index({ vendorId: 1 }, { unique: true });
VendorSchema.index({ category: 1 });
VendorSchema.index({ vendorStatus: 1 });

export const Vendor = models.Vendor || model("Vendor", VendorSchema, "vendors");
