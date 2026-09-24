import mongoose, { Schema, models, model } from "mongoose";

const CounterSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type CounterDoc = {
  key: string;
  seq: number;
};

export const Counter =
  models.Counter || model("Counter", CounterSchema, "counters");
