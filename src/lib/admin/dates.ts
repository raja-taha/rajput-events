import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { format, parseISO, startOfDay, isValid } from "date-fns";

export const BUSINESS_TIMEZONE =
  process.env.BUSINESS_TIMEZONE || "Asia/Karachi";

export function parseDateInput(value?: string | Date | null) {
  if (!value) return null;
  if (value instanceof Date) return isValid(value) ? value : null;
  const d = parseISO(value);
  return isValid(d) ? d : null;
}

export function formatDate(value?: string | Date | null) {
  const d = parseDateInput(value);
  if (!d) return "—";
  return formatInTimeZone(d, BUSINESS_TIMEZONE, "dd MMM yyyy");
}

export function formatDateTime(value?: string | Date | null) {
  const d = parseDateInput(value);
  if (!d) return "—";
  return formatInTimeZone(d, BUSINESS_TIMEZONE, "dd MMM yyyy, h:mm a");
}

export function todayInBusinessTz() {
  const now = toZonedTime(new Date(), BUSINESS_TIMEZONE);
  return startOfDay(now);
}

export function calendarDateInBusinessTz(value: Date) {
  return formatInTimeZone(value, BUSINESS_TIMEZONE, "yyyy-MM-dd");
}

export function compareDueStatus(
  due?: Date | null,
  terminalStatuses: string[] = [],
  currentStatus?: string,
) {
  if (currentStatus && terminalStatuses.includes(currentStatus)) {
    return currentStatus;
  }
  if (!due) return "Set due date";
  const today = calendarDateInBusinessTz(new Date());
  const dueDay = calendarDateInBusinessTz(due);
  if (dueDay < today) return "Overdue";
  if (dueDay === today) return "Due today";
  return "Upcoming";
}

export function formatNowBusiness() {
  return formatInTimeZone(new Date(), BUSINESS_TIMEZONE, "dd MMM yyyy, h:mm a");
}

export { format };
