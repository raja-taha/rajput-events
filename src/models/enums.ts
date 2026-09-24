export const PREFERRED_CONTACT_METHOD = [
  "WhatsApp",
  "Phone",
  "Email",
  "Other",
] as const;

export const LEAD_SOURCE = [
  "WhatsApp",
  "Google",
  "Facebook",
  "Instagram",
  "Referral",
  "Website",
  "Walk-in",
  "Other",
] as const;

export const MARKETING_CONSENT = ["Not asked", "Yes", "No"] as const;

export const CUSTOMER_STATUS = [
  "Active",
  "Lead",
  "Inactive",
  "Do not contact",
] as const;

export const EVENT_TYPE = [
  "Birthday",
  "Aqiqah",
  "Bridal shower",
  "Engagement",
  "Family gathering",
  "Wedding",
  "Mehndi",
  "Walima",
  "Corporate",
  "Other",
] as const;

export const SETTING_INDOOR_OUTDOOR = [
  "Indoor",
  "Outdoor",
  "Mixed",
  "Undecided",
] as const;

export const VENUE_SETTING = ["Indoor", "Outdoor", "Mixed"] as const;

export const PACKAGE_LEVEL = [
  "Essential",
  "Signature",
  "Premium",
  "Custom",
] as const;

export const ENQUIRY_STAGE = [
  "New",
  "Contacted",
  "Qualified",
  "Quote sent",
  "Won",
  "Lost",
  "On hold",
] as const;

export const YES_NO_PENDING_NA = [
  "Yes",
  "No",
  "Pending",
  "Not applicable",
] as const;

export const CLIENT_APPROVED = YES_NO_PENDING_NA;

export const TAX_TREATMENT_CONFIRMED = YES_NO_PENDING_NA;

export const QUOTE_STATUS = [
  "Draft",
  "Sent",
  "Accepted",
  "Superseded",
  "Rejected",
  "Expired",
] as const;

export const BOOKING_STAGE = [
  "Tentative",
  "Confirmed",
  "In progress",
  "Completed",
  "Cancelled",
] as const;

export const QUOTE_ITEM_CATEGORY = [
  "Decor and backdrop",
  "Flowers",
  "Balloons",
  "Furniture and rentals",
  "Lighting and sound",
  "Catering",
  "Photography and video",
  "Venue",
  "Entertainment",
  "Printing and signage",
  "Transport",
  "Crew and ushers",
  "Security",
  "Other",
] as const;

export const VENDOR_CATEGORY = QUOTE_ITEM_CATEGORY;

export const VENDOR_STATUS = [
  "Prospect",
  "Checking",
  "Approved",
  "Backup",
  "Inactive",
] as const;

export const VENDOR_ORDER_STATUS = [
  "Draft",
  "Approved",
  "Delivered",
  "Closed",
  "Cancelled",
] as const;

export const INVOICE_MILESTONE = [
  "Booking advance",
  "Planning milestone",
  "Pre-event balance",
  "Final adjustment",
] as const;

export const INVOICE_STATUS = ["Draft", "Issued", "Void"] as const;

export const PAYMENT_TYPE = [
  "Client receipt",
  "Client refund",
  "Vendor payment",
  "Vendor refund",
  "Expense payment",
  "Expense refund",
  "Client deposit received",
  "Client deposit returned",
  "Vendor deposit paid",
  "Vendor deposit returned",
  "Owner funds in",
  "Owner drawing",
] as const;
export const PAYMENT_TRANSACTION_TYPE = PAYMENT_TYPE;

export const PAYMENT_METHOD = [
  "Bank transfer",
  "Cash",
  "Cheque",
  "Easypaisa",
  "JazzCash",
  "Other",
] as const;

export const CLEARANCE_STATUS = ["Pending", "Cleared", "Void"] as const;
export const PAYMENT_CLEARANCE = CLEARANCE_STATUS;

export const EXPENSE_SCOPE = ["Startup", "Overhead", "Event"] as const;
export const EXPENSE_COST_SCOPE = EXPENSE_SCOPE;

export const EXPENSE_CATEGORY = [
  "Equipment",
  "Decor materials",
  "Transport",
  "Crew",
  "Marketing",
  "Registration",
  "Office",
  "Utilities",
  "Repairs",
  "Other",
] as const;

export const EXPENSE_APPROVAL = [
  "Draft",
  "Approved",
  "Settled",
  "Cancelled",
] as const;
export const EXPENSE_APPROVAL_STATUS = EXPENSE_APPROVAL;

export const CHANGE_CATEGORY = [
  "Design",
  "Quantity",
  "Timing",
  "Venue",
  "Vendor",
  "Cancellation",
  "Other",
] as const;

export const CHANGE_DECISION = [
  "Requested",
  "Priced",
  "Approved",
  "Rejected",
  "Withdrawn",
] as const;

export const SERVICE_STATUS = ["Draft", "Active", "Retired"] as const;

