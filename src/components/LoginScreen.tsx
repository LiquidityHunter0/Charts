import { useState } from "react";
import { signIn } from "../services/supabaseAuth.ts";
import { Logo } from "./Logo.tsx";

/**
 * Login gate. Users sign in with their LiquidityHunter email & password
 * (same Supabase project). No trading is shown until authenticated.
 */
export function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;
    setError(null);
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);
    if (res.ok) onSuccess();
    else setError(res.error);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0a] px-4 text-neutral-200">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-[#111] p-8 shadow-2xl">
        <div className="mb-6 flex justify-center">
          <Logo size="lg" showTagline />
        </div>
        <h1 className="mb-1 text-xl font-semibold text-white">Log in</h1>
        <p className="mb-6 text-sm text-neutral-400">
          Use your Liquidity Hunter email and password to start trading.
        </p>

        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">
          Email
        </label>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={onKey}
          className="mb-4 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
          placeholder="you@example.com"
        />

        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">
          Password
        </label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={onKey}
          className="mb-4 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
          placeholder="••••••••"
        />

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-60"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>

        <p className="mt-4 text-center text-xs text-neutral-600">
          Don't have an account? Sign up on LiquidityHunter first.
        </p>
      </div>
    </div>
  );
}
