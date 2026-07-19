import { getSavedSession, getUser } from "./supabaseAuth.ts";

/**
 * Fetches the user's nickname from LiquidityHunter's `profiles.username`
 * (same Supabase). Falls back to the email prefix if unavailable.
 */
const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let cached: string | null = null;

export async function getNickname(): Promise<string> {
  if (cached !== null) return cached;
  const user = getUser();
  const session = getSavedSession();
  const fallback = user?.email ? user.email.split("@")[0] : "trader";

  if (!URL || !ANON || !session?.access_token || !user?.id) {
    cached = fallback;
    return cached;
  }
  try {
    const res = await fetch(`${URL}/rest/v1/profiles?id=eq.${user.id}&select=username`, {
      headers: { apikey: ANON, Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      const rows = (await res.json()) as Array<{ username?: string }>;
      cached = rows?.[0]?.username || fallback;
      return cached;
    }
  } catch {
    /* offline */
  }
  cached = fallback;
  return cached;
}
