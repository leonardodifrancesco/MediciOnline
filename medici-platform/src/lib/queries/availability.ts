import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AvailabilityRule, AvailabilityException } from "@/lib/types/database.types";

export interface CreateAvailabilityRuleInput {
  weekday: number; // 0 = domenica, 6 = sabato
  startTime: string; // HH:mm
  endTime: string;
  slotDurationMinutes: number;
}

export async function getDoctorAvailabilityRules(doctorId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("availability_rules")
    .select("*")
    .eq("doctor_id", doctorId)
    .eq("is_active", true)
    .order("weekday");
  return (data ?? []) as AvailabilityRule[];
}

export async function getDoctorAvailabilityExceptions(doctorId: string, dateRange?: { from: string; to: string }) {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("availability_exceptions")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("exception_date");

  if (dateRange) {
    query = query
      .gte("exception_date", dateRange.from)
      .lte("exception_date", dateRange.to);
  }

  const { data } = await query;
  return (data ?? []) as AvailabilityException[];
}

export async function createAvailabilityRule(doctorId: string, input: CreateAvailabilityRuleInput) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("availability_rules").insert({
    doctor_id: doctorId,
    weekday: input.weekday,
    start_time: input.startTime,
    end_time: input.endTime,
    slot_duration_minutes: input.slotDurationMinutes,
    is_active: true,
  });

  if (error) {
    throw new Error(`Errore nel salvataggio della regola: ${error.message}`);
  }
}

export async function deleteAvailabilityRule(ruleId: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("availability_rules")
    .update({ is_active: false })
    .eq("id", ruleId);

  if (error) {
    throw new Error(`Errore nell'eliminazione della regola: ${error.message}`);
  }
}

export interface CreateAvailabilityExceptionInput {
  exceptionDate: string; // YYYY-MM-DD
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export async function createAvailabilityException(
  doctorId: string,
  input: CreateAvailabilityExceptionInput,
) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("availability_exceptions").insert({
    doctor_id: doctorId,
    exception_date: input.exceptionDate,
    is_available: input.isAvailable,
    start_time: input.startTime || null,
    end_time: input.endTime || null,
    reason: input.reason || null,
  });

  if (error) {
    if (error.message.includes("duplicate key")) {
      throw new Error("Esiste già un'eccezione per questa data.");
    }
    throw new Error(`Errore nel salvataggio dell'eccezione: ${error.message}`);
  }
}

export async function deleteAvailabilityException(exceptionId: string) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("availability_exceptions")
    .delete()
    .eq("id", exceptionId);

  if (error) {
    throw new Error(`Errore nell'eliminazione dell'eccezione: ${error.message}`);
  }
}

/**
 * Calcola gli slot liberi per un medico in un intervallo di date.
 * Usa le `availability_rules` (regole settimanali ricorrenti),
 * le `availability_exceptions` (chiusure/aperture extra) e gli
 * `appointments` già prenotati per escludere orari non disponibili.
 */
export async function calculateAvailableSlots(
  doctorId: string,
  dateRange: { from: Date; to: Date },
): Promise<Array<{ start: Date; end: Date }>> {
  const supabase = await createServerSupabaseClient();

  // Recupera le regole di disponibilità settimanale attive
  const rules = await getDoctorAvailabilityRules(doctorId);
  if (rules.length === 0) {
    return [];
  }

  // Recupera le eccezioni nell'intervallo di date
  const fromStr = dateRange.from.toISOString().split("T")[0];
  const toStr = dateRange.to.toISOString().split("T")[0];
  const exceptions = await getDoctorAvailabilityExceptions(doctorId, {
    from: fromStr,
    to: toStr,
  });

  // Recupera gli appuntamenti già confermati o in attesa di pagamento
  const { data: appointments } = await supabase
    .from("appointments")
    .select("scheduled_start, scheduled_end")
    .eq("doctor_id", doctorId)
    .in("status", ["pending_payment", "confirmed"])
    .gte("scheduled_start", dateRange.from.toISOString())
    .lte("scheduled_end", dateRange.to.toISOString());

  const bookedIntervals = (appointments ?? []).map((apt) => ({
    start: new Date(apt.scheduled_start),
    end: new Date(apt.scheduled_end),
  }));

  const slots: Array<{ start: Date; end: Date }> = [];
  let current = new Date(dateRange.from);
  current.setHours(0, 0, 0, 0);

  while (current <= dateRange.to) {
    const dateStr = current.toISOString().split("T")[0];
    const weekday = current.getDay();

    // Controlla se questa data ha un'eccezione
    const exception = exceptions.find((e) => e.exception_date === dateStr);

    if (exception) {
      if (exception.is_available && exception.start_time && exception.end_time) {
        // Eccezione che apre un orario straordinario
        const [startHour, startMin] = exception.start_time.split(":").map(Number);
        const [endHour, endMin] = exception.end_time.split(":").map(Number);

        const slotStart = new Date(current);
        slotStart.setHours(startHour, startMin, 0, 0);
        const slotEnd = new Date(current);
        slotEnd.setHours(endHour, endMin, 0, 0);

        const newSlots = generateSlotsInInterval(slotStart, slotEnd, 30, bookedIntervals);
        slots.push(...newSlots);
      }
      // Se exception.is_available === false, il giorno è completamente bloccato
    } else {
      // Nessuna eccezione: usa le regole settimanali ricorrenti
      const rule = rules.find((r) => r.weekday === weekday);
      if (rule) {
        const [startHour, startMin] = rule.start_time.split(":").map(Number);
        const [endHour, endMin] = rule.end_time.split(":").map(Number);

        const slotStart = new Date(current);
        slotStart.setHours(startHour, startMin, 0, 0);
        const slotEnd = new Date(current);
        slotEnd.setHours(endHour, endMin, 0, 0);

        const newSlots = generateSlotsInInterval(
          slotStart,
          slotEnd,
          rule.slot_duration_minutes,
          bookedIntervals,
        );
        slots.push(...newSlots);
      }
    }

    // Passa al giorno successivo
    current.setDate(current.getDate() + 1);
  }

  return slots;
}

/** Funzione helper: genera gli slot disponibili in un intervallo, escludendo quelli già prenotati */
function generateSlotsInInterval(
  start: Date,
  end: Date,
  durationMinutes: number,
  bookedIntervals: Array<{ start: Date; end: Date }>,
): Array<{ start: Date; end: Date }> {
  const slots: Array<{ start: Date; end: Date }> = [];
  let current = new Date(start);

  while (current < end) {
    const slotEnd = new Date(current);
    slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

    // Verifica se questo slot si sovrappone con un appuntamento già prenotato
    const isBooked = bookedIntervals.some(
      (booked) => current < booked.end && slotEnd > booked.start,
    );

    if (!isBooked && slotEnd <= end) {
      slots.push({ start: new Date(current), end: slotEnd });
    }

    current = slotEnd;
  }

  return slots;
}

const WEEKDAY_NAMES = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
export { WEEKDAY_NAMES };
