import { Schema, models, model } from "mongoose";
import { auditFields } from "./_base";
import { VENUE_SETTING } from "./enums";

const VenueSchema = new Schema(
  {
    venueId: { type: String, required: true, unique: true },
    venueName: String,
    areaCity: String,
    addressMapLink: String,
    venueManager: String,
    managerMobile: String,
    guestCapacity: Number,
    setting: { type: String, enum: VENUE_SETTING },
    indicativeRental: Number,
    securityDeposit: Number,
    loadingAccessWindow: String,
    eventSoundCutoff: String,
    powerGenerator: String,
    parkingAccessibility: String,
    decorFlameRiggingRules: String,
    weatherBackupAssemblyPoint: String,
    emergencyContactFirstAid: String,
    lastChecked: Date,
    venueAgreementPhotos: String,
    ...auditFields,
  },
  { timestamps: true },
);

VenueSchema.index({ venueId: 1 }, { unique: true });
VenueSchema.index({ areaCity: 1 });

export const Venue = models.Venue || model("Venue", VenueSchema, "venues");
