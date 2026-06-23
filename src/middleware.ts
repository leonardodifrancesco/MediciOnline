import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware";
import type { UserRole } from "@/lib/types/database.types";

const ROLE_HOME: Record<UserRole, string> = {
  patient: "/area-paziente",
  doctor: "/area-medico",
  admin: "/admin",
};

/** Prefissi protetti e ruolo richiesto per accedervi. */
const PROTECTED_PREFIXES: Array<{ prefix: string; role: UserRole }> = [
  { prefix: "/area-paziente", role: "patient" },
  { prefix: "/area-medico", role: "doctor" },
  { prefix: "/admin", role: "admin" },
];

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareSupabaseClient(request);
  const { pathname } = request.nextUrl;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const matchedGuard = PROTECTED_PREFIXES.find(({ prefix }) =>
    pathname.startsWith(prefix),
  );

  if (!matchedGuard) {
    return response;
  }

  // Nessuna sessione: rimanda al login conservando la destinazione originale.
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Sessione presente: verifica il ruolo effettivo da `profiles`.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role as UserRole | undefined;

  if (!role || role !== matchedGuard.role) {
    // Utente autenticato ma area non di sua competenza: lo rimandiamo
    // alla dashboard corretta invece di mostrare un generico 403.
    const fallbackUrl = new URL(role ? ROLE_HOME[role] : "/", request.url);
    return NextResponse.redirect(fallbackUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Esegue il middleware su tutto tranne asset statici, immagini e
     * file interni di Next.js, per non appesantire le richieste non-page.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
