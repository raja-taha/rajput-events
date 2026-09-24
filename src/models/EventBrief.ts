import { Schema, models, model } from "mongoose";
import { auditFields } from "./_base";
import { CLIENT_APPROVED } from "./enums";

const EventBriefSchema = new Schema(
  {
    briefId: { type: String, required: true, unique: true },
    enquiryId: String,
    eventId: String,
    themeVision: String,
    colours: String,
    mustHaveElements: String,
    elementsToAvoid: String,
    referenceDesignLinks: [String],
    familyCulturalNeeds: String,
    foodDietaryNeeds: String,
    accessNeeds: String,
    privacyPhotographyRestrictions: String,
    siteVisitDate: Date,
    dimensionsCeilingHeight: String,
    loadingSetupAccessWindow: String,
    powerBackupArrangements: String,
    soundFlameVenueRules: String,
    weatherBackupPlan: String,
    programmeSpecialCues: String,
    designApprovalDue: Date,
    clientApproved: { type: String, enum: CLIENT_APPROVED },
    approvalEvidenceLink: String,
    notes: String,
    ...auditFields,
  },
  { timestamps: true },
);

EventBriefSchema.index({ briefId: 1 }, { unique: true });
EventBriefSchema.index({ enquiryId: 1 });
EventBriefSchema.index({ eventId: 1 });

export const EventBrief =
  models.EventBrief || model("EventBrief", EventBriefSchema, "eventBriefs");
