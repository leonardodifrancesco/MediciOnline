"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label, FieldHint } from "@/components/ui/label";
import { SlotPicker } from "@/components/booking/slot-picker";
import { BookingSummary } from "@/components/booking/booking-summary";
import { createAppointment, createCheckoutSessionForAppointment } from "@/lib/actions/booking.actions";
import type { DoctorProfileDetail } from "@/lib/queries/doctors";

type BookingStep = "slot" | "notes" | "summary";

interface BookingFlowProps {
  doctor: DoctorProfileDetail;
  patientId: string;
}

export function BookingFlow({ doctor, patientId }: BookingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<BookingStep>("slot");
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [patientNotes, setPatientNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBooking() {
    if (!selectedSlot) {
      setError("Seleziona uno slot disponibile");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Crea l'appuntamento
      const appointmentResult = await createAppointment(patientId, {
        doctorId: doctor.profileId,
        scheduledStart: selectedSlot.start.toISOString(),
        scheduledEnd: selectedSlot.end.toISOString(),
        consultationType: doctor.consultationType,
        patientNotes: patientNotes || undefined,
      });

      if (!appointmentResult.success || !appointmentResult.appointmentId) {
        setError(appointmentResult.message ?? "Errore nella creazione dell'appuntamento");
        setIsProcessing(false);
        return;
      }

      // 2. Crea la Stripe Checkout Session
      const checkoutResult = await createCheckoutSessionForAppointment(
        appointmentResult.appointmentId,
      );

      if (!checkoutResult.success || !checkoutResult.checkoutUrl) {
        setError(checkoutResult.message ?? "Errore nella creazione della sessione di pagamento");
        setIsProcessing(false);
        return;
      }

      // 3. Redirect a Stripe Checkout
      window.location.href = checkoutResult.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex gap-2">
        {(["slot", "notes", "summary"] as BookingStep[]).map((s, i) => (
          <div
            key={s}
            className={`flex-1 rounded-lg h-1 ${
              step === s
                ? "bg-primary"
                : ["slot", "notes"].indexOf(step) >= i
                  ? "bg-primary-soft"
                  : "bg-border"
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">{error}</div>
      )}

      {/* Step 1: Slot selection */}
      {step === "slot" && (
        <>
          <SlotPicker
            doctorId={doctor.profileId}
            onSlotSelect={(slot) => {
              setSelectedSlot(slot);
              setStep("notes");
            }}
            isLoading={isProcessing}
          />
        </>
      )}

      {/* Step 2: Patient notes */}
      {step === "notes" && selectedSlot && (
        <Card className="space-y-4">
          <h3 className="font-medium text-ink">2. Motivo della visita (opzionale)</h3>

          <div>
            <Label htmlFor="patientNotes">Note per il medico</Label>
            <textarea
              id="patientNotes"
              value={patientNotes}
              onChange={(e) => setPatientNotes(e.target.value)}
              placeholder="Es: dolore al petto, febbre da 3 giorni, controllo routine..."
              maxLength={500}
              className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
            />
            <FieldHint>
              {patientNotes.length}/500 caratteri
            </FieldHint>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep("slot")}
              className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper-dim"
            >
              Indietro
            </button>
            <button
              type="button"
              onClick={() => setStep("summary")}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-bright"
            >
              Continua
            </button>
          </div>
        </Card>
      )}

      {/* Step 3: Summary and checkout */}
      {step === "summary" && selectedSlot && (
        <BookingSummary
          doctor={doctor}
          slot={selectedSlot}
          patientNotes={patientNotes}
          isLoading={isProcessing}
          onConfirm={handleBooking}
        />
      )}
    </div>
  );
}
