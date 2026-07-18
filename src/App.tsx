import { useEffect, useState } from "react";
import { TradingPage } from "./pages/TradingPage.tsx";
import { DemoOnboarding } from "./components/DemoOnboarding.tsx";
import { useAuthStore, useTradingStore } from "./services/store.tsx";
import * as engine from "./services/demo/engine.ts";

/**
 * OpenCharts entry point.
 *
 * Boots into the in-browser demo session. On a user's first visit (no saved
 * account) an onboarding screen collects starting balance & leverage; after
 * that the persisted account is restored automatically on every load.
 */
export function App() {
  const [ready, setReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const demoLogin = useAuthStore((s) => s.demoLogin);
  const loadSymbols = useTradingStore((s) => s.loadSymbols);
  const loadAccounts = useTradingStore((s) => s.loadAccounts);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      await demoLogin();
      // Paper trades genuinely execute against the in-browser engine, so this
      // is a real (non-demo) session — clears the "trading disabled" gate.
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
  }, [demoLogin, loadSymbols, loadAccounts]);

  const finishOnboarding = async () => {
    await Promise.all([loadSymbols(), loadAccounts()]);
    setNeedsOnboarding(false);
  };

  if (!ready) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0a] text-neutral-400">
        Loading OpenCharts…
      </div>
    );
  }

  if (needsOnboarding) {
    return <DemoOnboarding onComplete={finishOnboarding} />;
  }

  return <TradingPage />;
}
