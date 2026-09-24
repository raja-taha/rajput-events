import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/admin/mongodb";
import { requireAdminApi } from "@/lib/admin/auth";
import { ok, unauthorized } from "@/lib/admin/api";
import { Customer } from "@/models/Customer";
import { Enquiry } from "@/models/Enquiry";
import { Booking } from "@/models/Booking";
import { Vendor } from "@/models/Vendor";
import { Payment } from "@/models/Payment";
import { Invoice } from "@/models/Invoice";
import { Task } from "@/models/Task";
import { formatNowBusiness } from "@/lib/admin/dates";

const CASH_IN = new Set([
  "Client receipt",
  "Vendor refund",
  "Expense refund",
  "Client deposit received",
  "Vendor deposit returned",
  "Owner funds in",
]);
const CASH_OUT = new Set([
  "Client refund",
  "Vendor payment",
  "Expense payment",
  "Client deposit returned",
  "Vendor deposit paid",
  "Owner drawing",
]);

export async function GET(request: NextRequest) {
  const session = await requireAdminApi(request);
  if (!session) return unauthorized();
  await connectMongo();

  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [
    customers,
    openEnquiries,
    confirmedEvents,
    upcomingEvents,
    completedEvents,
    approvedVendors,
    clearedPayments,
    overdueInvoices,
    overdueTasks,
    recentEnquiries,
    upcomingBookings,
  ] = await Promise.all([
    Customer.countDocuments({ archivedAt: null }),
    Enquiry.countDocuments({
      archivedAt: null,
      stage: { $nin: ["Won", "Lost"] },
    }),
    Booking.countDocuments({ archivedAt: null, stage: "Confirmed" }),
    Booking.countDocuments({
      archivedAt: null,
      stage: { $ne: "Cancelled" },
      eventDate: { $gte: now, $lte: in30 },
    }),
    Booking.countDocuments({ archivedAt: null, stage: "Completed" }),
    Vendor.countDocuments({ archivedAt: null, vendorStatus: "Approved" }),
    Payment.find({ archivedAt: null, clearance: "Cleared" }).lean(),
    Invoice.countDocuments({
      archivedAt: null,
      status: "Issued",
      dueDate: { $lt: now },
    }),
    Task.countDocuments({
      archivedAt: null,
      status: { $nin: ["Template", "Done", "Not applicable"] },
      dueStartAt: { $lt: now },
    }),
    Enquiry.find({ archivedAt: null })
      .sort({ receivedOn: -1 })
      .limit(5)
      .lean(),
    Booking.find({
      archivedAt: null,
      stage: { $ne: "Cancelled" },
      eventDate: { $gte: now },
    })
      .sort({ eventDate: 1 })
      .limit(6)
      .lean(),
  ]);

  let cashIn = 0;
  let cashOut = 0;
  let clientDeposits = 0;
  let vendorDeposits = 0;

  for (const p of clearedPayments) {
    const amount = Number(p.amount || 0);
    const type = String(p.transactionType || "");
    if (CASH_IN.has(type)) cashIn += amount;
    if (CASH_OUT.has(type)) cashOut += amount;
    if (type === "Client deposit received") clientDeposits += amount;
    if (type === "Client deposit returned") clientDeposits -= amount;
    if (type === "Vendor deposit paid") vendorDeposits += amount;
    if (type === "Vendor deposit returned") vendorDeposits -= amount;
  }

  return ok({
    asOf: formatNowBusiness(),
    workload: {
      customers,
      openEnquiries,
      confirmedEvents,
      upcomingEvents,
      completedEvents,
      approvedVendors,
    },
    cash: {
      cashIn,
      cashOut,
      netCash: cashIn - cashOut,
      clientDepositsHeld: clientDeposits,
      vendorDepositsHeld: vendorDeposits,
    },
    attention: {
      overdueInvoices,
      overdueTasks,
      overdueFollowUps: await Enquiry.countDocuments({
        archivedAt: null,
        stage: { $nin: ["Won", "Lost"] },
        followUpDate: { $lt: now },
      }),
    },
    widgets: {
      recentEnquiries,
      upcomingBookings,
    },
  });
}
