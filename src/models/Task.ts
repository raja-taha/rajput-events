import { Schema, models, model } from "mongoose";
import { auditFields } from "./_base";
import {
  TASK_PHASE,
  TASK_PRIORITY,
  TASK_SCOPE,
  TASK_STATUS,
} from "./enums";

const TaskSchema = new Schema(
  {
    taskId: { type: String, required: true, unique: true },
    eventId: { type: String, default: null },
    scope: { type: String, enum: TASK_SCOPE },
    isTemplate: { type: Boolean, default: false },
    phase: { type: String, enum: TASK_PHASE },
    taskActivityCue: String,
    responsiblePerson: String,
    ownerMobile: String,
    approver: String,
    dueStartAt: Date,
    durationMinutes: Number,
    dependencyTaskId: String,
    status: { type: String, enum: TASK_STATUS },
    priority: { type: String, enum: TASK_PRIORITY },
    locationCue: String,
    completionEvidence: String,
    notesEscalation: String,
    ...auditFields,
  },
  { timestamps: true },
);

TaskSchema.index({ taskId: 1 }, { unique: true });
TaskSchema.index({ eventId: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ dueStartAt: 1 });
TaskSchema.index({ phase: 1 });
TaskSchema.index({ scope: 1, isTemplate: 1 });

export const Task = models.Task || model("Task", TaskSchema, "tasks");
