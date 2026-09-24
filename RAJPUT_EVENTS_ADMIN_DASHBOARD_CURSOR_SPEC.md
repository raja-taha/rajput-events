# Rajput Events — Admin Dashboard Implementation Specification

> **Purpose:** Give this file to Cursor and ask it to implement the complete Rajput Events admin dashboard inside the existing website.
>
> **Primary route:** `/admin`
>
> **Database:** MongoDB
>
> **Authentication:** Single administrator account from environment variables. Do **not** create public admin registration.
>
> **Source of truth:** This specification is derived from `Rajput_Events_Business_Workbook(1).xlsx`, which contains 24 sheets covering the complete Rajput Events workflow.

---

# 1. Cursor: read this first

Implement a production-quality internal admin system for **Rajput Events**. Before writing code, inspect the existing repository and reuse its framework, router, styling system, components, API conventions, linting, TypeScript configuration, authentication utilities, and folder structure wherever practical.

Do **not** rebuild or replace the public website. The public website must continue working exactly as it does now. Add the admin application under `/admin` and admin APIs under a clearly isolated namespace such as `/api/admin`.

If this repository is Next.js, prefer the existing App Router/Pages Router convention already used by the project. If it is a React/Vite frontend with an existing Node/Express backend, add `/admin/*` routes to the frontend and `/api/admin/*` routes to the backend. If another supported architecture already exists, adapt the implementation rather than introducing a second application architecture.

Use **TypeScript** if the repository already supports it. Reuse the current UI library. If there is no component system, use **Tailwind CSS + shadcn/ui + Lucide icons**. If there is no chart library, use **Recharts**. If there is no advanced table library, use **TanStack Table**. Do not install replacements when equivalent libraries are already present.

The implementation must be complete enough to use as the operational system for the company; it must not be a visual mock-up with hard-coded dashboard numbers.

---

# 2. Non-negotiable requirements

1. Admin application is available at `/admin`.
2. Login page is `/admin/login`.
3. Every `/admin/*` page except the login page requires an authenticated admin session.
4. Every `/api/admin/*` endpoint except login requires authentication on the server.
5. Admin identity/credentials come from environment variables, not MongoDB.
6. MongoDB connection string comes from `MONGODB_URI` in environment variables.
7. Never expose `MONGODB_URI`, password/hash, session secret, or other server secrets to client-side JavaScript.
8. Do not store the admin password in MongoDB.
9. Use a secure HttpOnly session cookie. Never store the admin token in localStorage.
10. Use MongoDB/Mongoose for persistent business data unless the existing project already uses the native MongoDB driver consistently.
11. All workbook modules described below must have a usable representation in the admin dashboard.
12. Dashboard KPIs must come from live MongoDB data.
13. Workbook-calculated values must be derived by server logic/aggregation and shown as read-only fields.
14. IDs such as `RE-EVT-001` and `RE-CUS-001` are permanent business IDs. Never use array indexes or table row positions as business IDs.
15. Do not reuse an ID after cancellation, archive, sorting, or deletion.
16. Financial transactions that have been cleared/posted should normally be voided or reversed, not silently deleted.
17. Use PKR as the default currency.
18. Use the `Asia/Karachi` business timezone for date-based overdue/due-today logic.
19. Keep client/vendor financial and contact information private inside `/admin`.
20. The admin dashboard must be responsive, but optimize the main operational experience for desktop/tablet.

---

# 3. Recommended environment variables

Create/update `.env.example` without real secrets.

```env
# MongoDB
MONGODB_URI=mongodb+srv://...
MONGODB_DB=rajput_events

# Single-admin authentication
ADMIN_EMAIL=admin@example.com
# Preferred: bcrypt hash, not plaintext
ADMIN_PASSWORD_HASH=$2b$12$REPLACE_WITH_BCRYPT_HASH

# Optional development-only fallback. Do not require this in production.
# ADMIN_PASSWORD=change-me

# Session signing/encryption
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret-at-least-32-bytes
ADMIN_SESSION_TTL_HOURS=8

# Business defaults
BUSINESS_TIMEZONE=Asia/Karachi
BUSINESS_CURRENCY=PKR
```

If the current framework requires particular server environment naming conventions, keep secrets server-only. Do **not** prefix server secrets with `NEXT_PUBLIC_`, `VITE_`, or any client-exposed prefix.

### Password handling

Prefer `ADMIN_PASSWORD_HASH`. Compare the submitted password with bcrypt/bcryptjs on the server. If supporting `ADMIN_PASSWORD` as a development convenience, clearly document that the hash is required for production.

A small script may be added, for example:

```bash
npm run admin:hash-password -- "my-password"
```

The script should output a bcrypt hash that can be copied into `ADMIN_PASSWORD_HASH`.

---

# 4. Authentication and security

## 4.1 Login flow

`GET /admin/login`

- Clean Rajput Events branded login screen.
- Email/username field.
- Password field with show/hide toggle.
- Submit button with loading state.
- Generic invalid-credentials message; do not reveal whether the email or password was incorrect.
- Redirect authenticated users away from login to `/admin`.

`POST /api/admin/auth/login`

1. Read `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` from server environment.
2. Normalize submitted email to lowercase.
3. Constant-time/bcrypt password verification.
4. On success, issue a signed/encrypted short-lived session containing only minimal claims such as:
   - `sub: "rajput-events-admin"`
   - `email`
   - `role: "admin"`
   - `iat`
   - `exp`
5. Put it in an HttpOnly cookie such as `rajput_admin_session`.
6. Cookie configuration:
   - `httpOnly: true`
   - `secure: true` in production
   - `sameSite: "lax"` or stricter if compatible
   - `path: "/"`
   - expiry based on `ADMIN_SESSION_TTL_HOURS`
7. Return only safe admin profile data.

`POST /api/admin/auth/logout`

- Clear the admin cookie server-side.
- Redirect to `/admin/login`.

`GET /api/admin/auth/me`

- Return authenticated admin email and role.

## 4.2 Protection

- Middleware/route guard must protect `/admin` and `/api/admin`.
- Do not rely on hidden navigation links for security.
- Server routes must independently validate the session.
- Add rate limiting to login attempts if the current project has a rate-limiting mechanism. If not, implement a lightweight IP-based login limiter suitable for the existing deployment.
- Validate request `Origin`/same-site behavior for mutation endpoints where applicable.
- Sanitize and validate payloads using the project’s existing validation library; if none exists, use Zod.
- Prevent NoSQL operator injection by accepting only schema-defined fields and never passing arbitrary request objects directly to Mongo queries.
- Use server-side permission checks before every create/update/archive/void operation.

## 4.3 No public admin management yet

The first version is intentionally one environment-defined administrator. Do not build admin signup, password-reset email, roles, or multi-user management unless such functionality already exists in the repository. Structure the code so roles can be added later without rewriting all route guards.

---

# 5. Visual design system

The brand should look like a premium but practical event-management operation, not a generic SaaS template.

## 5.1 Theme

Use a **navy + warm gold + off-white** visual system consistent with Rajput Events branding.

Suggested tokens if the current project has no existing brand tokens:

```css
--re-navy-950: #081726;
--re-navy-900: #0B1F33;
--re-navy-800: #12314D;
--re-gold-600: #B78B2E;
--re-gold-500: #C9A34E;
--re-gold-100: #F4E8C8;
--re-bg: #F6F7F9;
--re-card: #FFFFFF;
--re-border: #E5E7EB;
--re-text: #172033;
--re-muted: #667085;
--re-success: #15803D;
--re-warning: #B45309;
--re-danger: #B42318;
--re-info: #2563EB;
```

Do not overuse gold. Use it for the active navigation indicator, key accents, primary CTA highlights, and selected chart accents. Tables should remain highly readable.

## 5.2 App shell

Desktop:

- Fixed/collapsible left sidebar, approximately 250–270px expanded.
- Dark navy sidebar.
- Rajput Events logo/name at top.
- Grouped navigation with section labels.
- Active route uses a gold accent and high-contrast text.
- Top bar in content area with page title, global search, quick-add control, admin profile, and logout.
- Main content on light neutral background.
- Cards white with subtle border/shadow and 12–16px radius.

Mobile/tablet:

- Sidebar becomes drawer/sheet.
- Tables may horizontally scroll.
- Primary actions remain easily reachable.

## 5.3 Common UI standards

- Clear page title + supporting description.
- Primary `Add ...` button in upper-right on CRUD pages.
- KPI cards with icon, label, current value, and optional small contextual note.
- Status badges with consistent semantic colors.
- Empty states with a clear next action.
- Skeleton loading states instead of layout jumps.
- Toasts for successful/failed mutations.
- Destructive actions require confirmation.
- Form validation messages appear next to fields.
- Money displayed using `Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' })` or an equivalent consistent helper.
- Phone/WhatsApp numbers must be stored and rendered as text, never numeric fields.
- URLs/evidence links should open safely in a new tab.
- Long notes should truncate in list views and show fully in detail/drawer views.
- Use accessible labels, keyboard focus states, and sufficient contrast.

---

# 6. Admin navigation

Use this grouped sidebar structure.

### Overview
- Dashboard — `/admin`

### CRM & Sales
- Customers — `/admin/customers`
- Enquiries — `/admin/enquiries`
- Event Briefs — `/admin/event-briefs`
- Quotes — `/admin/quotes`
- Services & Packages — `/admin/services`

### Events
- Bookings / Events — `/admin/bookings`
- Tasks / Run Sheet — `/admin/tasks`
- Change Orders — `/admin/changes`
- Feedback & Consent — `/admin/feedback`

### Vendors & Logistics
- Vendors — `/admin/vendors`
- Vendor Orders — `/admin/vendor-orders`
- Venues — `/admin/venues`
- Inventory — `/admin/inventory`
- Handovers — `/admin/handovers`

### Finance
- Event Accounts — `/admin/event-accounts`
- Invoices — `/admin/invoices`
- Payments — `/admin/payments`
- Expenses — `/admin/expenses`

### Content & Compliance
- Documents — `/admin/documents`
- Marketing — `/admin/marketing`

### System
- Settings — `/admin/settings`
- Guide — `/admin/guide`
- Import / Migration — `/admin/import` (optional but recommended)

Hide menu items only for responsive presentation, never for security.

---

# 7. Core admin UX patterns