export const TASK_PHASE = [
  "Business setup",
  "Qualification",
  "Booking",
  "Planning",
  "48-hour check",
  "Setup",
  "Event day",
  "Close-out",
] as const;

export const TASK_STATUS = [
  "Template",
  "To do",
  "In progress",
  "Waiting",
  "Done",
  "Not applicable",
] as const;

export const TASK_PRIORITY = ["High", "Normal", "Low"] as const;

export const INVENTORY_OWNERSHIP = ["Owned", "Rented"] as const;

export const INVENTORY_CONDITION = [
  "New",
  "Good",
  "Needs repair",
  "Damaged",
  "Retired",
] as const;

export const DOCUMENT_SCOPE = ["Business", "Event", "Vendor", "Template"] as const;

export const DOCUMENT_APPLICABILITY = [
  "To confirm",
  "Required",
  "Not applicable",
  "Template",
] as const;

export const DOCUMENT_STATUS = [
  "Template ready",
  "To check",
  "Requested",
  "Draft",
  "Signed",
  "Verified",
  "Expired",
  "Not applicable",
] as const;

export const BANK_DETAILS_VERIFIED = YES_NO_PENDING_NA;

export const MARKETING_PLATFORM = [
  "Google Business",
  "Facebook",
  "Instagram",
  "WhatsApp Business",
  "Website",
  "Other",
] as const;

export const MARKETING_STATUS = [
  "Idea",
  "Draft",
  "In review",
  "Scheduled",
  "Published",
] as const;
export const MARKETING_CONTENT_STATUS = MARKETING_STATUS;

export const MARKETING_CONTENT_TYPE = [
  "Business profile",
  "Service / package",
  "Event portfolio",
  "Client review",
  "Promotion",
  "Other",
] as const;

export const MEDIA_RIGHTS_APPROVED = YES_NO_PENDING_NA;

export const BUDGET_INCLUDES_VENUE_FOOD = [
  "Both",
  "Venue only",
  "Food only",
  "Neither",
  "Partly",
  "Unknown",
] as const;

export const TASK_SCOPE = ["BUSINESS", "EVENT", "TEMPLATE"] as const;

export const CHANGE_IMPLEMENTATION_STATUS = [
  "Not started",
  "In progress",
  "Done",
  "Not applicable",
] as const;

export const FEEDBACK_COMPLETION_SIGNED = YES_NO_PENDING_NA;
export const FEEDBACK_ISSUES_RESOLVED = YES_NO_PENDING_NA;

export const MEDIA_CONSENT = [
  "Not requested",
  "Full consent",
  "Approval per image",
  "Decor only",
  "No marketing use",
] as const;

export const GOOGLE_REVIEW_REQUEST_CONSENT = [
  "Not asked",
  "Yes",
  "No",
  "Ask later",
] as const;

export const REFERRAL_CONTACT_CONSENT = ["Not asked", "Yes", "No"] as const;

// camelCase aliases used by earlier helpers
export const preferredContactMethods = PREFERRED_CONTACT_METHOD;
export const leadSources = LEAD_SOURCE;
export const marketingConsents = MARKETING_CONSENT;
export const customerStatuses = CUSTOMER_STATUS;
export const eventTypes = EVENT_TYPE;
export const settingsIndoorOutdoor = SETTING_INDOOR_OUTDOOR;
export const packageLevels = PACKAGE_LEVEL;
export const enquiryStages = ENQUIRY_STAGE;
export const yesNoPendingNA = YES_NO_PENDING_NA;
export const quoteStatuses = QUOTE_STATUS;
export const bookingStages = BOOKING_STAGE;
export const vendorCategories = VENDOR_CATEGORY;
export const vendorStatuses = VENDOR_STATUS;
export const poStatuses = VENDOR_ORDER_STATUS;
export const invoiceMilestones = INVOICE_MILESTONE;
export const invoiceStatuses = INVOICE_STATUS;
export const paymentTypes = PAYMENT_TYPE;
export const paymentMethods = PAYMENT_METHOD;
export const clearanceStatuses = CLEARANCE_STATUS;
export const expenseScopes = EXPENSE_SCOPE;
export const expenseCategories = EXPENSE_CATEGORY;
export const expenseApprovals = EXPENSE_APPROVAL;
export const changeCategories = CHANGE_CATEGORY;
export const changeDecisions = CHANGE_DECISION;
export const serviceStatuses = SERVICE_STATUS;
export const taskPhases = TASK_PHASE;
export const taskStatuses = TASK_STATUS;
export const taskPriorities = TASK_PRIORITY;
export const ownershipTypes = INVENTORY_OWNERSHIP;
export const conditions = INVENTORY_CONDITION;
export const documentScopes = DOCUMENT_SCOPE;
export const documentStatuses = DOCUMENT_STATUS;
export const marketingPlatforms = MARKETING_PLATFORM;
export const marketingStatuses = MARKETING_STATUS;
