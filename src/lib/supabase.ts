import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Simple client for server-side usage (API routes, etc.)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Singleton browser client — uses standard client to avoid SSR lock races
let browserClient: ReturnType<typeof createClient> | null = null;

export function createSupabaseBrowser() {
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return browserClient;
}
