import { Wallet, LogOut } from "lucide-react";
import { useTradingStore } from "../services/store.tsx";
import { signOut } from "../services/supabaseAuth.ts";

/**
 * Top-toolbar wallet + logout. Shows the account's live funds (equity =
 * balance + open P/L) and the open P/L (both update on every tick), plus a
 * logout button that clears the session and returns to the login screen.
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

  const equity = account?.equity ?? account?.balance ?? 0;
  const balance = account?.balance ?? 0;
  const pnl = equity - balance;
  const pnlColor =
    pnl > 0 ? "text-emerald-500" : pnl < 0 ? "text-red-500" : "text-muted-foreground";

  const logout = () => {
    signOut();
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {account && (
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/60 border border-border"
          title="Account funds (equity) · open P/L"
        >
          <Wallet className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-semibold tabular-nums">{fmtUsd(equity)}</span>
          <span className={`text-xs font-medium tabular-nums ${pnlColor}`}>
            {pnl >= 0 ? "+" : ""}
            {fmtUsd(pnl)}
          </span>
        </div>
      )}
      <button
        onClick={logout}
        title="Log out"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary/40 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
