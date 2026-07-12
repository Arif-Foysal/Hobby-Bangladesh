import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client using the service role key.
 * Only use on the server — never expose to the browser.
 * Bypasses RLS and can use auth.admin APIs.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local for admin user management."
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