## 7.1 Data table component

Create a reusable server-driven `AdminDataTable` (or adapt an existing table component) with:

- Search.
- Column filters.
- Status/category filters.
- Date range filter where relevant.
- Server-side sorting.
- Server-side pagination.
- Default page size 25; options 10 / 25 / 50 / 100.
- Row click -> detail page or edit drawer.
- Column visibility control where useful.
- Copy business ID action.
- Export current filtered result to CSV where easy to support.
- Persistent URL query params for search/filter/page so filtered views can be bookmarked.

## 7.2 Forms

Use a reusable form system supporting:

- text
- textarea
- email
- phone/text
- money
- percentage
- integer/decimal quantity
- date
- datetime
- time
- select
- relation/autocomplete select
- rating 1–5
- yes/no/pending style selects
- URL/evidence link

Calculated fields must be visibly read-only, preferably in a separate “Calculated” or “Financial summary” section.

## 7.3 Detail pages

Important records should have details beyond a plain table row.

### Event 360 page

`/admin/events/[eventId]` or `/admin/bookings/[eventId]`

Tabs/sections:

- Overview
- Customer & enquiry
- Event brief
- Accepted quote + quote items
- Invoices & client payments
- Vendor orders & supplier payments
- Tasks / run sheet
- Change orders
- Documents / permissions
- Inventory / handovers
- Feedback / consent
- Event accounts / profitability

This should become the most useful operational page in the system.

### Customer 360

`/admin/customers/[customerId]`

Show customer details plus linked enquiries, bookings/events, quotes, invoices, payments, and feedback.

### Vendor 360

`/admin/vendors/[vendorId]`

Show vendor details plus purchase orders, payment history, handovers/rentals, rating, issues, and verification documents.

---

# 8. MongoDB architecture

## 8.1 Primary collections

Create MongoDB collections/models for:

1. `customers`
2. `enquiries`
3. `eventBriefs`
4. `bookings`
5. `quotes`
6. `quoteItems`
7. `invoices`
8. `vendors`
9. `vendorOrders`
10. `venues`
11. `services`
12. `changes`
13. `payments`
14. `expenses`
15. `tasks`
16. `inventoryItems`
17. `handovers`
18. `documents`
19. `feedback`
20. `marketingContent`
21. `settings`
22. `auditLogs` — application addition
23. `counters` — internal ID generation

Do **not** create persisted `dashboard` or `eventAccounts` documents unless caching is later proven necessary. Those are calculated views/aggregations over source collections.

## 8.2 Standard metadata on records

Add where appropriate:

```ts
createdAt: Date
updatedAt: Date
createdBy: string // currently "env-admin"
updatedBy: string
archivedAt?: Date | null
archivedBy?: string | null
```

Use timestamps automatically in Mongoose.

## 8.3 Money

Never store formatted strings such as `"PKR 50,000"` as calculation fields.

Prefer MongoDB `Decimal128` for monetary fields if practical in the current codebase. Otherwise use the project’s established numeric money convention consistently. Centralize conversions/formatting. Signed change/refund-related monetary fields must support negative values where the workbook explicitly allows them.

## 8.4 Relations

Use permanent business IDs for human-readable relationships in addition to Mongo `_id` where helpful. The safest first implementation is to keep explicit business-ID foreign keys because all workbook workflows are ID-based.

Core relationship graph:

```text
Customer
  -> Enquiries
      -> Event Brief
      -> Quotes -> Quote Items
      -> Booking/Event
          -> Invoices -> Payments
          -> Vendor Orders -> Vendor -> Payments
          -> Changes
          -> Tasks
          -> Documents
          -> Handovers -> Inventory
          -> Feedback
          -> Marketing Content
          -> Event Accounts (derived)
```

Use database indexes for every frequently joined business ID.

---

# 9. Business ID generation

IDs must be stable and sequential enough for operations, but never generated by counting documents because concurrent requests can duplicate IDs.

Use an atomic `counters` collection with `findOneAndUpdate({ key }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' })`.

Suggested prefixes:

| Entity | Prefix | Example |
|---|---|---|
| Customer | `RE-CUS` | `RE-CUS-001` |
| Enquiry | `RE-ENQ` | `RE-ENQ-001` |
| Event brief | `RE-BRF` | `RE-BRF-001` |
| Event/booking | `RE-EVT` | `RE-EVT-001` |
| Quote | `RE-Q` | `RE-Q-001` |
| Quote line | `RE-QL` | `RE-QL-001` |
| Invoice | `RE-INV` | `RE-INV-001` |
| Vendor | `RE-VEN` | `RE-VEN-001` |
| Vendor order / PO | `RE-PO` | `RE-PO-001` |
| Venue | `RE-VNU` | `RE-VNU-001` |
| Service | `RE-SVC` | `RE-SVC-001` |
| Change | `RE-CHG` | `RE-CHG-001` |
| Payment | `RE-PAY` | `RE-PAY-001` |
| Expense | `RE-EXP` | `RE-EXP-001` |
| Task | `RE-TSK` | `RE-TSK-001` |
| Inventory item | `RE-ITM` | `RE-ITM-001` |
| Handover | `RE-HND` | `RE-HND-001` |
| Document | `RE-DOC` | `RE-DOC-001` |
| Feedback | `RE-FDB` | `RE-FDB-001` |
| Marketing content | `RE-MKT` | `RE-MKT-001` |

Imported workbook IDs must be preserved exactly and counters advanced to at least the imported maximum.

Task templates may keep `TPL-001` etc. because they are templates, not event task IDs.

---

# 10. Workbook modules -> MongoDB models

Every field below corresponds to the source workbook. Use camelCase names in code and human-friendly labels in the UI.

## 10.1 Customers

**Collection:** `customers`

Fields:

| UI label | Suggested field | Type |
|---|---|---|
| Customer ID | `customerId` | string, unique, generated |
| Full name | `fullName` | string, required |
| Family / company | `familyOrCompany` | string |
| Mobile / WhatsApp | `mobileWhatsApp` | string |
| Email | `email` | string |
| Billing address | `billingAddress` | string |
| City / area | `cityArea` | string |
| Preferred contact method | `preferredContactMethod` | enum |
| Best contact time | `bestContactTime` | string |
| Decision maker | `decisionMaker` | string |
| Backup contact / phone | `backupContact` | string |
| Lead source | `leadSource` | enum |
| Relationship owner | `relationshipOwner` | string |
| Added on | `addedOn` | date |
| Marketing contact consent | `marketingConsent` | enum |
| Preferences / notes | `notes` | text |
| Record check | derived | read-only |

Enums:

```ts
preferredContactMethod = ['WhatsApp', 'Phone', 'Email', 'Other']
leadSource = ['WhatsApp', 'Google', 'Facebook', 'Instagram', 'Referral', 'Website', 'Walk-in', 'Other']
marketingConsent = ['Not asked', 'Yes', 'No']
```

Customer record check should flag obvious missing identity/contact fields without preventing draft creation. For example, `OK` when name + at least one contact method exist; otherwise `Review` with reasons.

Indexes:

- unique `customerId`
- normalized email
- mobile/WhatsApp
- text/search index or application search on fullName + family/company

---

## 10.2 Enquiries

**Collection:** `enquiries`

Fields:

- `enquiryId` — unique permanent ID
- `receivedOn` — date/datetime
- `customerId` — required relation to Customer
- `eventType`
- `occasionTitle`
- `preferredDate`
- `alternativeDate`
- `expectedGuests`
- `preferredArea`
- `venueStatusOrName`
- `setting`
- `targetBudget`
- `budgetIncludesVenueFood`
- `packageLevel`
- `requiredServices` — string array preferred in app; importer may split workbook text conservatively
- `mustHavesPriorities`
- `leadSource`
- `stage`
- `followUpOwner`
- `nextAction`
- `followUpDate`
- `quoteNeededBy`
- `lostHoldReason`
- `conversationNotes`
- `followUpStatus` — derived, not editable
- `recordCheck` — derived

Enums:

```ts
eventType = [
  'Birthday', 'Aqiqah', 'Bridal shower', 'Engagement', 'Family gathering',
  'Wedding', 'Mehndi', 'Walima', 'Corporate', 'Other'
]
setting = ['Indoor', 'Outdoor', 'Mixed', 'Undecided']
budgetIncludesVenueFood = ['Both', 'Venue only', 'Food only', 'Neither', 'Partly', 'Unknown']
packageLevel = ['Essential', 'Signature', 'Premium', 'Custom']
leadSource = ['WhatsApp', 'Google', 'Facebook', 'Instagram', 'Referral', 'Website', 'Other']
stage = ['New', 'Contacted', 'Qualified', 'Quote sent', 'Won', 'Lost', 'On hold']
```

Derived follow-up logic:

```text
if stage is Won or Lost -> Closed
else if no followUpDate -> Set follow-up
else if followUpDate < today in Asia/Karachi -> Overdue
else if calendar date == today -> Due today
else -> Upcoming
```

The dashboard “Open enquiries” count is enquiries with IDs whose stage is neither `Won` nor `Lost`.

---

## 10.3 Event Briefs

**Collection:** `eventBriefs`

Fields:

- `briefId`
- `enquiryId` — relation
- `eventId` — optional until booking
- `themeVision`
- `colours`
- `mustHaveElements`
- `elementsToAvoid`
- `referenceDesignLinks` — array of URLs or multiline string
- `familyCulturalNeeds`
- `foodDietaryNeeds`
- `accessNeeds`
- `privacyPhotographyRestrictions`
- `siteVisitDate`
- `dimensionsCeilingHeight`
- `loadingSetupAccessWindow`
- `powerBackupArrangements`
- `soundFlameVenueRules`
- `weatherBackupPlan`
- `programmeSpecialCues`
- `designApprovalDue`
- `clientApproved`
- `approvalEvidenceLink`
- `notes`

Enum:

```ts
clientApproved = ['Yes', 'No', 'Pending', 'Not applicable']
```

Prefer one active brief per enquiry; allow revisions if there is a real need, but do not silently overwrite approval evidence.

---

## 10.4 Quotes

**Collections:** `quotes`, `quoteItems`

### Quote fields

