import { Schema, models, model } from "mongoose";
import { auditFields } from "./_base";

const SettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: Schema.Types.Mixed,
    ...auditFields,
  },
  { timestamps: true },
);

SettingSchema.index({ key: 1 }, { unique: true });

export const Setting =
  models.Setting || model("Setting", SettingSchema, "settings");
