// Typed Supabase REST & Auth Client for SundaySeeds Staff Web
// Uses browser fetch and sessionStorage, requiring zero third-party dependencies.

export interface StaffSession {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
  };
  expiresAt?: number;
}

export interface StaffCourseAssignment {
  course_id: string;
  draft_id: string | null;
  revision: number;
  title: string;
}

export interface StaffSessionProfile {
  actor_id: string;
  email: string;
  roles: ("admin" | "teacher")[];
  assigned_courses: StaffCourseAssignment[];
}

const STORAGE_KEY = "sundayseeds_staff_session_v1";

export function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const env = import.meta.env;
  const url =
    env.VITE_SUPABASE_URL ||
    env.EXPO_PUBLIC_SUPABASE_URL ||
    "";
  const anonKey =
    env.VITE_SUPABASE_ANON_KEY ||
    env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "";

  if (!url || !anonKey) {
    return null;
  }
  return { url: url.replace(/\/+$/, ""), anonKey };
}

export function getStoredSession(): StaffSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as StaffSession;
    if (!session.accessToken || !session.user?.id) return null;
    return session;
  } catch {
    return null;
  }
}

export function setStoredSession(session: StaffSession | null): void {
  try {
    if (session) {
      const data = JSON.stringify(session);
      sessionStorage.setItem(STORAGE_KEY, data);
      localStorage.setItem(STORAGE_KEY, data);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage access blocked or full
  }
}

export async function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<{ ok: boolean; session?: StaffSession; message?: string }> {
  const config = getSupabaseConfig();
  if (!config) {
    return {
      ok: false,
      message: "Supabase configuration is not configured. Check environment variables.",
    };
  }

  try {
    const res = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const data = await res.json();
    if (!res.ok) {
      const msg =
        data.error_description ||
        data.msg ||
        (data.code === "invalid_credentials"
          ? "Invalid email or password. Please try again."
          : "Authentication failed. Please check your credentials.");
      return { ok: false, message: msg };
    }

    if (!data.access_token || !data.user) {
      return { ok: false, message: "Sign in did not return an access token." };
    }

    const session: StaffSession = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email || email.trim(),
      },
      expiresAt: data.expires_at ? data.expires_at * 1000 : undefined,
    };

    setStoredSession(session);
    return { ok: true, session };
  } catch (err) {
    return {
      ok: false,
      message: "Unable to connect to the authentication service. Check your connection.",
    };
  }
}

export async function signOutStaff(token?: string): Promise<void> {
  setStoredSession(null);
  const config = getSupabaseConfig();
  if (!config || !token) return;

  try {
    await fetch(`${config.url}/auth/v1/logout`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // Local session already cleared
  }
}

export async function callRpc<T = unknown>(
  rpcName: string,
  parameters: Record<string, unknown> = {},
  token?: string,
): Promise<T> {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase is not configured.");
  }

  const activeToken = token || getStoredSession()?.accessToken;
  const headers: Record<string, string> = {
    apikey: config.anonKey,
    "Content-Type": "application/json",
  };
  if (activeToken) {
    headers.Authorization = `Bearer ${activeToken}`;
  }

  const res = await fetch(`${config.url}/rest/v1/rpc/${rpcName}`, {
    method: "POST",
    headers,
    body: JSON.stringify(parameters),
  });

  if (!res.ok) {
    let errorDetails: { message?: string; code?: string } = {};
    try {
      errorDetails = await res.json();
    } catch {
      // Ignored
    }
    const error = new Error(errorDetails.message || `RPC ${rpcName} failed with status ${res.status}`);
    (error as Error & { code?: string }).code = errorDetails.code;
    throw error;
  }

  return (await res.json()) as T;
}