- `quoteId`
- `customerId`
- `enquiryId`
- `eventId` — optional before booking
- `issueDate`
- `validUntil`
- `version`
- `status`
- `itemSubtotal` — derived from quote items
- `discount` — default 0
- `feeExclTax` — derived
- `taxTreatmentConfirmed`
- `taxAmount`
- `quoteTotal` — derived
- `bookingAdvancePercent` — 0..1 internally or a well-defined percent convention; keep consistent
- `bookingAdvanceAmount` — derived
- `acceptanceDate`
- `acceptanceQuoteLink`
- `scopeAndExclusions`
- `recordCheck` — derived

Enums:

```ts
status = ['Draft', 'Sent', 'Accepted', 'Superseded', 'Rejected', 'Expired']
taxTreatmentConfirmed = ['Yes', 'No', 'Pending', 'Not applicable']
```

### Quote item fields

- `lineId`
- `quoteId`
- `category`
- `serviceDeliverable`
- `specificationFinish`
- `quantity`
- `unit`
- `unitPriceExclTax`
- `lineAmount` — derived `quantity * unitPriceExclTax`
- `approvalDeadline`
- `notes`
- `recordCheck` — derived

Categories:

```ts
[
  'Decor and backdrop', 'Flowers', 'Balloons', 'Furniture and rentals',
  'Lighting and sound', 'Catering', 'Photography and video', 'Venue',
  'Entertainment', 'Printing and signage', 'Transport', 'Crew and ushers',
  'Security', 'Other'
]
```

Calculation rules:

```text
itemSubtotal = sum(lineAmount for all quoteItems with this quoteId)
feeExclTax = itemSubtotal - discount
quoteTotal = feeExclTax + taxAmount
bookingAdvanceAmount = quoteTotal * bookingAdvancePercent
```

Do not guess a tax rate. `taxAmount` is an explicitly entered confirmed amount. The workbook specifically avoids assuming tax treatment.

Quote acceptance rules:

- An `Accepted` quote should have `acceptanceDate` and evidence/link.
- When a newer quote version is accepted, provide a workflow to mark older active versions as `Superseded`.
- Only an accepted quote should be linked as the booking’s accepted quote.

Quote editor UX should be a strong feature: editable line-item table with automatic subtotal, discount, tax, total, and advance preview.

---

## 10.5 Bookings / Events

**Collection:** `bookings`

Fields:

- `eventId`
- `enquiryId`
- `customerId`
- `eventTitle`
- `eventType`
- `eventDate`
- `startTime`
- `endTime`
- `guestCount`
- `venueId`
- `acceptedQuoteId`
- `stage`
- `agreementSigned`
- `bookingAdvanceDue` — preferably derived from accepted quote, but persist only if the system needs a historical snapshot
- `advanceDueDate`
- `finalBalanceDue`
- `venueConfirmed`
- `vendorCapacityChecked`
- `rajputEventsLead`
- `onsiteClientContact`
- `onsiteWhatsApp`
- `backupContactPhone`
- `signedAgreementLink`
- `eventFolderLink`
- `netClientCashReceived` — derived
- `bookingChecks` — derived
- `costsFinalised`
- `notes`

Enums:

```ts
eventType = [
  'Birthday', 'Aqiqah', 'Bridal shower', 'Engagement', 'Family gathering',
  'Wedding', 'Mehndi', 'Walima', 'Corporate', 'Other'
]
stage = ['Tentative', 'Confirmed', 'In progress', 'Completed', 'Cancelled']
yesNoPendingNA = ['Yes', 'No', 'Pending', 'Not applicable']
```

Use `yesNoPendingNA` for agreement, venue confirmation, vendor capacity, and costs finalised if preserving workbook semantics. For code ergonomics it is acceptable to normalize `costsFinalised` to a boolean plus status metadata, but the UI must preserve the same intent.

### Booking checks

Return `Booking checks complete` only when all required prerequisites are satisfied:

1. `acceptedQuoteId` exists and points to an Accepted quote belonging to the same customer/enquiry/event context.
2. Signed client agreement is confirmed and `signedAgreementLink` is present when required.
3. Cleared client service receipts are at least the agreed booking advance amount. Refundable client deposits do **not** count as service-fee advance receipts.
4. Venue confirmed is `Yes` or `Not applicable` as applicable.
5. Vendor capacity checked is `Yes` or `Not applicable`.

Otherwise return a concise checklist status with missing items. On the UI, show the individual check states rather than only one opaque status string.

Dashboard confirmed events count = booking stage `Confirmed`.

Upcoming events count = non-cancelled bookings with event date from today through the next 30 days.

---

## 10.6 Venues

**Collection:** `venues`

Fields:

- `venueId`
- `venueName`
- `areaCity`
- `addressMapLink`
- `venueManager`
- `managerMobile`
- `guestCapacity`
- `setting`
- `indicativeRental`
- `securityDeposit`
- `loadingAccessWindow`
- `eventSoundCutoff`
- `powerGenerator`
- `parkingAccessibility`
- `decorFlameRiggingRules`
- `weatherBackupAssemblyPoint`
- `emergencyContactFirstAid`
- `lastChecked`
- `venueAgreementPhotos`

Enum:

```ts
setting = ['Indoor', 'Outdoor', 'Mixed']
```

Show a “last verified” warning when venue information has not been checked recently; make the threshold configurable in code/settings rather than inventing a legal rule.

---

## 10.7 Vendors

**Collection:** `vendors`

Fields:

- `vendorId`
- `businessName`
- `category`
- `servicesSpecialities`
- `authorizedContact`
- `mobileWhatsApp`
- `email`
- `addressCoverageArea`
- `portfolioRateCardLink`
- `indicativeRate`
- `rateUnitInclusions`
- `rateVerifiedOn`
- `leadTimeWeekendAvailability`
- `depositPaymentTerms`
- `deliverySetupCollectionTerms`
- `cancellationRefundTerms`
- `identityTaxReference`
- `licenceStatusExpiry`
- `bankAccountTitle`
- `bankIban`
- `bankDetailsVerified`
- `verificationAgreementFolder`
- `emergencyBackupContact`
- `performanceRating`
- `vendorStatus`
- `notesIssues`
- `recordCheck` — derived

Enums:

```ts
category = [
  'Decor and backdrop', 'Flowers', 'Balloons', 'Furniture and rentals',
  'Lighting and sound', 'Catering', 'Photography and video', 'Venue',
  'Entertainment', 'Printing and signage', 'Transport', 'Crew and ushers',
  'Security', 'Other'
]
bankDetailsVerified = ['Yes', 'No', 'Pending', 'Not applicable']
vendorStatus = ['Prospect', 'Checking', 'Approved', 'Backup', 'Inactive']
performanceRating = integer 1..5
```

The dashboard “Approved vendors” KPI counts vendor status `Approved`.

Never treat “Approved vendor” as live event availability; booking capacity confirmation is a separate check.

---

## 10.8 Vendor Orders / Purchase Orders

**Collection:** `vendorOrders`

Fields:

- `poId`
- `eventId`
- `vendorId`
- `scopeSpecification`
- `quantity`
- `unit`
- `unitRate`
- `scopeSubtotal` — derived
- `deliverySetupExtras`
- `taxAmount`
- `totalAgreedCost` — derived
- `status`
- `advanceDue`
- `advanceDueDate`
- `balanceDueDate`
- `deliverySetupTime`
- `collectionTime`
- `netClearedPayments` — derived from non-deposit vendor service payments/refunds linked to this PO
- `balanceOverpaid` — derived
- `signedPoAgreement`
- `cancellationRefundTerms`
- `backupContactSupplier`
- `deliveryNotes`
- `recordCheck` — derived

Enum:

```ts
status = ['Draft', 'Approved', 'Delivered', 'Closed', 'Cancelled']
```

Calculations:

```text
scopeSubtotal = quantity * unitRate
totalAgreedCost = scopeSubtotal + deliverySetupExtras + taxAmount
netClearedPayments = cleared Vendor payment - cleared Vendor refund for this PO
balance = totalAgreedCost - netClearedPayments
```

Refundable `Vendor deposit paid/returned` transactions must not reduce vendor service cost or settle a PO service balance.

Do not duplicate PO costs in Expenses.

Cancelled POs may retain a final cancellation liability. If a cancelled PO has a legitimate non-zero final agreed cost, include that final liability in event direct cost. Do not simply force cancelled PO cost to zero.

---

## 10.9 Invoices

**Collection:** `invoices`

Fields:

- `invoiceId`
- `eventId`
- `milestone`
- `issueDate`
- `dueDate`
- `amountBilledInclTax`
- `status`
- `netClearedCash` — derived from client receipts/refunds linked to invoice
- `unpaidCredit` — derived
- `paymentStatus` — derived
- `invoiceLink`
- `notesAdjustments`
- `recordCheck` — derived

Enums:

```ts
milestone = ['Booking advance', 'Planning milestone', 'Pre-event balance', 'Final adjustment']
status = ['Draft', 'Issued', 'Void']
```

Rules:

```text
netClearedCash = cleared Client receipt - cleared Client refund linked to invoiceId
unpaid = amountBilledInclTax - netClearedCash

if invoice.status == 'Void' -> Void
else if invoice.status == 'Draft' -> Draft
else if unpaid <= 0 -> Paid (or Credit if significantly negative)
else if dueDate < today -> Overdue
else if dueDate == today -> Due today
else if netClearedCash > 0 -> Part paid
else -> Unpaid
```

Invoices are **incremental billing records**, not a second copy of contract value. Final invoices must not re-bill an advance already invoiced.

Add an event-level invoice reconciliation panel:

```text
sum(non-void invoice amounts) vs current event contract total
```

Flag mismatches for close-out review without automatically changing either side.

---

## 10.10 Payments

**Collection:** `payments`

Fields:

- `transactionId`
- `transactionDate`
- `eventId`
- `transactionType`
- `referenceId` — workbook column “PO ID / Expense ID”; store explicit `poId` and `expenseId` fields if cleaner
- `poId`
- `expenseId`
- `invoiceId`
- `receiptNumber`
- `payerPayee`
- `method`
- `bankWalletReference`
- `amount` — always positive
- `clearance`
- `clearedOn`
- `receiptBankEvidence`
- `cashIn` — derived
- `cashOut` — derived
- `recordCheck` — derived

Transaction types:

