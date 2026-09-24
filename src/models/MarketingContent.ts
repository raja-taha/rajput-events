import { Schema, models, model } from "mongoose";
import { auditFields } from "./_base";
import {
  MARKETING_CONTENT_STATUS,
  MARKETING_CONTENT_TYPE,
  MARKETING_PLATFORM,
  MEDIA_RIGHTS_APPROVED,
} from "./enums";

const MarketingContentSchema = new Schema(
  {
    contentId: { type: String, required: true, unique: true },
    platform: { type: String, enum: MARKETING_PLATFORM },
    plannedPublishDate: Date,
    contentType: { type: String, enum: MARKETING_CONTENT_TYPE },
    eventId: String,
    postTopicCaption: String,
    imageVideoDesignLink: String,
    owner: String,
    status: { type: String, enum: MARKETING_CONTENT_STATUS },
    mediaRightsApproved: { type: String, enum: MEDIA_RIGHTS_APPROVED },
    consentRightsEvidence: String,
    publishedUrl: String,
    ...auditFields,
  },
  { timestamps: true },
);

MarketingContentSchema.index({ contentId: 1 }, { unique: true });
MarketingContentSchema.index({ eventId: 1 });
MarketingContentSchema.index({ status: 1 });
MarketingContentSchema.index({ plannedPublishDate: 1 });

export const MarketingContent =
  models.MarketingContent ||
  model("MarketingContent", MarketingContentSchema, "marketingContent");
