"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  createAvailabilityRule,
  deleteAvailabilityRule,
  createAvailabilityException,
  deleteAvailabilityException,
} from "@/lib/queries/availability";

const createRuleSchema = z.object({
  weekday: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:mm richiesto"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:mm richiesto"),
  slotDurationMinutes: z.coerce.number().int().min(15).max(240),
});

export async function createAvailabilityRuleAction(
  input: z.infer<typeof createRuleSchema>,
): Promise<{ success: boolean; message?: string }> {
  const parsed = createRuleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Dati non validi" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verifica che l'utente sia un medico
  const { data: doctorProfile } = await supabase
    .from("doctor_profiles")
    .select("profile_id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!doctorProfile) {
    return { success: false, message: "Profilo medico non trovato" };
  }

  // Valida che end_time > start_time
  const [startHour, startMin] = parsed.data.startTime.split(":").map(Number);
  const [endHour, endMin] = parsed.data.endTime.split(":").map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  if (endMinutes <= startMinutes) {
    return { success: false, message: "L'ora di fine deve essere dopo l'ora di inizio" };
  }

  try {
    await createAvailabilityRule(user.id, {
      weekday: parsed.data.weekday,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      slotDurationMinutes: parsed.data.slotDurationMinutes,
    });

    return { success: true, message: "Regola salvata con successo" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Errore sconosciuto",
    };
  }
}

export async function deleteAvailabilityRuleAction(
  ruleId: string,
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verifica che la regola appartenga a questo medico
  const { data: rule } = await supabase
    .from("availability_rules")
    .select("doctor_id")
    .eq("id", ruleId)
    .maybeSingle();

  if (!rule || rule.doctor_id !== user.id) {
    return { success: false, message: "Regola non trovata o non autorizzata" };
  }

  try {
    await deleteAvailabilityRule(ruleId);
    return { success: true, message: "Regola eliminata" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Errore sconosciuto",
    };
  }
}

const createExceptionSchema = z.object({
  exceptionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD richiesto"),
  isAvailable: z.boolean(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal("")),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal("")),
  reason: z.string().optional().or(z.literal("")),
});

export async function createAvailabilityExceptionAction(
  input: z.infer<typeof createExceptionSchema>,
): Promise<{ success: boolean; message?: string }> {
  const parsed = createExceptionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Dati non validi" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verifica che l'utente sia un medico
  const { data: doctorProfile } = await supabase
    .from("doctor_profiles")
    .select("profile_id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!doctorProfile) {
    return { success: false, message: "Profilo medico non trovato" };
  }

  try {
    await createAvailabilityException(user.id, {
      exceptionDate: parsed.data.exceptionDate,
      isAvailable: parsed.data.isAvailable,
      startTime: parsed.data.startTime || undefined,
      endTime: parsed.data.endTime || undefined,
      reason: parsed.data.reason || undefined,
    });

    return { success: true, message: "Eccezione salvata con successo" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Errore sconosciuto",
    };
  }
}

export async function deleteAvailabilityExceptionAction(
  exceptionId: string,
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verifica che l'eccezione appartenga a questo medico
  const { data: exception } = await supabase
    .from("availability_exceptions")
    .select("doctor_id")
    .eq("id", exceptionId)
    .maybeSingle();

  if (!exception || exception.doctor_id !== user.id) {
    return { success: false, message: "Eccezione non trovata o non autorizzata" };
  }

  try {
    await deleteAvailabilityException(exceptionId);
    return { success: true, message: "Eccezione eliminata" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Errore sconosciuto",
    };
  }
}