```ts
[
  'Client receipt',
  'Client refund',
  'Vendor payment',
  'Vendor refund',
  'Expense payment',
  'Expense refund',
  'Client deposit received',
  'Client deposit returned',
  'Vendor deposit paid',
  'Vendor deposit returned',
  'Owner funds in',
  'Owner drawing'
]
```

Methods:

```ts
['Bank transfer', 'Cash', 'Cheque', 'Easypaisa', 'JazzCash', 'Other']
```

Clearance:

```ts
['Pending', 'Cleared', 'Void']
```

### Cash direction

For cleared transactions only:

**Cash in:**

- Client receipt
- Vendor refund
- Expense refund
- Client deposit received
- Vendor deposit returned
- Owner funds in

**Cash out:**

- Client refund
- Vendor payment
- Expense payment
- Client deposit returned
- Vendor deposit paid
- Owner drawing

Pending/void transactions contribute 0 to dashboard cash.

### Link validation

- `Client receipt/refund` generally requires `eventId`, and invoice-related receipts/refunds should carry `invoiceId`.
- `Vendor payment/refund` requires `eventId` + `poId`.
- `Expense payment/refund` requires `expenseId`, and `eventId` when that expense belongs to an event.
- Deposits should carry the relevant event/party context and evidence.
- Owner funds/drawings do not require an event.
- Cleared transactions should have `clearedOn` and evidence/reference where practical.

`recordCheck = OK` only when the transaction has the required references and evidence for its type. Dashboard “Cleared payments to review” counts cleared records whose record check is not `OK`.

Never enter the same real-world cash movement more than once.

---

## 10.11 Expenses

**Collection:** `expenses`

Fields:

- `expenseId`
- `recordedOn`
- `costScope`
- `eventId` — required when scope is Event
- `category`
- `description`
- `plannedCost`
- `actualAgreedCost`
- `paymentDueDate`
- `approvalStatus`
- `payee`
- `netClearedPayments` — derived
- `unpaidOverpaid` — derived
- `actualLessPlanned` — derived
- `invoiceReceiptEvidence`
- `notes`
- `recordCheck` — derived

Enums:

```ts
costScope = ['Startup', 'Overhead', 'Event']
category = ['Equipment', 'Decor materials', 'Transport', 'Crew', 'Marketing', 'Registration', 'Office', 'Utilities', 'Repairs', 'Other']
approvalStatus = ['Draft', 'Approved', 'Settled', 'Cancelled']
```

Calculations:

```text
netClearedPayments = cleared Expense payment - cleared Expense refund for this expenseId
unpaid = actualAgreedCost - netClearedPayments
variance = actualAgreedCost - plannedCost
```

Only event expenses are included in event direct cost. Startup and overhead remain separate dashboard totals.

Do not record a vendor PO cost again as an Expense.

---

## 10.12 Event Change Orders

**Collection:** `changes`

Fields:

- `changeId`
- `eventId`
- `requestedOn`
- `requestedBy`
- `changeCategory`
- `originalScope`
- `requestedChange`
- `feeChangeExclTax` — signed; can be negative
- `taxChange` — signed; can be negative
- `totalClientChange` — derived
- `decision`
- `approvedOn`
- `signedApprovalLink`
- `scheduleVendorImpact`
- `implementationOwner`
- `paymentDueDate`
- `implementationStatus`
- `recordCheck` — derived

Enums:

```ts
changeCategory = ['Design', 'Quantity', 'Timing', 'Venue', 'Vendor', 'Cancellation', 'Other']
decision = ['Requested', 'Priced', 'Approved', 'Rejected', 'Withdrawn']
implementationStatus = ['Not started', 'In progress', 'Done', 'Not applicable']
```

Rules:

```text
totalClientChange = feeChangeExclTax + taxChange
```

Only `Approved` changes with an approval date and signed evidence affect event contract calculations.

For cancelled events, preserve original records. Use approved negative change orders for fee reductions and Payments for actual refunds.

---

## 10.13 Event Accounts — derived view

**No primary collection.** Build a Mongo aggregation/service that calculates one event-account row per booking.

Output fields matching the workbook:

- `eventId`
- `eventTitle`
- `eventDate`
- `stage`
- `baseFeeExclTax`
- `approvedFeeChanges`
- `currentFeeExclTax`
- `clientTaxAmount`
- `contractTotal`
- `netClientCashReceived`
- `clientBalanceCredit`
- `receivable`
- `clientCredit`
- `vendorCostCommitted`
- `otherEventCost`
- `totalDirectCost`
- `eventContribution`
- `contributionMargin`
- `clientDepositHeld`
- `vendorDepositHeld`
- `costsFinalised`
- `recordCheck`

Calculations:

```text
baseFeeExclTax = accepted quote feeExclTax
approvedFeeChanges = sum(approved change.feeChangeExclTax)
currentFeeExclTax = baseFeeExclTax + approvedFeeChanges

clientTaxAmount = accepted quote taxAmount + sum(approved change.taxChange)
contractTotal = currentFeeExclTax + clientTaxAmount

netClientCashReceived =
  cleared Client receipt for event
  - cleared Client refund for event
# Exclude refundable client deposit transactions.

clientBalance = contractTotal - netClientCashReceived
receivable = max(clientBalance, 0)
clientCredit = max(-clientBalance, 0)

vendorCostCommitted = sum(final/committed vendor order totalAgreedCost)
# Include Approved, Delivered and Closed orders.
# If a Cancelled PO intentionally retains a final cancellation liability,
# include that final liability as well.

otherEventCost = sum(actualAgreedCost for Event-scope Expenses with Approved/Settled status)
totalDirectCost = vendorCostCommitted + otherEventCost

eventContribution = currentFeeExclTax - totalDirectCost
contributionMargin = currentFeeExclTax != 0 ? eventContribution / currentFeeExclTax : null

clientDepositHeld =
  cleared Client deposit received
  - cleared Client deposit returned

vendorDepositHeld =
  cleared Vendor deposit paid
  - cleared Vendor deposit returned
```

Important accounting intent:

- Event contribution excludes startup costs, overhead, owner tax, and refundable deposits.
- Direct-cost amounts include whatever supplier/expense tax was entered; detailed recoverable-tax accounting is not modeled here.
- Payment rows move cash but do not create a second cost/revenue entry.

### Event Accounts record check

Return an `OK`, `Costs provisional`, or `Review` state plus structured reasons.

Possible checks:

- accepted quote missing/not Accepted
- quote tax treatment not confirmed
- current contract total negative unexpectedly
- costs not finalized
- issued invoice total differs from current contract total at close-out
- client credit exists and refund/adjustment may be needed
- financial records reference missing entities

Dashboard “Event accounts needing review” should ignore `OK` and the expected `Costs provisional` state and count the remaining review/error states.

---

## 10.14 Services & Packages

**Collection:** `services`

Fields:

- `serviceId`
- `servicePackageName`
- `categoryLevel`
- `pricingUnit`
- `includedScope`
- `excludedOptionalItems`
- `estimatedDeliveryCost`
- `sellingPriceExclTax`
- `indicativeMargin` — derived
- `status`
- `reviewedOn`
- `pricingNotes`

Enum:

```ts
status = ['Draft', 'Active', 'Retired']
```

Margin calculation from workbook:

```text
if estimatedDeliveryCost or sellingPrice is missing, or sellingPrice == 0 -> null
else indicativeMargin = (sellingPriceExclTax - estimatedDeliveryCost) / sellingPriceExclTax
```

Show margin as a percentage.

---

## 10.15 Tasks / Event Run Sheet

**Collection:** `tasks`

Fields:

- `taskId`
- `eventIdOrBusiness` — use `eventId` nullable plus `scope: 'BUSINESS' | 'EVENT' | 'TEMPLATE'` if cleaner
- `phase`
- `taskActivityCue`
- `responsiblePerson`
- `ownerMobile`
- `approver`
- `dueStartAt`
- `durationMinutes`
- `dependencyTaskId`
- `status`
- `priority`
- `locationCue`
- `completionEvidence`
- `dueStatus` — derived
- `notesEscalation`
- `isTemplate` — boolean recommended

Enums:

```ts
phase = ['Business setup', 'Qualification', 'Booking', 'Planning', '48-hour check', 'Setup', 'Event day', 'Close-out']
status = ['Template', 'To do', 'In progress', 'Waiting', 'Done', 'Not applicable']
priority = ['High', 'Normal', 'Low']
```

Derived due status matching workbook intent:

```text
if status in ['Template', 'Done', 'Not applicable'] -> status
else if no dueStartAt -> Set due date
else if dueStartAt < now/today as appropriate -> Overdue
else if due calendar date == today -> Due today
else -> Upcoming
```

Provide:

- List/table view.
- Kanban-ish status filter optional, not required.
- Event run-sheet view sorted by due/start time.
- “Apply event task template” button on an event, creating new event-specific tasks from the template rows with new `RE-TSK-*` IDs.
- Bulk owner/status update is useful but can follow after core CRUD.

---

## 10.16 Inventory

**Collection:** `inventoryItems`

Fields:

- `itemId`
- `itemAssetName`
- `category`
- `ownership`
- `quantityHeld`
- `unit`
- `unitPurchaseCost`
- `recordedAssetStockCost` — derived
- `storageLocation`
- `currentCondition`
- `quantityNotReturned` — derived from Handovers
- `quantityAvailable` — derived
- `reorderLevel`
- `stockStatus` — derived
- `supplierVendorId`
- `photoPurchaseEvidence`
- `notes`

Enums:

```ts
ownership = ['Owned', 'Rented']
currentCondition = ['New', 'Good', 'Needs repair', 'Damaged', 'Retired']
```

Calculations:

```text
recordedAssetStockCost = quantityHeld * unitPurchaseCost
quantityNotReturned = sum(max(handover.quantityOutstanding, 0) for item)
quantityAvailable = max(quantityHeld - quantityNotReturned, 0)
```

Suggested stock status:

```text
if currentCondition == 'Retired' -> Retired
else if quantityAvailable <= 0 -> Out of stock
else if reorderLevel is set and quantityAvailable <= reorderLevel -> Low stock
else -> Available
```

Do not automatically reduce `quantityHeld` merely because an item is currently issued. Reduce `quantityHeld` only for confirmed consumption/loss/disposal workflows.

---

## 10.17 Handovers

**Collection:** `handovers`

Fields:

