import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Simple client for server-side usage (API routes, etc.)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Singleton browser client to avoid auth token lock races
let browserClient: ReturnType<typeof createBrowserClient<any, any>> | null = null;

export function createSupabaseBrowser() {
  if (!browserClient) {
    browserClient = createBrowserClient<any, any>(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}
