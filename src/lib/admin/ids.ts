import { connectMongo } from "./mongodb";
import { Counter } from "@/models/Counter";

const PREFIXES = {
  customer: "RE-CUS",
  enquiry: "RE-ENQ",
  brief: "RE-BRF",
  event: "RE-EVT",
  quote: "RE-Q",
  quoteLine: "RE-QL",
  invoice: "RE-INV",
  vendor: "RE-VEN",
  po: "RE-PO",
  venue: "RE-VNU",
  service: "RE-SVC",
  change: "RE-CHG",
  payment: "RE-PAY",
  expense: "RE-EXP",
  task: "RE-TSK",
  inventory: "RE-ITM",
  handover: "RE-HND",
  document: "RE-DOC",
  feedback: "RE-FDB",
  marketing: "RE-MKT",
} as const;

export type IdKey = keyof typeof PREFIXES;

export async function nextBusinessId(key: IdKey, pad = 3) {
  await connectMongo();
  const counterKey = PREFIXES[key];
  const doc = await Counter.findOneAndUpdate(
    { key: counterKey },
    { $inc: { seq: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  const seq = doc?.seq ?? 1;
  return `${counterKey}-${String(seq).padStart(pad, "0")}`;
}

export async function ensureCounterAtLeast(key: IdKey, minSeq: number) {
  await connectMongo();
  const counterKey = PREFIXES[key];
  const existing = await Counter.findOne({ key: counterKey });
  if (!existing) {
    await Counter.create({ key: counterKey, seq: minSeq });
    return;
  }
  if ((existing.seq ?? 0) < minSeq) {
    existing.seq = minSeq;
    await existing.save();
  }
}

export { PREFIXES };