- `handoverId`
- `eventId`
- `itemId`
- `vendorIdIfRented`
- `issuedOn`
- `returnDue`
- `quantityOut`
- `quantityReturned`
- `quantityUsedLost`
- `returnedOn`
- `quantityOutstanding` — derived
- `conditionOut`
- `conditionInDamage`
- `receivedByContact`
- `returnAcceptedBy`
- `handoverPhotoEvidence`
- `returnStatus` — derived
- `varianceResolutionNotes`

Calculation:

```text
quantityOutstanding = max(quantityOut - quantityReturned - quantityUsedLost, 0)
```

Status logic:

```text
if quantityOutstanding <= 0 -> Returned / Closed
else if returnDue is missing -> Due date required
else if returnDue < today -> Overdue
else if returnDue == today -> Due today
else -> Outstanding
```

Dashboard overdue equipment returns counts `Overdue` handovers.

Financial deductions for losses should be represented through approved Changes or Expenses plus Payments, not by inventing hidden inventory accounting.

---

## 10.18 Documents / Agreements / Permissions

**Collection:** `documents`

Fields:

- `documentId`
- `scope`
- `entityId` — Event ID or Vendor ID as applicable; optionally split into `eventId` and `vendorId`
- `documentCheck`
- `applicability`
- `responsiblePerson`
- `reviewerAuthority`
- `status`
- `dueRenewalDate`
- `certificateAgreementNo`
- `completedFileEvidenceLink`
- `lastVerified`
- `actionStatus` — derived
- `notesTemplateFilename`
- `isTemplate`

Enums:

```ts
scope = ['Business', 'Event', 'Vendor', 'Template']
applicability = ['To confirm', 'Required', 'Not applicable', 'Template']
status = ['Template ready', 'To check', 'Requested', 'Draft', 'Signed', 'Verified', 'Expired', 'Not applicable']
```

Derived action status should mirror the workbook:

```text
if scope == Template or status == 'Template ready' -> Template
else if applicability == 'Not applicable' or status == 'Not applicable' -> Not applicable
else if status in ['Signed', 'Verified']:
    if no completed evidence link -> Link evidence
    else if dueRenewalDate exists and dueRenewalDate < today -> Review renewal
    else -> Filed
else:
    if no dueRenewalDate -> Set owner / due date
    else if dueRenewalDate < today -> Overdue
    else -> Open
```

Do not store uploaded binaries directly in MongoDB. Store metadata/URLs. If the existing project already has S3/Cloudinary/another file storage system, integrate with it; otherwise keep link fields first and design an upload adapter for later.

---

## 10.19 Feedback / Completion / Media Consent

**Collection:** `feedback`

Fields:

- `feedbackId`
- `eventId`
- `recordedOn`
- `completionSigned`
- `overallRating`
- `whatWorkedWell`
- `whatToImproveOpenIssues`
- `actionOwner`
- `actionDueDate`
- `issuesResolved`
- `mediaConsent`
- `restrictionsEmbargoCredit`
- `signedConsentCompletionLink`
- `googleReviewRequestConsent`
- `reviewRequestedOn`
- `referralContactConsent`
- `lessonsForNextEvent`

Enums:

```ts
completionSigned = ['Yes', 'No', 'Pending', 'Not applicable']
issuesResolved = ['Yes', 'No', 'Pending', 'Not applicable']
overallRating = integer 1..5
mediaConsent = ['Not requested', 'Full consent', 'Approval per image', 'Decor only', 'No marketing use']
googleReviewRequestConsent = ['Not asked', 'Yes', 'No', 'Ask later']
referralContactConsent = ['Not asked', 'Yes', 'No']
```

Marketing screens must surface media-consent restrictions before event media is published.

---

## 10.20 Marketing

**Collection:** `marketingContent`

Fields:

- `contentId`
- `platform`
- `plannedPublishDate`
- `contentType`
- `eventId`
- `postTopicCaption`
- `imageVideoDesignLink`
- `owner`
- `status`
- `mediaRightsApproved`
- `consentRightsEvidence`
- `publishedUrl`
- `publishingCheck` — derived

Enums:

```ts
platform = ['Google Business', 'Facebook', 'Instagram', 'WhatsApp Business', 'Website', 'Other']
contentType = ['Business profile', 'Service / package', 'Event portfolio', 'Client review', 'Promotion', 'Other']
status = ['Idea', 'Draft', 'In review', 'Scheduled', 'Published']
mediaRightsApproved = ['Yes', 'No', 'Pending', 'Not applicable']
```

Workbook publishing check intent:

```text
if no eventId -> Review content before posting
else if mediaRightsApproved == 'Yes' and consentRightsEvidence exists -> Rights evidence recorded
else -> Record media approval
```

Improve this in the app by also reading the event Feedback media-consent record and warning when consent is `No marketing use`, `Decor only`, or requires per-image approval.

---

## 10.21 Settings

**Collection:** `settings`

This is application/business configuration, not secret configuration.

Initial settings from workbook:

- Business name: `Rajput Events`
- Business email: `rajputevents04@gmail.com`
- Service area: `Rawalpindi / Islamabad`
- Currency: `PKR`
- Business WhatsApp: blank until entered
- Business address: blank until entered
- Bank account title: blank until verified
- Bank / IBAN: blank until verified
- Initial launch note: `Small private weekend events`
- Advance suggestion/reference: `60%` only as a planning suggestion, not a system-enforced default
- Balance suggestion/reference: `48 hours before the event`, not an automatic contract term
- Initial service focus: `Simple decor and coordination`

Do not migrate Excel row-capacity settings; MongoDB removes those spreadsheet limitations.

Settings UI sections:

1. Business profile
2. Contact details
3. Verified payment instructions
4. Operating/service area
5. Display preferences (currency/timezone fixed to PKR/Asia-Karachi initially)
6. Planning-reference notes

Never put admin credentials or MongoDB secrets in this collection.

---

# 11. Dashboard `/admin`

The workbook dashboard contains three conceptual areas: workload, cash/deposits, attention items, and event economics. The web dashboard should retain those KPIs and add visual charts/operational widgets.

## 11.1 Header

- Title: `Rajput Events Dashboard`
- Subtitle: `Operations, events, cash and follow-ups at a glance`
- “As of” current date/time.
- Quick actions:
  - New enquiry
  - New customer
  - New vendor
  - Create quote
  - Record payment

## 11.2 KPI row — workload

Cards:

1. Customers — total customer records.
2. Open enquiries — stage not Won/Lost.
3. Confirmed events — booking stage Confirmed.
4. Events next 30 days — non-cancelled events in date window.
5. Completed events — booking stage Completed.
6. Approved vendors — vendor status Approved.

Each card should be clickable and open the corresponding pre-filtered list.

## 11.3 KPI row — cash and deposits

1. Cash in — sum cleared payment cash-in movements.
2. Cash out — sum cleared payment cash-out movements.
3. Recorded net cash — cash in minus cash out. Label clearly that this is a ledger movement balance and not automatically a reconciled bank balance.
4. Client deposits held — refundable client deposits received minus returned.
5. Vendor deposits held — refundable vendor deposits paid minus returned.
6. Client receivables — sum Event Accounts receivable.

## 11.4 Attention queue

Show counts and a compact list for:

- Overdue lead follow-ups.
- Overdue invoices.
- Overdue tasks.
- Overdue equipment returns.
- Confirmed bookings missing prerequisites.
- Cleared payments needing record/evidence review.
- Events with provisional costs.
- Event accounts needing review.

Each item must link directly to a filtered remediation view.

## 11.5 Event economics

Cards:

- Contract fees excl. tax = sum current event fee excl. tax.
- Committed direct costs = sum event direct costs.
- Event contribution = fees excl. tax - direct costs.
- Client credits/refunds due.
- Startup costs recorded = Approved/Settled Startup expenses.
- Overhead costs recorded = Approved/Settled Overhead expenses.

## 11.6 Charts

Add useful charts from live data:

### A. Monthly event economics

Combo/line/bar chart for the last 6–12 months:

- fees excl. tax
- direct costs
- contribution

Group by event date month.

### B. Enquiry funnel

Counts by:

New -> Contacted -> Qualified -> Quote sent -> Won / Lost / On hold.

Do not imply conversion rates where denominator is ambiguous; show counts and optionally a clearly defined Won / total closed rate.

### C. Event pipeline

Bookings by stage: Tentative, Confirmed, In progress, Completed, Cancelled.

### D. Cash movement trend

Cleared cash in vs cash out by month.

## 11.7 Operational widgets

- Upcoming events (next 5–10) with event date, customer, venue, stage, outstanding checklist count.
- Today/overdue tasks.
- Recently received enquiries.
- Invoices requiring collection.

Do not crowd the dashboard; use progressive disclosure and links to full modules.

---

# 12. API design

Follow the repository’s existing API style. A REST-like structure is acceptable and easy to maintain.

Authentication:

```text
POST   /api/admin/auth/login
POST   /api/admin/auth/logout
GET    /api/admin/auth/me
```

Dashboard:

```text
GET    /api/admin/dashboard/summary
GET    /api/admin/dashboard/charts?range=12m
```

Standard resources should generally support:

```text
GET    /api/admin/<resource>             list/search/filter/paginate
POST   /api/admin/<resource>             create
GET    /api/admin/<resource>/:id         detail
PATCH  /api/admin/<resource>/:id         update
DELETE /api/admin/<resource>/:id         only when safe; otherwise archive/void
```

Recommended explicit action endpoints:

```text
POST /api/admin/quotes/:quoteId/accept
POST /api/admin/quotes/:quoteId/duplicate-version
POST /api/admin/bookings/:eventId/apply-task-template
POST /api/admin/payments/:transactionId/void
POST /api/admin/invoices/:invoiceId/void
POST /api/admin/vendor-orders/:poId/cancel
POST /api/admin/records/:resource/:id/archive
GET  /api/admin/event-accounts
GET  /api/admin/event-accounts/:eventId
GET  /api/admin/events/:eventId/overview
POST /api/admin/import/workbook              # optional protected import
```

Do not force every business action through generic PATCH when a dedicated action makes invariants safer.

### Standard list query parameters

```text
?page=1
&pageSize=25
&search=
&sort=createdAt:desc
&status=
&stage=
&eventId=
&customerId=
&vendorId=
&from=
&to=
```

Return a predictable shape:

