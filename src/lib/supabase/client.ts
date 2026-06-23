import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/database.types";

/**
 * Client Supabase da usare esclusivamente nei Client Components
 * (es. per ascoltare eventi auth lato client, upload con progress, ecc.).
 * Per la lettura/scrittura dati da Server Components e Server Actions
 * usare invece `createServerSupabaseClient` da `./server`.
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
