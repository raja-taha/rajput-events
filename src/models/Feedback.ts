import { Schema, models, model } from "mongoose";
import { auditFields } from "./_base";
import {
  FEEDBACK_COMPLETION_SIGNED,
  FEEDBACK_ISSUES_RESOLVED,
  GOOGLE_REVIEW_REQUEST_CONSENT,
  MEDIA_CONSENT,
  REFERRAL_CONTACT_CONSENT,
} from "./enums";

const FeedbackSchema = new Schema(
  {
    feedbackId: { type: String, required: true, unique: true },
    eventId: String,
    recordedOn: Date,
    completionSigned: { type: String, enum: FEEDBACK_COMPLETION_SIGNED },
    overallRating: { type: Number, min: 1, max: 5 },
    whatWorkedWell: String,
    whatToImproveOpenIssues: String,
    actionOwner: String,
    actionDueDate: Date,
    issuesResolved: { type: String, enum: FEEDBACK_ISSUES_RESOLVED },
    mediaConsent: { type: String, enum: MEDIA_CONSENT },
    restrictionsEmbargoCredit: String,
    signedConsentCompletionLink: String,
    googleReviewRequestConsent: {
      type: String,
      enum: GOOGLE_REVIEW_REQUEST_CONSENT,
    },
    reviewRequestedOn: Date,
    referralContactConsent: {
      type: String,
      enum: REFERRAL_CONTACT_CONSENT,
    },
    lessonsForNextEvent: String,
    ...auditFields,
  },
  { timestamps: true },
);

FeedbackSchema.index({ feedbackId: 1 }, { unique: true });
FeedbackSchema.index({ eventId: 1 });

export const Feedback =
  models.Feedback || model("Feedback", FeedbackSchema, "feedback");
