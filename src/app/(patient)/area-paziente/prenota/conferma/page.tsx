import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";

export default async function BookingConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    notFound();
  }

  let sessionStatus = "pending";
  let appointmentId: string | null = null;
  let error = false;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    sessionStatus = session.payment_status;
    appointmentId = session.metadata?.appointment_id ?? null;

    // Se il pagamento è andato a buon fine, il webhook ha già aggiornato l'appuntamento a "confirmed"
    if (sessionStatus === "paid" && appointmentId) {
      // Opzionale: qui potremmo registrare un evento di analytics o inviare una notifica
    }
  } catch (err) {
    error = true;
    console.error("Error retrieving Stripe session:", err);
  }

  const isPaid = sessionStatus === "paid";

  return (
    <div className="container-app flex min-h-screen flex-col items-center justify-center py-8">
      <div className="max-w-md text-center">
        {isPaid && !error ? (
          <>
            <span className="flex size-16 items-center justify-center rounded-full bg-success-soft text-success mx-auto mb-4">
              <CheckCircle className="size-8" aria-hidden="true" />
            </span>
            <CardTitle className="text-2xl">Prenotazione confermata!</CardTitle>
            <p className="mt-2 text-sm text-ink-soft">
              Il pagamento è stato elaborato con successo. Riceverai un'email di conferma con
              tutti i dettagli dell'appuntamento.
            </p>
            <Link
              href="/area-paziente/appuntamenti"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary-bright"
            >
              Vai ai miei appuntamenti
            </Link>
          </>
        ) : (
          <>
            <span className="flex size-16 items-center justify-center rounded-full bg-warning-soft text-warning mx-auto mb-4">
              <AlertCircle className="size-8" aria-hidden="true" />
            </span>
            <CardTitle className="text-2xl">Pagamento in sospeso</CardTitle>
            <p className="mt-2 text-sm text-ink-soft">
              Il tuo pagamento non è stato elaborato. Riprovare oppure contattare l'assistenza.
            </p>
            <Link
              href="/area-paziente"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary-bright"
            >
              Torna alla dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
