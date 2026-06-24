import { NextResponse, type NextRequest } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

/**
 * Webhook Stripe: sincronizza lo stato del pagamento e della prenotazione.
 * Riceve gli eventi Stripe e aggiorna le tabelle `payments` e `appointments`
 * in modo atomico usando il service role (bypass RLS, perché il webhook
 * non ha un utente loggato nel contesto della richiesta).
 */
export async function POST(request: NextRequest) {
  // Leggi il body raw per la verifica della firma
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Verifica la firma Stripe
  let event: any;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Signature verification failed" },
      { status: 400 },
    );
  }

  const supabase = createServiceRoleSupabaseClient();

  // Gestisci gli eventi Stripe che ci interessano
  switch (event.type) {
    case "checkout.session.completed":
      return handleCheckoutSessionCompleted(event.data.object, supabase);

    case "charge.refunded":
      return handleChargeRefunded(event.data.object, supabase);

    default:
      // Ignora gli altri eventi
      return NextResponse.json({ received: true });
  }
}

async function handleCheckoutSessionCompleted(session: any, supabase: any) {
  const appointmentId = session.metadata?.appointment_id;
  const paymentIntentId = session.payment_intent;

  if (!appointmentId) {
    return NextResponse.json({ error: "Missing appointment_id in metadata" }, { status: 400 });
  }

  try {
    // Recupera l'appuntamento
    const { data: appointment, error: apptError } = await supabase
      .from("appointments")
      .select("id, price, status")
      .eq("id", appointmentId)
      .maybeSingle();

    if (apptError || !appointment) {
      console.error("Appointment not found:", appointmentId);
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.status !== "pending_payment") {
      console.log(`Appointment already processed: ${appointmentId}`);
      return NextResponse.json({ received: true });
    }

    // Crea il payment record
    const { error: paymentError } = await supabase.from("payments").insert({
      appointment_id: appointmentId,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      amount: appointment.price,
      application_fee_amount: (session.total_details?.amount_tax ?? 0) / 100, // Approssimazione
      currency: session.currency || "eur",
      status: "succeeded",
      paid_at: new Date().toISOString(),
    });

    if (paymentError) {
      console.error("Error creating payment:", paymentError);
      return NextResponse.json({ error: "Error creating payment" }, { status: 500 });
    }

    // Aggiorna lo stato dell'appuntamento a "confirmed"
    const { error: updateError } = await supabase
      .from("appointments")
      .update({ status: "confirmed", updated_at: new Date().toISOString() })
      .eq("id", appointmentId);

    if (updateError) {
      console.error("Error updating appointment:", updateError);
      return NextResponse.json({ error: "Error updating appointment" }, { status: 500 });
    }

    console.log(`Payment processed for appointment: ${appointmentId}`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Unexpected error in webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleChargeRefunded(charge: any, supabase: any) {
  const paymentIntentId = charge.payment_intent;

  if (!paymentIntentId) {
    return NextResponse.json({ received: true });
  }

  try {
    // Trova il payment record
    const { data: payment } = await supabase
      .from("payments")
      .select("id, appointment_id")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .maybeSingle();

    if (!payment) {
      console.log(`Payment not found for refund: ${paymentIntentId}`);
      return NextResponse.json({ received: true });
    }

    // Aggiorna il payment a "refunded"
    await supabase
      .from("payments")
      .update({ status: "refunded", refunded_at: new Date().toISOString() })
      .eq("id", payment.id);

    // Se è un rimborso completo, aggiorna l'appuntamento (stato rimane confermato, ma sarà marcato come cancellato dopo)
    console.log(`Refund processed for payment: ${payment.id}`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing refund:", error);
    return NextResponse.json({ received: true });
  }
}
