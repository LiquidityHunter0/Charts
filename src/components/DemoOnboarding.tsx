import { useState } from "react";
import * as engine from "../services/demo/engine.ts";
import { Logo } from "./Logo.tsx";

/**
 * First-run onboarding for the demo terminal. A new user picks a starting
 * balance and leverage; this seeds (and persists) their demo account. Shown by
 * App.tsx whenever engine.isInitialized() is false.
 */

const BALANCES = [10_000, 25_000, 50_000, 100_000];
const LEVERAGES = [1, 5, 10, 20, 50, 100];

function fmt(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

export function DemoOnboarding({ onComplete }: { onComplete: () => void }) {
  const [balance, setBalance] = useState(100_000);
  const [lev, setLev] = useState(100);

  const start = () => {
    engine.initDemoAccount(balance, lev);
    onComplete();
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0a] px-4 text-neutral-200">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#111] p-8 shadow-2xl">
        <div className="mb-5 flex justify-center">
          <Logo size="lg" />
        </div>
        <h1 className="mb-1 text-2xl font-semibold text-white">Set up your account</h1>
        <p className="mb-6 text-sm text-neutral-400">
          Pick a starting balance and leverage to begin trading with live market prices.
        </p>

        <div className="mb-6">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Starting balance
          </div>
          <div className="grid grid-cols-2 gap-2">
            {BALANCES.map((b) => (
              <button
                key={b}
                onClick={() => setBalance(b)}
                className={
                  "rounded-lg border px-4 py-3 text-sm font-medium transition " +
                  (balance === b
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700")
                }
              >
                {fmt(b)}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Leverage
          </div>
          <div className="grid grid-cols-3 gap-2">
            {LEVERAGES.map((l) => (
              <button
                key={l}
                onClick={() => setLev(l)}
                className={
                  "rounded-lg border px-4 py-2.5 text-sm font-medium transition " +
                  (lev === l
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700")
                }
              >
                {l}x
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={start}
          className="w-full rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
        >
          Start Trading — {fmt(balance)} @ {lev}x
        </button>

        <p className="mt-4 text-center text-xs text-neutral-600">
          Live market prices · paper trading · your account is saved on this device
        </p>
      </div>
    </div>
  );
}
