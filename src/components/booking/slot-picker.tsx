"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { calculateAvailableSlots } from "@/lib/queries/availability";
import { formatDate, formatTime } from "@/lib/utils/format";

interface SlotPickerProps {
  doctorId: string;
  onSlotSelect: (slot: { start: Date; end: Date }) => void;
  isLoading?: boolean;
}

export function SlotPicker({ doctorId, onSlotSelect, isLoading }: SlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<Array<{ start: Date; end: Date }>>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carica gli slot quando cambia la data selezionata
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    setIsLoadingSlots(true);
    setError(null);

    (async () => {
      try {
        const [year, month, day] = selectedDate.split("-").map(Number);
        const startDate = new Date(year, month - 1, day);
        const endDate = new Date(year, month - 1, day + 1);

        const slots = await calculateAvailableSlots(doctorId, {
          from: startDate,
          to: endDate,
        });

        setAvailableSlots(slots);
      } catch (err) {
        setError("Errore nel caricamento degli slot disponibili");
        console.error(err);
      } finally {
        setIsLoadingSlots(false);
      }
    })();
  }, [selectedDate, doctorId]);

  // Data minima: domani
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Data massima: fra 30 giorni
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  return (
    <Card className="space-y-4">
      <h3 className="font-medium text-ink">1. Scegli data e ora</h3>

      <div>
        <Label htmlFor="date">Data</Label>
        <input
          id="date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={minDate}
          max={maxDateStr}
          className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {selectedDate && (
        <>
          {error && (
            <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>
          )}

          {isLoadingSlots && <p className="text-sm text-ink-soft">Caricamento slot...</p>}

          {availableSlots.length === 0 && !isLoadingSlots && (
            <p className="text-sm text-ink-soft">
              Nessuno slot disponibile per questa data. Scegliene un'altra.
            </p>
          )}

          {availableSlots.length > 0 && (
            <div>
              <Label>Ora</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.start.getTime()}
                    type="button"
                    onClick={() => onSlotSelect(slot)}
                    disabled={isLoading}
                    className="rounded-lg border border-border bg-paper px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-primary hover:bg-primary-soft disabled:opacity-50"
                  >
                    {formatTime(slot.start)} - {formatTime(slot.end)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
