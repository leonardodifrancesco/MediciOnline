import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/lib/types/database.types";

/**
 * Client Supabase da usare in Server Components, Server Actions e
 * Route Handler "normali" (non il webhook). Legge/scrive la sessione
 * tramite i cookie della richiesta, rispettando la RLS come l'utente
 * autenticato corrente.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Il metodo `set` può fallire se chiamato da un Server Component
            // (non da una Server Action o Route Handler): in quel caso il
            // middleware si occupa già del refresh della sessione, quindi
            // l'errore può essere ignorato in sicurezza.
          }
        },
      },
    },
  );
}

/**
 * Client Supabase con la service role key: bypassa la Row Level Security.
 * Da usare SOLO in contesti server-side fidati e ben circoscritti, come
 * il webhook Stripe (nessun utente loggato nel contesto della richiesta)
 * o azioni amministrative già verificate a livello applicativo.
 *
 * Non importare mai questo modulo in un Client Component.
 */
export function createServiceRoleSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
