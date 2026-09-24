export type ResourceKey =
  | "customers"
  | "enquiries"
  | "event-briefs"
  | "quotes"
  | "services"
  | "bookings"
  | "tasks"
  | "changes"
  | "feedback"
  | "vendors"
  | "vendor-orders"
  | "venues"
  | "inventory"
  | "handovers"
  | "invoices"
  | "payments"
  | "expenses"
  | "documents"
  | "marketing";

export type ResourceMeta = {
  key: ResourceKey;
  businessIdField: string;
  labelField: string;
  title: string;
  singular: string;
  adminPath: string;
};

export const RESOURCE_META: Record<ResourceKey, ResourceMeta> = {
  customers: {
    key: "customers",
    businessIdField: "customerId",
    labelField: "fullName",
    title: "Customers",
    singular: "Customer",
    adminPath: "customers",
  },
  enquiries: {
    key: "enquiries",
    businessIdField: "enquiryId",
    labelField: "occasionTitle",
    title: "Enquiries",
    singular: "Enquiry",
    adminPath: "enquiries",
  },
  "event-briefs": {
    key: "event-briefs",
    businessIdField: "briefId",
    labelField: "themeVision",
    title: "Event Briefs",
    singular: "Event brief",
    adminPath: "event-briefs",
  },
  quotes: {
    key: "quotes",
    businessIdField: "quoteId",
    labelField: "quoteId",
    title: "Quotes",
    singular: "Quote",
    adminPath: "quotes",
  },
  services: {
    key: "services",
    businessIdField: "serviceId",
    labelField: "servicePackageName",
    title: "Services",
    singular: "Service",
    adminPath: "services",
  },
  bookings: {
    key: "bookings",
    businessIdField: "eventId",
    labelField: "eventTitle",
    title: "Bookings",
    singular: "Booking",
    adminPath: "bookings",
  },
  tasks: {
    key: "tasks",
    businessIdField: "taskId",
    labelField: "taskActivityCue",
    title: "Tasks",
    singular: "Task",
    adminPath: "tasks",
  },
  changes: {
    key: "changes",
    businessIdField: "changeId",
    labelField: "requestedChange",
    title: "Change Orders",
    singular: "Change order",
    adminPath: "changes",
  },
  feedback: {
    key: "feedback",
    businessIdField: "feedbackId",
    labelField: "eventId",
    title: "Feedback",
    singular: "Feedback",
    adminPath: "feedback",
  },
  vendors: {
    key: "vendors",
    businessIdField: "vendorId",
    labelField: "businessName",
    title: "Vendors",
    singular: "Vendor",
    adminPath: "vendors",
  },
  "vendor-orders": {
    key: "vendor-orders",
    businessIdField: "poId",
    labelField: "scopeSpecification",
    title: "Vendor Orders",
    singular: "Vendor order",
    adminPath: "vendor-orders",
  },
  venues: {
    key: "venues",
    businessIdField: "venueId",
    labelField: "venueName",
    title: "Venues",
    singular: "Venue",
    adminPath: "venues",
  },
  inventory: {
    key: "inventory",
    businessIdField: "itemId",
    labelField: "itemAssetName",
    title: "Inventory",
    singular: "Item",
    adminPath: "inventory",
  },
  handovers: {
    key: "handovers",
    businessIdField: "handoverId",
    labelField: "itemId",
    title: "Handovers",
    singular: "Handover",
    adminPath: "handovers",
  },
  invoices: {
    key: "invoices",
    businessIdField: "invoiceId",
    labelField: "milestone",
    title: "Invoices",
    singular: "Invoice",
    adminPath: "invoices",
  },
  payments: {
    key: "payments",
    businessIdField: "transactionId",
    labelField: "transactionType",
    title: "Payments",
    singular: "Payment",
    adminPath: "payments",
  },
  expenses: {
    key: "expenses",
    businessIdField: "expenseId",
    labelField: "description",
    title: "Expenses",
    singular: "Expense",
    adminPath: "expenses",
  },
  documents: {
    key: "documents",
    businessIdField: "documentId",
    labelField: "documentCheck",
    title: "Documents",
    singular: "Document",
    adminPath: "documents",
  },
  marketing: {
    key: "marketing",
    businessIdField: "contentId",
    labelField: "postTopicCaption",
    title: "Marketing",
    singular: "Content",
    adminPath: "marketing",
  },
};