```ts
{
  data: T[],
  page: number,
  pageSize: number,
  total: number,
  totalPages: number
}
```

Errors:

```ts
{
  error: {
    code: string,
    message: string,
    fieldErrors?: Record<string, string>
  }
}
```

---

# 13. Database validation and invariants

Enforce important rules on the server even if the UI already validates them.

Examples:

- Business IDs unique.
- Referenced Customer/Event/Vendor/Quote exists.
- Accepted booking quote must be Accepted.
- Quote item must point to an existing quote.
- Event brief enquiry/event relationship must be consistent.
- Booking customer should match linked enquiry/accepted quote where those references exist.
- Payment amount must be > 0.
- Change fees/tax may be negative.
- Quantities must be >= 0 unless a specific signed workflow intentionally supports negative adjustments.
- `quantityReturned + quantityUsedLost` should not exceed `quantityOut` without an explicit variance/review state.
- Rating must be 1–5.
- Booking advance percent must be in a valid range.
- Email fields should be valid when present.
- Date strings from API must parse correctly.
- Evidence fields must be valid URL/path values when present.

Use MongoDB transactions for multi-document workflows when the deployment supports them and when consistency matters, for example accepting a quote while superseding prior versions and updating the booking reference.

---

# 14. Delete / archive / void policy

The Excel guide explicitly emphasizes preserving historical records. Use that principle in the app.

### Safe to archive

- Customers with no active event.
- Vendors.
- Venues.
- Services.
- Marketing content.
- Old template/document rows.

### Prefer status change or void over delete

- Bookings/events
- Accepted quotes
- Issued invoices
- Cleared payments
- Approved vendor orders
- Approved changes
- Settled expenses
- Signed/verified documents
- Feedback/sign-off records

Allow true hard delete only for obvious unused drafts and only after confirmation, or omit hard delete entirely in the first version.

Create `auditLogs` for all meaningful mutations.

Suggested audit log:

```ts
{
  action: 'create' | 'update' | 'archive' | 'restore' | 'void' | 'accept' | 'login' | 'logout' | 'import',
  resource: string,
  resourceId?: string,
  businessId?: string,
  actor: 'env-admin',
  changes?: { before?: unknown, after?: unknown },
  metadata?: Record<string, unknown>,
  createdAt: Date
}
```

For sensitive data, avoid dumping unnecessary secrets/full binary content into audit logs.

---

# 15. Indexes

At minimum create indexes like:

```text
customers:       customerId unique; email; mobileWhatsApp
 enquiries:      enquiryId unique; customerId; stage; followUpDate; preferredDate
 eventBriefs:    briefId unique; enquiryId; eventId
 bookings:       eventId unique; customerId; eventDate; stage; acceptedQuoteId
 quotes:         quoteId unique; customerId; enquiryId; eventId; status
 quoteItems:     lineId unique; quoteId
 invoices:       invoiceId unique; eventId; dueDate; status
 vendors:        vendorId unique; category; vendorStatus
 vendorOrders:   poId unique; eventId; vendorId; status
 venues:         venueId unique; areaCity
 services:       serviceId unique; status
 changes:        changeId unique; eventId; decision
 payments:       transactionId unique; eventId; invoiceId; poId; expenseId; transactionDate; clearance
 expenses:       expenseId unique; eventId; costScope; approvalStatus
 tasks:          taskId unique; eventId; status; dueStartAt; phase
 inventoryItems: itemId unique; supplierVendorId
 handovers:      handoverId unique; eventId; itemId; returnDue
 documents:      documentId unique; eventId; vendorId; status; dueRenewalDate
 feedback:       feedbackId unique; eventId
 marketing:      contentId unique; eventId; status; plannedPublishDate
```

Add compound indexes only where actual list queries use them; avoid excessive indexing.

---

# 16. Search

Global admin search in the top bar should search common identifiers and names:

- Event ID / title
- Customer ID / name / phone
- Enquiry ID
- Quote ID
- Invoice ID
- Vendor ID / business name
- PO ID
- Payment ID / receipt number / bank reference

Return grouped results with entity icon/type and direct navigation.

If Atlas Search is not already available, implement efficient regex/prefix search on indexed normalized fields for the expected small/medium business dataset. Do not make Atlas Search a hard dependency for v1.

---

# 17. Seed data from the workbook

Create an idempotent seed script such as:

```bash
npm run db:seed
```

It must not duplicate existing records when run more than once.

## 17.1 Service/package seeds

1. `RE-SVC-001` — Essential — Package level — Per event — Draft
2. `RE-SVC-002` — Signature — Package level — Per event — Draft
3. `RE-SVC-003` — Premium — Package level — Per event — Draft
4. `RE-SVC-004` — Custom — Package level — Per event — Draft — “Write a tailored scope and quotation.”
5. `RE-SVC-005` — Weekend Mini Celebration — Launch concept — Per event — Draft
   - Included: `Simple decor for a small private weekend event. Final scope to be agreed.`
   - Excluded: `Venue, food, photography and transport unless expressly included.`
   - Pricing note: `Earlier planning range: PKR 50,000–65,000. Not a confirmed price.`

Do not seed a selling price as confirmed because the workbook intentionally leaves pricing unconfirmed.

## 17.2 Business setup tasks

Seed these as real BUSINESS tasks:

1. `RE-TSK-001` — Confirm business phone, email and operating address
2. `RE-TSK-002` — Review registration and invoicing requirements with a qualified adviser
3. `RE-TSK-003` — Set up and verify dedicated business payment details
4. `RE-TSK-004` — Prepare quote, client agreement, invoice and receipt numbering
5. `RE-TSK-005` — Complete Google Business, Facebook and WhatsApp profiles
6. `RE-TSK-006` — Build vendor shortlist and check two options for critical services
7. `RE-TSK-007` — Cost and define the first weekend package
8. `RE-TSK-008` — Create event folders and restricted document access

Defaults: phase `Business setup`, status `To do`, priority `Normal`.

## 17.3 Event task templates

Seed all 28 task templates:

### Qualification

- `TPL-001` Collect the customer brief, date, guest count, budget and decision maker
- `TPL-002` Check service area, available time and manageable event scope
- `TPL-003` Inspect venue or obtain reliable access and dimension evidence
- `TPL-004` Get supplier prices including delivery, setup, collection and overtime

### Booking

- `TPL-005` Send quotation with scope, exclusions, validity and payment schedule
- `TPL-006` Record written acceptance and signed client agreement
- `TPL-007` Verify cleared booking advance and issue receipt
- `TPL-008` Confirm venue and critical supplier availability

### Planning

- `TPL-009` Approve design, final guest count and programme with the client
- `TPL-010` Verify vendor details and obtain signed purchase orders
- `TPL-011` Assign permission checks and record applicable approvals
- `TPL-012` Confirm power, access, weather backup and emergency arrangements
- `TPL-013` Assign event lead, client approver and backup contacts

### 48-hour check

- `TPL-014` Reconfirm every supplier, arrival time, quantities and balances
- `TPL-015` Collect final client balance by the agreed deadline
- `TPL-016` Pack, count, label and photograph inventory
- `TPL-017` Review weather, route, transport and team briefing

### Setup

- `TPL-018` Photograph venue condition and check delivered quantities
- `TPL-019` Check backdrop stability, electrical setup and clear exits
- `TPL-020` Complete client walk-through against approved design

### Event day

- `TPL-021` Brief the team and follow programme cues
- `TPL-022` Record approved scope changes and issues
- `TPL-023` Count rentals and record handover condition

### Close-out

- `TPL-024` Return rentals, recover deposits and resolve variances
- `TPL-025` Reconcile client and supplier balances against evidence
- `TPL-026` Record final costs and review event contribution
- `TPL-027` Obtain completion sign-off and resolve open issues
- `TPL-028` Collect feedback, review consent and media permission

Template defaults: status `Template`, priority `Normal`, no owner/date/event ID.

When applied to an event, clone each selected template into a new event task with a new `RE-TSK-*` ID and status `To do`; do not mutate the template.

## 17.4 Document template catalogue

Seed these as scope `Template`, applicability `Template`, status `Template ready`:

1. `RE-TPL-01` — Rajput Events Legal and Registration Guide — `01_Rajput_Events_Legal_and_Registration_Guide.pdf`
2. `RE-TPL-02` — Client Enquiry and Event Requirements Form — `02_Client_Enquiry_and_Event_Requirements_Form.pdf`
3. `RE-TPL-03` — Professional Event Quotation Template — `03_Professional_Event_Quotation_Template.pdf`
4. `RE-TPL-04` — Event Booking Form — `04_Event_Booking_Form.pdf`
5. `RE-TPL-05` — Event Planning and Management Service Agreement — `05_Event_Planning_and_Management_Service_Agreement.pdf`
6. `RE-TPL-06` — Advance Invoice and Payment Receipt Template — `06_Advance_Invoice_and_Payment_Receipt_Template.pdf`
7. `RE-TPL-07` — Event Timeline and Responsibility Plan — `07_Event_Timeline_and_Responsibility_Plan.pdf`
8. `RE-TPL-08` — Event Change Order Form — `08_Event_Change_Order_Form.pdf`
9. `RE-TPL-09` — Final Invoice and Payment Receipt Template — `09_Final_Invoice_and_Payment_Receipt_Template.pdf`
10. `RE-TPL-10` — Event Completion Signoff and Media Consent — `10_Event_Completion_Signoff_and_Media_Consent.pdf`
11. `RE-TPL-11` — Vendor Agreement and Purchase Order — `11_Vendor_Agreement_and_Purchase_Order.pdf`
12. `RE-TPL-12` — Inventory Equipment and Vendor Handover Sheet — `12_Inventory_Equipment_and_Vendor_Handover_Sheet.pdf`
13. `RE-TPL-13` — Event Permissions Safety and Emergency Plan — `13_Event_Permissions_Safety_and_Emergency_Plan.pdf`
14. `RE-TPL-14` — First Weekend Order Master Checklist — `14_First_Weekend_Order_Master_Checklist.pdf`

These filenames are catalogue references. Do not assume those PDF files exist in the deployed web filesystem unless they are actually present in the repository/storage.

## 17.5 Default document/checklist rows

Seed as `To confirm` / `To check` unless already present:

### Business

