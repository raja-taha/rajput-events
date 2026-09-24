import { Schema, models, model } from "mongoose";
import { auditFields } from "./_base";
import {
  BUDGET_INCLUDES_VENUE_FOOD,
  ENQUIRY_STAGE,
  EVENT_TYPE,
  LEAD_SOURCE,
  PACKAGE_LEVEL,
  SETTING_INDOOR_OUTDOOR,
} from "./enums";

const enquiryLeadSources = LEAD_SOURCE.filter((s) => s !== "Walk-in");

const EnquirySchema = new Schema(
  {
    enquiryId: { type: String, required: true, unique: true },
    receivedOn: { type: Date, default: Date.now },
    customerId: { type: String, required: true },
    eventType: { type: String, enum: EVENT_TYPE, default: "Other" },
    occasionTitle: { type: String, default: "" },
    preferredDate: Date,
    alternativeDate: Date,
    expectedGuests: { type: Number, default: 0 },
    preferredArea: { type: String, default: "" },
    venueStatusOrName: { type: String, default: "" },
    setting: {
      type: String,
      enum: SETTING_INDOOR_OUTDOOR,
      default: "Undecided",
    },
    targetBudget: { type: Number, default: 0 },
    budgetIncludesVenueFood: {
      type: String,
      enum: BUDGET_INCLUDES_VENUE_FOOD,
      default: "Unknown",
    },
    packageLevel: { type: String, enum: PACKAGE_LEVEL, default: "Custom" },
    requiredServices: { type: [String], default: [] },
    mustHavesPriorities: { type: String, default: "" },
    leadSource: {
      type: String,
      enum: enquiryLeadSources,
      default: "WhatsApp",
    },
    stage: { type: String, enum: ENQUIRY_STAGE, default: "New" },
    followUpOwner: { type: String, default: "" },
    nextAction: { type: String, default: "" },
    followUpDate: Date,
    quoteNeededBy: Date,
    lostHoldReason: { type: String, default: "" },
    conversationNotes: { type: String, default: "" },
    ...auditFields,
  },
  { timestamps: true },
);

EnquirySchema.index({ enquiryId: 1 }, { unique: true });
EnquirySchema.index({ customerId: 1 });
EnquirySchema.index({ stage: 1 });
EnquirySchema.index({ followUpDate: 1 });

export const Enquiry =
  models.Enquiry || model("Enquiry", EnquirySchema, "enquiries");
