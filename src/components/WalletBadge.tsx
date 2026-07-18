import { Wallet } from "lucide-react";
import { useTradingStore } from "../services/store.tsx";

/**
 * Compact wallet display for the top toolbar. Shows the account's live funds
 * (equity = balance + open P/L) and the open P/L, both of which update on every
 * market tick via the account's EquityUpdated events.
 */
function fmtUsd(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function WalletBadge() {
  const activeAccountId = useTradingStore((s) => s.activeAccountId);
  const account = useTradingStore((s) => s.accounts.find((a) => a.id === activeAccountId));
  if (!account) return null;

  const equity = account.equity ?? account.balance ?? 0;
  const balance = account.balance ?? 0;
  const pnl = equity - balance;
  const pnlColor =
    pnl > 0 ? "text-emerald-500" : pnl < 0 ? "text-red-500" : "text-muted-foreground";

  return (
    <div
      className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/60 border border-border shrink-0"
      title="Account funds (equity) · open P/L"
    >
      <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs font-semibold tabular-nums">{fmtUsd(equity)}</span>
      <span className={`text-[11px] tabular-nums ${pnlColor}`}>
        {pnl >= 0 ? "+" : ""}
        {fmtUsd(pnl)}
      </span>
    </div>
  );
}
