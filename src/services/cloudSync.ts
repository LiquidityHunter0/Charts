import { getSavedSession } from "./supabaseAuth.ts";
import * as engine from "./demo/engine.ts";

/**
 * Cloud sync for the user's account state (Supabase Postgres via PostgREST).
 *
 * Saves each user's account/positions/history to a `charts_accounts` row keyed
 * by their auth user id, so the SAME account follows them across devices. Row
 * Level Security ensures a user can only read/write their own row.
 */

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const TABLE = "charts_accounts";

export function isCloudEnabled(): boolean {
  return Boolean(URL && ANON);
}

function authHeaders(): Record<string, string> | null {
  const s = getSavedSession();
  if (!s?.access_token || !ANON) return null;
  return { apikey: ANON, Authorization: `Bearer ${s.access_token}` };
}

/** Load this user's saved state from the cloud (or null if none / offline). */
export async function fetchState(userId: string): Promise<ReturnType<typeof engine.getState> | null> {
  if (!URL) return null;
  const h = authHeaders();
  if (!h) return null;
  try {
    const res = await fetch(
      `${URL}/rest/v1/${TABLE}?user_id=eq.${userId}&select=state`,
      { headers: h },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{ state: ReturnType<typeof engine.getState> }>;
    return rows?.[0]?.state ?? null;
  } catch {
    return null;
  }
}

// Debounced upsert so rapid ticks/trades don't spam the network.
let timer: ReturnType<typeof setTimeout> | null = null;
export function pushState(userId: string, state: unknown): void {
  if (!URL) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    const h = authHeaders();
    if (!h) return;
    try {
      await fetch(`${URL}/rest/v1/${TABLE}`, {
        method: "POST",
        headers: { ...h, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify({ user_id: userId, state, updated_at: new Date().toISOString() }),
      });
    } catch {
      /* offline — local copy still saved; will sync next change */
    }
  }, 1500);
}

// Keep the cloud in sync on every account change.
let unsub: (() => void) | null = null;
export function startAutoSync(userId: string): void {
  if (unsub) unsub();
  unsub = engine.onChange(() => pushState(userId, engine.getState()));
}
