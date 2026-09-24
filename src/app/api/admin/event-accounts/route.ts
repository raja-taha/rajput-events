import { NextRequest } from "next/server";
import { connectMongo } from "@/lib/admin/mongodb";
import { requireAdminApi } from "@/lib/admin/auth";
import { listResult, ok, unauthorized } from "@/lib/admin/api";
import { Booking } from "@/models/Booking";
import { Quote } from "@/models/Quote";
import { QuoteItem } from "@/models/QuoteItem";
import { Payment } from "@/models/Payment";
import { VendorOrder } from "@/models/VendorOrder";
import { Expense } from "@/models/Expense";
import { Change } from "@/models/Change";
import { parseListParams } from "@/lib/admin/api";

export async function GET(request: NextRequest) {
  const session = await requireAdminApi(request);
  if (!session) return unauthorized();
  await connectMongo();

  const url = new URL(request.url);
  const { page, pageSize, skip } = parseListParams(url);

  const filter = { archivedAt: null };
  const [bookings, total] = await Promise.all([
    Booking.find(filter).sort({ eventDate: -1 }).skip(skip).limit(pageSize).lean(),
    Booking.countDocuments(filter),
  ]);

  const rows = await Promise.all(
    bookings.map(async (booking) => {
      const [quote, quoteItems, payments, orders, expenses, changes] =
        await Promise.all([
          booking.acceptedQuoteId
            ? Quote.findOne({ quoteId: booking.acceptedQuoteId }).lean()
            : null,
          booking.acceptedQuoteId
            ? QuoteItem.find({
                quoteId: booking.acceptedQuoteId,
                archivedAt: null,
              }).lean()
            : Promise.resolve([]),
          Payment.find({
            eventId: booking.eventId,
            clearance: "Cleared",
            archivedAt: null,
          }).lean(),
          VendorOrder.find({
            eventId: booking.eventId,
            status: { $in: ["Approved", "Delivered", "Closed"] },
            archivedAt: null,
          }).lean(),
          Expense.find({
            eventId: booking.eventId,
            costScope: "Event",
            approvalStatus: { $in: ["Approved", "Settled"] },
            archivedAt: null,
          }).lean(),
          Change.find({
            eventId: booking.eventId,
            decision: "Approved",
            archivedAt: null,
          }).lean(),
        ]);

      const itemSubtotal = quoteItems.reduce(
        (sum, i) =>
          sum + Number(i.quantity || 0) * Number(i.unitPriceExclTax || 0),
        0,
      );
      const quoteTax = Number(quote?.taxAmount || 0);
      const quoteDiscount = Number(quote?.discount || 0);
      const baseFee = itemSubtotal - quoteDiscount;
      const approvedFeeChanges = changes.reduce(
        (sum, c) => sum + Number(c.feeChangeExclTax || 0),
        0,
      );
      const approvedTaxChanges = changes.reduce(
        (sum, c) => sum + Number(c.taxChange || 0),
        0,
      );

      let netClientCash = 0;
      for (const p of payments) {
        const amount = Number(p.amount || 0);
        if (p.transactionType === "Client receipt") netClientCash += amount;
        if (p.transactionType === "Client refund") netClientCash -= amount;
      }

      const vendorCost = orders.reduce((sum, o) => {
        const subtotal = Number(o.quantity || 0) * Number(o.unitRate || 0);
        return (
          sum +
          subtotal +
          Number(o.deliverySetupExtras || 0) +
          Number(o.taxAmount || 0)
        );
      }, 0);

      const otherEventCost = expenses.reduce(
        (sum, e) => sum + Number(e.actualAgreedCost || 0),
        0,
      );

      const currentFeeExclTax = baseFee + approvedFeeChanges;
      const clientTaxAmount = quoteTax + approvedTaxChanges;
      const contractTotal = currentFeeExclTax + clientTaxAmount;
      const totalDirectCost = vendorCost + otherEventCost;
      const eventContribution = currentFeeExclTax - totalDirectCost;
      const balance = contractTotal - netClientCash;

      return {
        eventId: booking.eventId,
        eventTitle: booking.eventTitle,
        eventDate: booking.eventDate,
        stage: booking.stage,
        baseFeeExclTax: baseFee,
        approvedFeeChanges,
        currentFeeExclTax,
        clientTaxAmount,
        contractTotal,
        netClientCashReceived: netClientCash,
        receivable: Math.max(balance, 0),
        clientCredit: Math.max(-balance, 0),
        vendorCostCommitted: vendorCost,
        otherEventCost,
        totalDirectCost,
        eventContribution,
        contributionMargin:
          currentFeeExclTax !== 0 ? eventContribution / currentFeeExclTax : null,
        costsFinalised: booking.costsFinalised,
      };
    }),
  );

  return ok(listResult(rows, total, page, pageSize));
}
