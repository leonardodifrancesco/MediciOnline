import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/database.types";

const ROLE_HOME: Record<UserRole, string> = {
  patient: "/area-paziente",
  doctor: "/area-medico",
  admin: "/admin",
};

/**
 * Punto di arrivo dei link "Conferma la tua email" inviati da Supabase Auth.
 * Scambia il code per una sessione e reindirizza l'utente alla dashboard
 * corretta in base al ruolo. In caso di errore (link scaduto/non valido)
 * torna al login con un messaggio.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=link_non_valido`);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=link_scaduto`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? "patient") as UserRole;
  return NextResponse.redirect(`${origin}${ROLE_HOME[role]}`);
}
