"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  loginSchema,
  patientSignUpSchema,
  doctorSignUpSchema,
  requestPasswordResetSchema,
  newPasswordSchema,
  type LoginInput,
  type PatientSignUpInput,
  type DoctorSignUpInput,
  type RequestPasswordResetInput,
  type NewPasswordInput,
} from "@/lib/validations/auth.schema";
import type { UserRole } from "@/lib/types/database.types";

export type AuthActionResult = {
  success: boolean;
  message?: string;
};

const ROLE_HOME: Record<UserRole, string> = {
  patient: "/area-paziente",
  doctor: "/area-medico",
  admin: "/admin",
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Autentica l'utente e lo reindirizza alla dashboard corrispondente al
 * suo ruolo. La validazione Zod è ripetuta lato server anche se il form
 * la esegue già lato client: il client non è una fonte fidata.
 */
export async function signInAction(input: LoginInput, redirectTo?: string): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Controlla email e password e riprova." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { success: false, message: "Email o password non corrette." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role = (profile?.role ?? "patient") as UserRole;
  
  // Se è stato passato un redirectTo e inizia con /, usalo; altrimenti la default della dashboard
  const destination = redirectTo?.startsWith("/") ? redirectTo : ROLE_HOME[role];
  redirect(destination);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Registrazione paziente. Il trigger DB `handle_new_user` crea già la riga
 * in `profiles`; qui salviamo solo l'eventuale telefono, non gestito dal
 * trigger perché non presente nei metadata minimi di auth.users.
 */
export async function signUpPatientAction(
  input: PatientSignUpInput,
): Promise<AuthActionResult> {
  const parsed = patientSignUpSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Controlla i campi del modulo e riprova." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName, role: "patient" },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error || !data.user) {
    if (error?.message.toLowerCase().includes("already registered")) {
      return { success: false, message: "Esiste già un account con questa email." };
    }
    return { success: false, message: "Non è stato possibile completare la registrazione." };
  }

  if (parsed.data.phone) {
    await supabase
      .from("profiles")
      .update({ phone: parsed.data.phone })
      .eq("id", data.user.id);
  }

  if (data.session) {
    redirect("/area-paziente");
  }

  return {
    success: true,
    message:
      "Registrazione completata. Controlla la tua casella email per confermare l'account.",
  };
}

/**
 * Registrazione medico: crea l'utente auth, il profilo professionale
 * (`doctor_profiles`, stato di verifica `pending`) e i collegamenti con le
 * specializzazioni selezionate. Il medico resta invisibile in ricerca
 * (`is_visible = false`, gestito dal trigger DB) finché un admin non lo
 * approva da `/admin/medici`.
 */
export async function signUpDoctorAction(
  input: DoctorSignUpInput,
): Promise<AuthActionResult> {
  const parsed = doctorSignUpSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Controlla i campi del modulo e riprova." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName, role: "doctor" },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error || !data.user) {
    if (error?.message.toLowerCase().includes("already registered")) {
      return { success: false, message: "Esiste già un account con questa email." };
    }
    return { success: false, message: "Non è stato possibile completare la registrazione." };
  }

  const doctorId = data.user.id;
  const slug = `${slugify(parsed.data.fullName)}-${doctorId.slice(0, 6)}`;

  const { error: doctorProfileError } = await supabase.from("doctor_profiles").insert({
    profile_id: doctorId,
    slug,
    bio: parsed.data.bio,
    years_experience: parsed.data.yearsExperience,
    license_number: parsed.data.licenseNumber,
    consultation_fee: parsed.data.consultationFee,
    consultation_type: parsed.data.consultationType,
    city: parsed.data.city || null,
  });

  if (doctorProfileError) {
    return {
      success: false,
      message:
        "Account creato ma il profilo professionale non è stato salvato. Contatta l'assistenza.",
    };
  }

  const specializationRows = parsed.data.specializationIds.map((specializationId) => ({
    doctor_id: doctorId,
    specialization_id: specializationId,
  }));
  await supabase.from("doctor_specializations").insert(specializationRows);

  if (parsed.data.phone) {
    await supabase.from("profiles").update({ phone: parsed.data.phone }).eq("id", doctorId);
  }

  if (data.session) {
    redirect("/area-medico");
  }

  return {
    success: true,
    message:
      "Registrazione completata. Confermi la tua email e poi il nostro team verificherà il profilo: riceverai una notifica quando sarà visibile ai pazienti.",
  };
}

/**
 * Invia l'email di reset password. Risponde sempre con lo stesso messaggio
 * di successo, anche se l'email non esiste, per non rivelare quali
 * indirizzi sono registrati sulla piattaforma.
 */
export async function requestPasswordResetAction(
  input: RequestPasswordResetInput,
): Promise<AuthActionResult> {
  const parsed = requestPasswordResetSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Inserisci un'email valida." };
  }

  const supabase = await createServerSupabaseClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  return {
    success: true,
    message:
      "Se l'indirizzo è registrato, riceverai a breve un'email con le istruzioni per reimpostare la password.",
  };
}

/**
 * Imposta la nuova password. Richiede una sessione di recovery valida,
 * già stabilita dal link ricevuto via email (Supabase gestisce lo scambio
 * del token in automatico quando l'utente apre il link su `/reset-password`).
 */
export async function updatePasswordAction(
  input: NewPasswordInput,
): Promise<AuthActionResult> {
  const parsed = newPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Controlla i campi e riprova." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return {
      success: false,
      message: "Non è stato possibile aggiornare la password. Richiedi un nuovo link.",
    };
  }

  return { success: true, message: "Password aggiornata. Ora puoi accedere." };
}
