import { Schema, models, model } from "mongoose";
import { auditFields } from "./_base";
import { BOOKING_STAGE, EVENT_TYPE, YES_NO_PENDING_NA } from "./enums";

const BookingSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true },
    enquiryId: String,
    customerId: String,
    eventTitle: String,
    eventType: { type: String, enum: EVENT_TYPE },
    eventDate: Date,
    startTime: String,
    endTime: String,
    guestCount: Number,
    venueId: String,
    acceptedQuoteId: String,
    stage: { type: String, enum: BOOKING_STAGE },
    agreementSigned: { type: String, enum: YES_NO_PENDING_NA },
    bookingAdvanceDue: Number,
    advanceDueDate: Date,
    finalBalanceDue: Number,
    venueConfirmed: { type: String, enum: YES_NO_PENDING_NA },
    vendorCapacityChecked: { type: String, enum: YES_NO_PENDING_NA },
    rajputEventsLead: String,
    onsiteClientContact: String,
    onsiteWhatsApp: String,
    backupContactPhone: String,
    signedAgreementLink: String,
    eventFolderLink: String,
    costsFinalised: { type: String, enum: YES_NO_PENDING_NA },
    notes: String,
    ...auditFields,
  },
  { timestamps: true },
);

BookingSchema.index({ eventId: 1 }, { unique: true });
BookingSchema.index({ customerId: 1 });
BookingSchema.index({ eventDate: 1 });
BookingSchema.index({ stage: 1 });
BookingSchema.index({ acceptedQuoteId: 1 });

export const Booking =
  models.Booking || model("Booking", BookingSchema, "bookings");
