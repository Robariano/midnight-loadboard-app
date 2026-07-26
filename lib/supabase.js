import { createClient } from "@supabase/supabase-js";

// These come from your Supabase project settings (Settings > API).
// Set them as environment variables — see .env.local.example
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server-side client (used only in API routes) — has full access, never expose to browser.
export function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}
