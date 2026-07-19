import { useEffect, useState } from "react";
import { TradingPage } from "./pages/TradingPage.tsx";
import { DemoOnboarding } from "./components/DemoOnboarding.tsx";
import { LoginScreen } from "./components/LoginScreen.tsx";
import { Logo } from "./components/Logo.tsx";
import { useAuthStore, useTradingStore } from "./services/store.tsx";
import * as engine from "./services/demo/engine.ts";
import { getUser, isAuthConfigured, verifySession } from "./services/supabaseAuth.ts";
import * as cloud from "./services/cloudSync.ts";

/**
 * Liquidity Hunter — trading terminal entry point.
 *
 * (1) Login gate (shared LiquidityHunter/Supabase). (2) The user's account is
 * loaded from the CLOUD so it follows them across devices; falls back to this
 * device's copy, else onboarding. (3) Every change syncs back to the cloud.
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

  // 2) Boot the terminal once authenticated — cloud account, scoped to user.
  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    async function boot() {
      await demoLogin();
      localStorage.setItem("is_demo", "false");
      useAuthStore.setState({ isDemo: false });

      const uid = getUser()?.id ?? null;
      engine.setUser(uid); // load this device's copy first (instant)

      // Cloud is the source of truth across devices.
      if (uid && cloud.isCloudEnabled()) {
        const cloudState = await cloud.fetchState(uid);
        if (cloudState?.account) {
          engine.hydrate(uid, cloudState);
        } else if (engine.isInitialized()) {
          cloud.pushState(uid, engine.getState()); // migrate this device's account up
        }
        cloud.startAutoSync(uid); // keep cloud in sync on every change
      }

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
