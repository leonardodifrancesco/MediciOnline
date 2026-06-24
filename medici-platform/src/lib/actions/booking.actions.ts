"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { createAppointmentSchema } from "@/lib/validations/auth.schema";
import type { CreateAppointmentInput } from "@/lib/validations/auth.schema";

export interface CreateAppointmentResult {
  success: boolean;
  appointmentId?: string;
  message?: string;
}

/**
 * Crea un appuntamento nello stato "pending_payment" e ritorna l'ID.
 * Viene calata dal patient tramite una Server Action che crea anche
 * la Stripe Checkout Session.
 */
export async function createAppointment(
  patientId: string,
  input: CreateAppointmentInput,
): Promise<CreateAppointmentResult> {
  const parsed = createAppointmentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Dati appuntamento non validi" };
  }

  const supabase = await createServerSupabaseClient();

  // Recupera il medico e la tariffa attuali
  const { data: doctor } = await supabase
    .from("doctor_profiles")
    .select("consultation_fee, consultation_type")
    .eq("profile_id", parsed.data.doctorId)
    .maybeSingle();

  if (!doctor) {
    return { success: false, message: "Medico non trovato" };
  }

  // Crea l'appuntamento nello stato pending_payment
  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      patient_id: patientId,
      doctor_id: parsed.data.doctorId,
      scheduled_start: parsed.data.scheduledStart,
      scheduled_end: parsed.data.scheduledEnd,
      status: "pending_payment",
      consultation_type: parsed.data.consultationType,
      patient_notes: parsed.data.patientNotes || null,
      price: doctor.consultation_fee,
    })
    .select("id")
    .single();

  if (error || !appointment) {
    // Controllo specifico: slot già prenotato (unique constraint violato)
    if (error?.message.includes("duplicate key") || error?.message.includes("unique")) {
      return { success: false, message: "Lo slot è già stato prenotato. Scegli un altro orario." };
    }
    return { success: false, message: "Errore nel salvataggio dell'appuntamento" };
  }

  return { success: true, appointmentId: appointment.id };
}

export interface CreateCheckoutSessionResult {
  success: boolean;
  checkoutUrl?: string;
  message?: string;
}

/**
 * Crea una Stripe Checkout Session per un appuntamento già creato.
 * La sessione include:
 * - line_items: tariffa medico
 * - application_fee_amount: commissione piattaforma (10%)
 * - transfer_data.destination: account Stripe Connect del medico (se esiste)
 */
export async function createCheckoutSessionForAppointment(
  appointmentId: string,
): Promise<CreateCheckoutSessionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Recupera l'appuntamento con i dati del medico
  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      `
      id, price, status, doctor_id,
      doctor_profiles!doctor_id (
        profile_id,
        consultation_fee,
        doctor_stripe_accounts ( stripe_account_id )
      )
    `,
    )
    .eq("id", appointmentId)
    .eq("patient_id", user.id)
    .maybeSingle();

  if (!appointment || appointment.status !== "pending_payment") {
    return { success: false, message: "Appuntamento non trovato o già pagato" };
  }

  const doctorProfile = Array.isArray(appointment.doctor_profiles)
    ? appointment.doctor_profiles[0]
    : appointment.doctor_profiles;

  if (!doctorProfile) {
    return { success: false, message: "Profilo medico non trovato" };
  }

  const stripeAccounts = Array.isArray(doctorProfile.doctor_stripe_accounts)
    ? doctorProfile.doctor_stripe_accounts[0]
    : doctorProfile.doctor_stripe_accounts;

  const applicationFeeAmount = Math.round(appointment.price * 0.1 * 100); // 10% commissione, in centesimi
  const totalAmountCents = Math.round(appointment.price * 100);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Visita medica - ${doctorProfile.profile_id}`,
              description: `Prenotazione appuntamento con medico`,
            },
            unit_amount: totalAmountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/area-paziente/prenota/conferma?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/area-paziente/appuntamenti`,
      metadata: {
        appointment_id: appointmentId,
        patient_id: user.id,
        doctor_id: appointment.doctor_id,
      },
      // Payment intent con application_fee_amount e transfer_data verso il medico
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        ...(stripeAccounts?.stripe_account_id
          ? {
              transfer_data: {
                destination: stripeAccounts.stripe_account_id,
              },
            }
          : {}),
      },
    });

    return { success: true, checkoutUrl: session.url ?? undefined };
  } catch (error) {
    return {
      success: false,
      message: `Errore Stripe: ${error instanceof Error ? error.message : "Errore sconosciuto"}`,
    };
  }
}
