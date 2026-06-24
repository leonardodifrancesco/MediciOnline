import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database.types";

/**
 * Recupera il profilo dell'utente autenticato per i Server Component delle
 * aree protette. Il controllo di ruolo "duro" è già fatto dal middleware:
 * qui ci limitiamo a leggere i dati per la UI (saluto, badge, ecc.) e a
 * gestire in modo morbido il caso limite di sessione assente.
 */
export async function getCurrentProfile(): Promise<Profile> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  return profile;
}
