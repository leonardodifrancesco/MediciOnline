"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { formatDate, formatTime, formatPrice } from "@/lib/utils/format";
import type { DoctorProfileDetail } from "@/lib/queries/doctors";

interface BookingSummaryProps {
  doctor: DoctorProfileDetail;
  slot: { start: Date; end: Date };
  patientNotes?: string;
  isLoading?: boolean;
  onConfirm: () => void;
}

export function BookingSummary({
  doctor,
  slot,
  patientNotes,
  isLoading,
  onConfirm,
}: BookingSummaryProps) {
  const slotStart = typeof slot.start === "string" ? new Date(slot.start) : slot.start;
  const slotEnd = typeof slot.end === "string" ? new Date(slot.end) : slot.end;

  const totalPrice = doctor.consultationFee;
  const platformFee = Math.round(totalPrice * 0.1 * 100) / 100;
  const doctorReceives = totalPrice - platformFee;

  return (
    <div className="space-y-4">
      <CardTitle className="text-lg">Riepilogo</CardTitle>

      <Card>
        <h4 className="font-medium text-ink">Medico</h4>
        <p className="text-sm text-ink-soft">{doctor.fullName}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {doctor.specializations.map((spec) => (
            <span
              key={spec.slug}
              className="rounded-full bg-primary-soft px-2 py-1 text-xs text-primary"
            >
              {spec.name}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <h4 className="font-medium text-ink">Data e ora</h4>
        <p className="text-sm text-ink-soft">
          {formatDate(slotStart)}
          <br />
          {formatTime(slotStart)} - {formatTime(slotEnd)}
        </p>
      </Card>

      <Card>
        <h4 className="font-medium text-ink">Modalità</h4>
        <p className="text-sm text-ink-soft">
          {doctor.consultationType === "both"
            ? "Online o in studio"
            : doctor.consultationType === "video"
              ? "Online"
              : "In studio"}
        </p>
      </Card>

      {patientNotes && (
        <Card>
          <h4 className="font-medium text-ink">Note del paziente</h4>
          <p className="text-sm text-ink-soft">{patientNotes}</p>
        </Card>
      )}

      <Card className="border-t border-border pt-4">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-soft">Tariffa medico</span>
            <span className="font-medium">{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1.5">
            <span className="text-ink">Importo totale</span>
            <span className="font-display text-lg text-ink">{formatPrice(totalPrice)}</span>
          </div>
          <p className="text-xs text-ink-faint">
            Il medico riceve {formatPrice(doctorReceives)} (commissione piattaforma:{" "}
            {formatPrice(platformFee)})
          </p>
        </div>
      </Card>

      <button
        type="button"
        onClick={onConfirm}
        disabled={isLoading}
        className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-bright disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Elaborazione..." : "Procedi al pagamento"}
      </button>
    </div>
  );
}
