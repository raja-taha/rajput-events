import "server-only";
import mongoose from "mongoose";
import {
  Booking,
  Change,
  Customer,
  Document,
  Enquiry,
  EventBrief,
  Expense,
  Feedback,
  Handover,
  InventoryItem,
  Invoice,
  MarketingContent,
  Payment,
  Quote,
  Service,
  Task,
  Vendor,
  VendorOrder,
  Venue,
} from "@/models";
import { getChangeModel } from "@/models/Change";
import type { ResourceDef } from "./crud";
import type { ResourceKey } from "./resource-config";

export type { ResourceKey } from "./resource-config";

const RESOURCE_MAP: Record<ResourceKey, ResourceDef> = {
  customers: {
    resource: "customers",
    model: Customer as ResourceDef["model"],
    businessIdField: "customerId",
    idKey: "customer",
    searchFields: ["customerId", "fullName", "email", "mobileWhatsApp", "status"],
    labelField: "fullName",
    createDefaults: { status: "Active" },
  },
  enquiries: {
    resource: "enquiries",
    model: Enquiry as ResourceDef["model"],
    businessIdField: "enquiryId",
    idKey: "enquiry",
    searchFields: ["enquiryId", "customerId", "occasionTitle", "stage"],
    labelField: "occasionTitle",
    createDefaults: { stage: "New", receivedOn: new Date() },
  },
  "event-briefs": {
    resource: "event-briefs",
    model: EventBrief as ResourceDef["model"],
    businessIdField: "briefId",
    idKey: "brief",
    searchFields: ["briefId", "enquiryId", "eventId", "themeVision"],
    labelField: "themeVision",
  },
  quotes: {
    resource: "quotes",
    model: Quote as ResourceDef["model"],
    businessIdField: "quoteId",
    idKey: "quote",
    searchFields: ["quoteId", "customerId", "enquiryId", "status"],
    labelField: "quoteId",
    createDefaults: { status: "Draft", issueDate: new Date() },
  },
  services: {
    resource: "services",
    model: Service as ResourceDef["model"],
    businessIdField: "serviceId",
    idKey: "service",
    searchFields: ["serviceId", "servicePackageName", "status"],
    labelField: "servicePackageName",
    createDefaults: { status: "Draft" },
  },
  bookings: {
    resource: "bookings",
    model: Booking as ResourceDef["model"],
    businessIdField: "eventId",
    idKey: "event",
    searchFields: [
      "eventId",
      "eventTitle",
      "customerId",
      "eventType",
      "stage",
      "venueId",
    ],
    labelField: "eventTitle",
    createDefaults: { stage: "Tentative" },
  },
  tasks: {
    resource: "tasks",
    model: Task as ResourceDef["model"],
    businessIdField: "taskId",
    idKey: "task",
    searchFields: ["taskId", "taskActivityCue", "phase", "status"],
    labelField: "taskActivityCue",
    createDefaults: { status: "To do", priority: "Normal" },
  },
  changes: {
    resource: "changes",
    model: Change as ResourceDef["model"],
    businessIdField: "changeId",
    idKey: "change",
    searchFields: [
      "changeId",
      "eventId",
      "requestedChange",
      "implementationStatus",
    ],
    labelField: "changeId",
    createDefaults: { implementationStatus: "Pending" },
  },
  feedback: {
    resource: "feedback",
    model: Feedback as ResourceDef["model"],
    businessIdField: "feedbackId",
    idKey: "feedback",
    searchFields: ["feedbackId", "eventId", "mediaConsent"],
    labelField: "feedbackId",
  },
  vendors: {
    resource: "vendors",
    model: Vendor as ResourceDef["model"],
    businessIdField: "vendorId",
    idKey: "vendor",
    searchFields: ["vendorId", "businessName", "category", "vendorStatus"],
    labelField: "businessName",
    createDefaults: { vendorStatus: "Prospect" },
  },
  "vendor-orders": {
    resource: "vendor-orders",
    model: VendorOrder as ResourceDef["model"],
    businessIdField: "poId",
    idKey: "po",
    searchFields: ["poId", "eventId", "vendorId", "status"],
    labelField: "poId",
  },
  venues: {
    resource: "venues",
    model: Venue as ResourceDef["model"],
    businessIdField: "venueId",
    idKey: "venue",
    searchFields: [
      "venueId",
      "venueName",
      "areaCity",
      "venueManager",
      "managerMobile",
    ],
    labelField: "venueName",
  },
  inventory: {
    resource: "inventory",
    model: InventoryItem as ResourceDef["model"],
    businessIdField: "itemId",
    idKey: "inventory",
    searchFields: ["itemId", "itemAssetName", "category"],
    labelField: "itemAssetName",
  },
  handovers: {
    resource: "handovers",
    model: Handover as ResourceDef["model"],
    businessIdField: "handoverId",
    idKey: "handover",
    searchFields: ["handoverId", "eventId", "itemId"],
    labelField: "handoverId",
  },
  invoices: {
    resource: "invoices",
    model: Invoice as ResourceDef["model"],
    businessIdField: "invoiceId",
    idKey: "invoice",
    searchFields: ["invoiceId", "eventId", "customerId", "status"],
    labelField: "invoiceId",
  },
  payments: {
    resource: "payments",
    model: Payment as ResourceDef["model"],
    businessIdField: "transactionId",
    idKey: "payment",
    searchFields: ["transactionId", "eventId", "invoiceId", "payerPayee"],
    labelField: "transactionId",
    createDefaults: {
      transactionDate: new Date(),
      clearance: "Pending",
      transactionType: "Client receipt",
    },
  },
  expenses: {
    resource: "expenses",
    model: Expense as ResourceDef["model"],
    businessIdField: "expenseId",
    idKey: "expense",
    searchFields: ["expenseId", "eventId", "description"],
    labelField: "description",
  },
  documents: {
    resource: "documents",
    model: Document as ResourceDef["model"],
    businessIdField: "documentId",
    idKey: "document",
    searchFields: ["documentId", "documentCheck", "status"],
    labelField: "documentCheck",
  },
  marketing: {
    resource: "marketing",
    model: MarketingContent as ResourceDef["model"],
    businessIdField: "contentId",
    idKey: "marketing",
    searchFields: ["contentId", "platform", "postTopicCaption", "status"],
    labelField: "postTopicCaption",
    createDefaults: { status: "Draft" },
  },
};

export function getResourceDef(key: string): ResourceDef | undefined {
  const base = RESOURCE_MAP[key as ResourceKey];
  if (!base) return undefined;

  // Prefer the live mongoose model so HMR schema/enum updates are picked up.
  if (key === "changes") {
    return {
      ...base,
      model: getChangeModel() as ResourceDef["model"],
    };
  }

  const live = mongoose.models[base.model.modelName];
  if (live && live !== base.model) {
    return { ...base, model: live as ResourceDef["model"] };
  }
  return base;
}
