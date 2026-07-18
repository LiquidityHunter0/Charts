/**
 * Minimal Supabase Auth client (no SDK dependency — direct REST calls).
 *
 * Uses the SAME Supabase project as LiquidityHunter, so a user's existing
 * email/password works here unchanged. The anon key is a public, browser-safe
 * key (never the service_role key). All traffic is HTTPS to Supabase.
 */

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const SESSION_KEY = "oc_auth_session";

export type AuthUser = { id: string; email?: string };
type Session = { access_token: string; refresh_token?: string; user: AuthUser };

/** True only when both env vars are present (set in Vercel). */
export function isAuthConfigured(): boolean {
  return Boolean(URL && ANON);
}

export function getSavedSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function getUser(): AuthUser | null {
  return getSavedSession()?.user ?? null;
}

/** Sign in with email + password against Supabase Auth. */
export async function signIn(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!URL || !ANON) return { ok: false, error: "Login is not configured yet." };
  try {
    const res = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: ANON, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        data.error_description || data.msg || data.error || "Invalid email or password.";
      return { ok: false, error: String(msg) };
    }
    const session: Session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: { id: data.user?.id, email: data.user?.email },
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error — please try again." };
  }
}

export function signOut(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* no-op */
  }
}

/** Verify the saved token is still valid (used on app load). */
export async function verifySession(): Promise<boolean> {
  const s = getSavedSession();
  if (!s?.access_token || !URL || !ANON) return false;
  try {
    const res = await fetch(`${URL}/auth/v1/user`, {
      headers: { apikey: ANON, Authorization: `Bearer ${s.access_token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}
