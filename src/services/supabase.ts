import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  "placeholder-anon-key";

export const supabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

// Auth client — uses createBrowserClient so the session is stored in cookies,
// making it readable by server-side route handlers via createServerClient.
// lock: no-op bypasses navigator.locks so tab-switching never aborts a token refresh.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    lock: async (_name, _acquireTimeout, fn) => fn(),
  },
});

// Public client — no auth lock, no token refresh
// Use this for all SELECT queries so tab-switching never blocks reads
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: "halalme-public-anon", // different key — prevents GoTrueClient conflict warning
  },
});
