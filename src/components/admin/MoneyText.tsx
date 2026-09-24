import { formatMoney } from "@/lib/admin/money";

export function MoneyText({
  amount,
  className,
}: {
  amount?: number | null;
  className?: string;
}) {
  return (
    <span className={className ?? "tabular-nums"}>
      {formatMoney(amount ?? 0)}
    </span>
  );
}