- `RE-DOC-001` Business registration / tax classification review
- `RE-DOC-002` Dedicated bank details verification
- `RE-DOC-003` Client agreement and invoice wording review
- `RE-DOC-004` Relevant premises / local approvals review

### Event

- `RE-DOC-005` Venue booking and management approval
- `RE-DOC-006` Public space / local administration permissions if applicable
- `RE-DOC-007` Sound, timing, parking and security requirements
- `RE-DOC-008` Fire, electrical and temporary structure checks
- `RE-DOC-009` Catering licence and vendor evidence if applicable
- `RE-DOC-010` Weather backup and emergency plan
- `RE-DOC-011` Client agreement and accepted quotation
- `RE-DOC-012` Signed vendor purchase orders
- `RE-DOC-013` Approved design and change orders
- `RE-DOC-014` Completion sign-off and media consent

Default note:

`Confirm applicability, responsible owner and evidence before marking complete.`

Treat these as reusable checklist definitions or seed records. For event execution, it is cleaner to clone relevant event checks into event-specific records instead of sharing one global blank Event row.

## 17.6 Marketing seeds

- `RE-MKT-001` Google Business / Business profile — Complete service description, service area, contact information and cover image.
- `RE-MKT-002` Facebook / Business profile — Complete page information and upload the Rajput Events navy-and-gold cover.
- `RE-MKT-003` WhatsApp Business / Business profile — Complete business profile, greeting, enquiry questions and approved service catalogue.

Default status `Draft`.

## 17.7 Settings seed

Seed the non-secret settings listed in section 10.21 using upsert-by-key.

---

# 18. Workbook import / migration

Add a one-off migration script and, optionally, a protected import screen.

Suggested CLI:

```bash
npm run import:workbook -- ./data/Rajput_Events_Business_Workbook.xlsx
```

Use a maintained `.xlsx` reader for Node only in the import script. This import path is not the day-to-day data layer.

### Sheet interpretation

The workbook has title/instruction rows before each data table. For record sheets:

- Row 7 is the header.
- Data begins at row 8.
- Skip completely empty rows.
- Preserve supplied IDs.
- Convert Excel serial dates/times correctly.
- Keep phone, WhatsApp, bank references and IDs as strings.
- Trim strings but do not destroy intentional multiline notes.
- Treat formula/derived columns as non-authoritative; recalculate them after import in the application.

### Import these sheets

- Bookings
- Quotes
- Invoices
- Vendor Orders
- Customers
- Enquiries
- Event Brief
- Vendors
- Venues
- Services
- Quote Items
- Changes
- Payments
- Expenses
- Tasks
- Inventory
- Handovers
- Documents
- Feedback
- Marketing
- Settings

### Do not directly import as primary collections

- Dashboard — recalculate live.
- Event Accounts — recalculate live.
- Guide — keep as documentation/help content.

### Import behavior

- Default to dry-run.
- Show per-sheet valid row count, skipped rows, conflicts, and validation errors.
- Upsert by permanent business ID only when the user explicitly selects upsert mode.
- Never blindly overwrite newer database records.
- Log import operation to audit log.
- Advance ID counters after import.
- After import, run consistency checks and show a report.

Because the current workbook is mostly templates/blank operational rows, the seed script is important even if the workbook import is not used in production.

---

# 19. Record checks / health indicators

Instead of opaque Excel formulas, implement `recordCheck` services that return:

```ts
{
  status: 'OK' | 'Review' | 'Error' | 'Costs provisional' | 'Not applicable',
  reasons: string[]
}
```

Render the status badge in tables and the reason list on details.

Examples:

### Customer
- missing name
- no contact method

### Quote
- no items
- tax treatment not confirmed
- Accepted but acceptance date/evidence missing

### Booking
- accepted quote missing/not accepted
- agreement missing
- booking advance not cleared
- venue confirmation missing
- vendor capacity missing

### Vendor Order
- approved order without signed PO
- missing vendor/event
- negative/invalid quantity or amount

### Payment
- cleared but no cleared date
- cleared but missing evidence/reference
- required invoice/PO/expense link missing
- event link inconsistent with referenced document

### Event Account
- costs provisional
- invoice reconciliation mismatch
- accepted quote issue
- client credit requiring attention

This makes the web app more useful than the spreadsheet while preserving its checks.

---

# 20. Guide page `/admin/guide`

Create a polished internal help page from the workbook operating guidance. It can be static content in code/Markdown rather than MongoDB.

Include these principles:

1. Add Customers and Vendors first; use permanent IDs.
2. Customer intake: name, WhatsApp, email, billing address, decision maker, backup contact.
3. Enquiry intake: occasion, dates, guests, venue, budget, required services.
4. Detailed brief: theme, colours, must-haves, exclusions, dietary/access, privacy, approvals.
5. Vendor intake: category, contacts, coverage, work, itemized rates, lead time, weekend availability.
6. Vendor terms: delivery, setup, collection, deposit, overtime, cancellation, refund, replacement.
7. Vendor verification: identity/tax references, relevant licences, verified bank title/evidence when applicable.
8. Build a quote with line items, discount, confirmed tax amount, agreed advance percent.
9. Record written quote acceptance and evidence; supersede obsolete versions.
10. Create booking only against the accepted quote.
11. Booking prerequisites are separate checks: accepted quote, agreement, cleared advance, venue, vendor capacity.
12. Apply task templates and assign owners/dates.
13. Purchase vendor services through POs.
14. Invoices are incremental; do not re-bill an advance.
15. Payments are cash movements entered once.
16. Do not duplicate PO costs in Expenses.
17. Refundable deposits are separate from service fees/costs.
18. Applying a deposit to fees should be represented as deposit return + ordinary receipt/payment with evidence.
19. Only approved change orders affect contract amounts.
20. Keep cancelled event records; use changes/refunds/final liabilities.
21. Event contribution = current fee excl. client tax - committed direct costs.
22. Startup/overhead excluded from event contribution.
23. Only mark costs final when supplier/other event costs are all recorded.
24. Reconcile issued invoices to contract total during close-out.
25. Reconcile payment ledger to real bank/cash balances externally.
26. Document withholding/non-cash adjustments separately.
27. Track inventory issue/return/loss and record costs only once.
28. Keep evidence for permissions/documents.
29. Do not publish event media without the recorded consent/rights.
30. Keep master/admin data private.

Add contextual links from the Guide to the relevant admin modules.

---

# 21. Settings and business-reference warnings

Some workbook numbers are explicitly *planning references*, not confirmed business policy. The UI must not silently enforce them.

Examples:

- Earlier launch concept: small private weekend events.
- Earlier advance suggestion: 60%.
- Earlier balance suggestion: 48 hours before event.
- Earlier Mini Celebration range: PKR 50,000–65,000.
- Earlier startup planning range: PKR 150,000–250,000.

Display these as notes/reference defaults where helpful, but every actual quote/booking must store its confirmed terms.

Tax/registration/permissions are not assumed by this system. Keep their fields explicit and user-entered/verified.

---

# 22. Professional dashboard details

## Status badge conventions

Suggested mapping:

- green: Approved, Accepted, Paid, Cleared, Completed, Done, Verified, Filed, Available
- amber: Pending, Tentative, In progress, Waiting, Due today, On hold, Checking
- red: Overdue, Lost, Rejected, Expired, Damaged, Review/Error
- gray: Draft, Template, Superseded, Not applicable, Retired, Void, Cancelled
- blue: Sent, Issued, Scheduled, Qualified

Use consistent mappings across modules.

## Table density

Default to comfortable professional density, not huge marketing cards. Admin screens should maximize useful information.

## Money presentation

- Right-align numeric money columns.
- Use tabular numerals where supported.
- Color negative contribution/credit carefully; do not rely on color alone.

## Dates

- Tables: `DD MMM YYYY`.
- Detail pages: `DD MMM YYYY, h:mm A` when time matters.
- Store dates in UTC where appropriate and evaluate business-day semantics using Asia/Karachi.

---

# 23. Event creation workflow

Provide a guided “Create event from enquiry” workflow:

1. Select a Won/qualified enquiry.
2. Select its Accepted quote.
3. Pre-fill customer, event type/title/date, guest count if available.
4. Choose venue.
5. Set event stage initially `Tentative` unless prerequisites justify another state.
6. Enter agreement/advance/final-balance dates.
7. Assign Rajput Events lead and onsite contacts.
8. Save booking and generate `RE-EVT-*`.
9. Link Event ID back to relevant enquiry/quote/brief.
10. Offer “Apply standard event task template”.
11. Offer “Create standard event document checklist”.

Do not automatically mark an event Confirmed merely because it was created. Show booking checks and let the admin confirm deliberately.

---

# 24. Quote-to-booking workflow

A good flow:

1. Create/select customer.
2. Create enquiry.
3. Create event brief.
4. Create quote with line items.
5. Send -> status Sent.
6. Revise by duplicating version where needed.
7. Accept one version with date/evidence.
8. Mark older versions Superseded.
9. Create booking/event from accepted quote.
10. Create booking-advance invoice if the business wants an invoice for that milestone.
11. Record actual cleared receipt in Payments.

Keep quotation, invoicing and cash recording as distinct records.

---

# 25. Finance workflow rules

### Revenue / contract

Contract value comes from Accepted Quote + Approved Changes.

### Invoicing

Invoices represent amounts requested from the client at specific milestones.

### Cash

Cash comes only from Cleared Payments.

### Direct costs

Direct costs come from committed/final Vendor Orders plus approved/settled Event Expenses.

### Deposits

Refundable client/vendor deposits remain separate balance categories and cash movements. They do not count as event fee revenue/direct cost while refundable.

### Event contribution

Use fee excluding client tax minus direct cost, not raw cash movement.

Make this separation visible in UI labels/tooltips to reduce bookkeeping mistakes.

---

# 26. Audit and timestamps

Every mutation should update `updatedAt/updatedBy`.

Audit at least:

- admin login/logout
- create/update/archive/restore
- accepted quote
- booking stage changes
- invoice issue/void
- payment clear/void/change
- PO approval/cancel/close
- expense approval/settle/cancel
- change-order approval
- document verification
- import/seed operations where applicable

Add a small “Activity” panel to important detail pages by querying audit log for that business ID.

---

# 27. Error handling and resilience

