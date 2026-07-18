import { useEffect, useState } from "react";
import { TradingPage } from "./pages/TradingPage.tsx";
import { DemoOnboarding } from "./components/DemoOnboarding.tsx";
import { LoginScreen } from "./components/LoginScreen.tsx";
import { Logo } from "./components/Logo.tsx";
import { useAuthStore, useTradingStore } from "./services/store.tsx";
import * as engine from "./services/demo/engine.ts";
import { getUser, isAuthConfigured, verifySession } from "./services/supabaseAuth.ts";

/**
 * Liquidity Hunter — trading terminal entry point.
 *
 * Flow: (1) login gate (shared LiquidityHunter/Supabase email+password).
 * (2) The engine is scoped to THIS user, so their funds/positions are isolated.
 * (3) First-time users pick a starting balance & leverage. (4) The account is
 * restored on every load.
 */
function Loading() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-[#0a0a0a]">
      <Logo size="lg" showTagline />
      <span className="text-xs text-neutral-500">Loading…</span>
    </div>
  );
}

export function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const demoLogin = useAuthStore((s) => s.demoLogin);
  const loadSymbols = useTradingStore((s) => s.loadSymbols);
  const loadAccounts = useTradingStore((s) => s.loadAccounts);

  // 1) Check the login session on load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isAuthConfigured()) {
        if (!cancelled) {
          setAuthed(true);
          setAuthChecked(true);
        }
        return;
      }
      const ok = await verifySession();
      if (!cancelled) {
        setAuthed(ok);
        setAuthChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 2) Boot the terminal once authenticated — scoped to this user's account.
  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    async function boot() {
      await demoLogin();
      localStorage.setItem("is_demo", "false");
      useAuthStore.setState({ isDemo: false });

      // Isolate this user's funds / positions / history.
      engine.setUser(getUser()?.id ?? null);

      if (!engine.isInitialized()) {
        if (!cancelled) {
          setNeedsOnboarding(true);
          setReady(true);
        }
        return;
      }

      await Promise.all([loadSymbols(), loadAccounts()]);
      if (!cancelled) setReady(true);
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, [authed, demoLogin, loadSymbols, loadAccounts]);

  const finishOnboarding = async () => {
    await Promise.all([loadSymbols(), loadAccounts()]);
    setNeedsOnboarding(false);
  };

  if (!authChecked) return <Loading />;
  if (!authed) return <LoginScreen onSuccess={() => setAuthed(true)} />;
  if (!ready) return <Loading />;
  if (needsOnboarding) return <DemoOnboarding onComplete={finishOnboarding} />;
  return <TradingPage />;
}
