import Link from "next/link";

const PRINCIPLES = [
  "Add Customers and Vendors first; use permanent IDs.",
  "Customer intake: name, WhatsApp, email, billing address, decision maker, backup contact.",
  "Enquiry intake: occasion, dates, guests, venue, budget, required services.",
  "Build quotes with line items, discount, confirmed tax amount, and agreed advance percent.",
  "Record written quote acceptance and evidence; supersede obsolete versions.",
  "Create bookings only against an accepted quote.",
  "Booking prerequisites: accepted quote, agreement, cleared advance, venue, vendor capacity.",
  "Invoices are incremental; do not re-bill an advance.",
  "Payments are cash movements entered once.",
  "Do not duplicate vendor PO costs in Expenses.",
  "Refundable deposits are separate from service fees and costs.",
  "Only approved change orders affect contract amounts.",
  "Event contribution = current fee excl. client tax − committed direct costs.",
  "Do not publish event media without recorded consent/rights.",
  "Keep master/admin data private inside /admin.",
];

export default function AdminGuidePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="admin-card p-6">
        <h2 className="text-xl font-bold">Operating guide</h2>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">
          Practical principles for running Rajput Events in this dashboard.
        </p>
        <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-relaxed">
          {PRINCIPLES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/admin/customers" className="admin-btn admin-btn-ghost">
            Customers
          </Link>
          <Link href="/admin/enquiries" className="admin-btn admin-btn-ghost">
            Enquiries
          </Link>
          <Link href="/admin/quotes" className="admin-btn admin-btn-ghost">
            Quotes
          </Link>
          <Link href="/admin/bookings" className="admin-btn admin-btn-ghost">
            Bookings
          </Link>
          <Link href="/admin/payments" className="admin-btn admin-btn-ghost">
            Payments
          </Link>
        </div>
      </div>
    </div>
  );
}