- Centralize MongoDB connection and reuse it across requests/serverless invocations.
- Handle initial DB connection failure with a useful server log and safe user error.
- Never render stack traces/secrets in production UI.
- API mutations should be idempotent where practical.
- Disable submit buttons during pending mutations.
- Protect against double-click duplicate creation.
- Use optimistic UI only for low-risk operations; finance/status workflows should confirm server success first.
- Dashboard should degrade gracefully if one secondary chart query fails; do not make the whole admin blank.

---

# 28. Testing requirements

Use the repository’s existing test stack. If none exists, add lightweight tests for business-critical logic.

## Unit tests

Test at least:

- ID generator formatting and atomic sequence behavior.
- Quote line/quote total calculations.
- Payment cash-in/cash-out direction.
- Invoice payment status.
- Follow-up due status.
- Task due status.
- Handover outstanding/overdue.
- Service margin.
- Event Accounts aggregation.
- Deposit exclusion from fee/cost calculations.
- Booking checks.
- Document action status.

## API/integration tests

- unauthenticated `/api/admin/*` returns 401/redirect behavior as appropriate.
- valid login creates session.
- invalid login does not create session.
- protected CRUD works.
- invalid foreign keys rejected.
- payment type link requirements enforced.

## UI smoke tests

At minimum manually verify:

- login/logout
- sidebar navigation
- create customer -> enquiry -> quote -> booking
- record invoice/payment
- dashboard updates from DB
- responsive sidebar/table behavior

---

# 29. Performance targets

The initial business dataset will be modest, so prioritize correctness and usability. Still implement sane production patterns:

- server-side pagination
- indexed filters
- projection of only required list columns
- aggregation pipelines for summary data
- avoid N+1 relation queries
- cache only where clearly beneficial
- debounce global/list search

Do not prematurely introduce Redis or a separate analytics database.

---

# 30. Suggested folder structure

Adapt this to the existing repo. For a Next.js App Router project, a possible structure is:

```text
src/
  app/
    admin/
      login/
        page.tsx
      (protected)/
        layout.tsx
        page.tsx
        customers/
        enquiries/
        event-briefs/
        quotes/
        bookings/
        vendors/
        vendor-orders/
        venues/
        services/
        invoices/
        payments/
        expenses/
        event-accounts/
        changes/
        tasks/
        inventory/
        handovers/
        documents/
        feedback/
        marketing/
        settings/
        guide/
    api/
      admin/
        auth/
        dashboard/
        customers/
        ...
  components/
    admin/
      AdminShell.tsx
      AdminSidebar.tsx
      AdminTopbar.tsx
      AdminDataTable.tsx
      StatusBadge.tsx
      Money.tsx
      RecordCheckBadge.tsx
      EmptyState.tsx
      ConfirmDialog.tsx
      forms/
      charts/
  lib/
    admin-auth.ts
    mongodb.ts
    ids.ts
    money.ts
    dates.ts
    audit.ts
    validations/
    calculations/
      eventAccounts.ts
      invoiceStatus.ts
      bookingChecks.ts
      recordChecks.ts
  models/
    Customer.ts
    Enquiry.ts
    ...
  scripts/
    seed.ts
    import-workbook.ts
    hash-admin-password.ts
```

For Express/Vite, preserve the same conceptual separation in `server/` and `src/admin/`.

---

# 31. Mongo connection requirements

Implement a shared connection helper:

- Uses `MONGODB_URI`.
- Uses `MONGODB_DB` if the URI does not already specify the DB.
- Caches/reuses connection in development/serverless environments.
- Throws a clear startup/server error when URI is missing.
- Does not connect from client components/browser code.

Do not create a new DB connection for every API request.

---

# 32. Form relation selectors

Foreign-key fields should not be plain text inputs in normal UI.

Examples:

- Enquiry Customer -> searchable Customer combobox showing `RE-CUS-001 — Name — WhatsApp`.
- Booking accepted quote -> only relevant Accepted quotes.
- Booking venue -> searchable venue.
- PO vendor -> vendor combobox filtered by category/status optionally.
- Invoice event -> event combobox.
- Payment invoice/PO/expense selectors -> dynamically shown based on transaction type.
- Task event -> event combobox.
- Handovers item/vendor/event -> relation selectors.

Still expose/copy the permanent ID in details for operational communication.

---

# 33. Context-sensitive payment form

The payment form is high-risk and should adapt to the selected transaction type.

Examples:

### Client receipt/refund
Show:

- Event
- Invoice (optional/required when this payment is invoice-related)
- payer/payee
- receipt number
- method
- reference
- amount
- clearance
- evidence

### Vendor payment/refund
Show and require:

- Event
- PO
- Vendor inferred from PO
- amount/reference/evidence

### Expense payment/refund
Show and require:

- Expense
- Event inferred when applicable

### Client deposit
Show event/customer context but clearly badge it `Refundable deposit — excluded from fee revenue`.

### Vendor deposit
Show event/PO/vendor context and clearly badge it `Refundable vendor deposit — excluded from direct cost`.

### Owner funds/drawing
No event required.

---

# 34. Reports and filtering

The initial admin should support at least these report-like views through filters rather than requiring a separate BI system:

- Events by date range/stage/type.
- Enquiries by stage/source/event type.
- Won/lost enquiries.
- Receivables by event.
- Overdue invoices.
- Cash ledger by date/type/method.
- Vendor spend by vendor/category/event.
- Event contribution table.
- Startup vs overhead expenses.
- Inventory low stock/not returned.
- Vendor ratings/status.
- Pending documents/renewals.
- Feedback ratings/open issues.
- Marketing content pipeline.

CSV export is recommended for filtered tables.

---

# 35. Nice-to-have features after the core build

Do these only after the required system is stable:

- Generate branded quote PDF from a quote.
- Generate invoice/receipt PDFs.
- Upload evidence to S3/Cloudinary.
- WhatsApp deep links from customer/vendor/event contacts.
- Calendar month view for bookings.
- Drag/drop task board.
- Email/WhatsApp reminders.
- Multi-user roles.
- Public client portal.
- Vendor portal.
- Automated Google review request workflow.

Do not let these delay the core Mongo-backed admin.

---

# 36. Implementation order for Cursor

Work in this sequence so the repository stays runnable.

## Phase 0 — Repository discovery

- Read package.json and project structure.
- Identify router/framework.
- Identify styling/UI stack.
- Identify existing DB/backend patterns.
- Identify lint/test/build commands.
- Do not remove public-site code.

## Phase 1 — Foundation

- Add environment validation.
- MongoDB connection.
- Admin auth/session/login/logout.
- Protected `/admin` layout.
- Sidebar/topbar/theme.
- Common utilities: PKR, dates, IDs, validation, API response/errors.

## Phase 2 — Data layer

- Mongoose schemas/models.
- Counters/ID generation.
- Indexes.
- Audit logs.
- Calculation services.

## Phase 3 — CRM & sales

- Customers.
- Enquiries.
- Event Briefs.
- Services.
- Quotes + line-item editor.

## Phase 4 — Events

- Bookings.
- Event 360.
- Tasks/templates.
- Change orders.
- Feedback.

## Phase 5 — Vendors/logistics

- Vendors.
- Venues.
- Vendor Orders.
- Inventory.
- Handovers.

## Phase 6 — Finance

- Invoices.
- Payments.
- Expenses.
- Event Accounts aggregation.
- Finance validation/reconciliation indicators.

## Phase 7 — Compliance/content

- Documents.
- Marketing.
- Settings.
- Guide.

## Phase 8 — Dashboard

- Live KPI summary.
- Attention queues.
- Charts.
- Upcoming/today widgets.

## Phase 9 — Migration and quality

- Idempotent seed script.
- Workbook import script.
- Tests.
- Accessibility/responsive pass.
- Build/lint/test clean-up.
- `.env.example` and README setup instructions.

At the end of every phase, run the repository’s lint/typecheck/build/tests that are available and fix errors before continuing.

---

# 37. Definition of done

The implementation is complete when all of the following are true:

- [ ] `/admin/login` authenticates only with environment-configured credentials.
- [ ] `/admin` redirects unauthenticated users to login.
- [ ] Protected APIs reject unauthenticated requests.
- [ ] MongoDB URI is environment-driven.
- [ ] No secrets are included in frontend bundles or committed files.
- [ ] Dashboard KPIs come from MongoDB.
- [ ] All workbook modules have functional list/detail/create/edit experiences or a deliberate derived-view implementation.
- [ ] Event Accounts are calculated, not manually edited.
- [ ] Dashboard is professional navy/gold and responsive.
- [ ] Customer -> enquiry -> quote -> booking workflow works end-to-end.
- [ ] Quote line-item totals and advance calculations work.
- [ ] Invoice/payment separation works.
- [ ] Refundable deposits are excluded from fee/cost calculations.
- [ ] Vendor PO costs and Expenses are not double-counted.
- [ ] Event contribution calculation matches this specification.
- [ ] Booking prerequisite/check display works.
- [ ] Overdue invoice/task/follow-up/handover logic works using Asia/Karachi date semantics.
- [ ] Event task templates can be cloned into event tasks.
- [ ] Document action-status logic works.
- [ ] Media-consent warnings appear in Marketing.
- [ ] Permanent business IDs are generated atomically and never reused.
- [ ] Important historical/financial records use archive/void/status workflows rather than unsafe deletion.
- [ ] Audit logs capture meaningful mutations.
- [ ] Seed script is idempotent.
- [ ] `.env.example` contains variable names but no real secrets.
- [ ] Existing public website remains functional.
- [ ] Project builds without TypeScript/lint errors introduced by this work.

---

# 38. Final instructions to Cursor

Treat this document as the functional specification and the existing repository as the technical constraint. Where the repository already has a sound pattern, integrate with it instead of creating parallel infrastructure.

Prioritize **data correctness, financial separation, operational usability, and security** over decorative effects.

Do not hard-code dashboard values. Do not make calculated workbook fields editable. Do not expose credentials. Do not use localStorage for admin auth. Do not treat deposits as revenue/cost. Do not duplicate vendor PO costs in Expenses. Do not destroy historical financial/event records.

When an implementation choice is not explicitly specified here, choose the simplest maintainable option consistent with the existing codebase and proceed without redesigning unrelated parts of the website.

The finished result should feel like a purpose-built **Rajput Events operations dashboard**, not an Excel table viewer.
