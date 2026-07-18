import { useEffect, useState } from "react";
import { TradingPage } from "./pages/TradingPage.tsx";
import { DemoOnboarding } from "./components/DemoOnboarding.tsx";
import { LoginScreen } from "./components/LoginScreen.tsx";
import { useAuthStore, useTradingStore } from "./services/store.tsx";
import * as engine from "./services/demo/engine.ts";
import { isAuthConfigured, verifySession } from "./services/supabaseAuth.ts";

/**
 * OpenCharts entry point.
 *
 * Flow: (1) auth gate — user logs in with their LiquidityHunter email/password
 * (shared Supabase). (2) On first visit, onboarding collects starting balance &
 * leverage. (3) The persisted demo account is restored on every load.
 *
 * If auth env vars aren't configured, the login gate is skipped so the terminal
 * still works (fail-open for local/dev, never a hard lock-out).
 */
function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0a] text-neutral-400">
      Loading…
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

  // 2) Boot the demo terminal once authenticated.
  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    async function boot() {
      await demoLogin();
      localStorage.setItem("is_demo", "false");
      useAuthStore.setState({ isDemo: false });

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
