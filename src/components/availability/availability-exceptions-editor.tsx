"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label, FieldHint } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createAvailabilityExceptionAction, deleteAvailabilityExceptionAction } from "@/lib/actions/availability.actions";
import { getDoctorAvailabilityExceptions } from "@/lib/queries/availability";
import type { AvailabilityException } from "@/lib/types/database.types";

interface AvailabilityExceptionsEditorProps {
  doctorId: string;
}

export function AvailabilityExceptionsEditor({ doctorId }: AvailabilityExceptionsEditorProps) {
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const [formData, setFormData] = useState({
    exceptionDate: "",
    isAvailable: false,
    startTime: "09:00",
    endTime: "13:00",
    reason: "",
  });

  useEffect(() => {
    async function fetchExceptions() {
      const data = await getDoctorAvailabilityExceptions(doctorId);
      // Filtra solo le eccezioni future (a partire da oggi)
      const today = new Date().toISOString().split("T")[0];
      const filtered = data.filter((e) => e.exception_date >= today);
      setExceptions(filtered);
      setIsFetching(false);
    }
    fetchExceptions();
  }, [doctorId]);

  async function handleAddException(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    const result = await createAvailabilityExceptionAction({
      exceptionDate: formData.exceptionDate,
      isAvailable: formData.isAvailable,
      startTime: formData.isAvailable ? formData.startTime : undefined,
      endTime: formData.isAvailable ? formData.endTime : undefined,
      reason: formData.reason || undefined,
    });

    if (result.success) {
      const newException: AvailabilityException = {
        id: `temp-${Date.now()}`,
        doctor_id: doctorId,
        exception_date: formData.exceptionDate,
        is_available: formData.isAvailable,
        start_time: formData.isAvailable ? formData.startTime : null,
        end_time: formData.isAvailable ? formData.endTime : null,
        reason: formData.reason || null,
        created_at: new Date().toISOString(),
      };
      setExceptions([...exceptions, newException].sort((a, b) => a.exception_date.localeCompare(b.exception_date)));
      setFormData({
        exceptionDate: "",
        isAvailable: false,
        startTime: "09:00",
        endTime: "13:00",
        reason: "",
      });
    }

    setFeedback({ ok: result.success, message: result.message ?? "" });
    setIsLoading(false);
  }

  async function handleDeleteException(exceptionId: string) {
    if (!confirm("Elimina questa eccezione?")) return;

    setIsLoading(true);
    const result = await deleteAvailabilityExceptionAction(exceptionId);

    if (result.success) {
      setExceptions(exceptions.filter((e) => e.id !== exceptionId));
    }

    setFeedback({ ok: result.success, message: result.message ?? "" });
    setIsLoading(false);
  }

  if (isFetching) {
    return <Card><p className="text-sm text-ink-soft">Caricamento...</p></Card>;
  }

  return (
    <Card>
      <CardTitle>Eccezioni</CardTitle>

      {feedback && (
        <p
          className={`mt-4 rounded-xl px-4 py-2 text-sm ${
            feedback.ok
              ? "bg-success-soft text-success"
              : "bg-danger-soft text-danger"
          }`}
        >
          {feedback.message}
        </p>
      )}

      {/* Elenco eccezioni attuali */}
      {exceptions.length > 0 && (
        <div className="mt-6 space-y-3 border-t border-border pt-6">
          {exceptions.map((exception) => (
            <div
              key={exception.id}
              className="flex items-start justify-between gap-2 rounded-lg bg-paper-dim px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-ink">{exception.exception_date}</p>
                <p className="text-xs text-ink-soft">
                  {exception.is_available
                    ? `Apertura straordinaria: ${exception.start_time}–${exception.end_time}`
                    : "Giornata bloccata (ferie)"}
                  {exception.reason && ` · ${exception.reason}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteException(exception.id)}
                disabled={isLoading}
                className="flex items-center gap-1 text-danger hover:underline disabled:opacity-50 mt-1"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Form per aggiungere un'eccezione */}
      <form onSubmit={handleAddException} className="mt-6 space-y-4 border-t border-border pt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="exceptionDate">Data</Label>
            <Input
              id="exceptionDate"
              type="date"
              value={formData.exceptionDate}
              onChange={(e) => setFormData({ ...formData, exceptionDate: e.target.value })}
              required
            />
            <FieldHint>Seleziona una data nel futuro</FieldHint>
          </div>

          <div className="sm:col-span-2">
            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="h-4 w-4"
              />
              Apertura straordinaria (altrimenti: giornata bloccata)
            </Label>
          </div>

          {formData.isAvailable && (
            <>
              <div>
                <Label htmlFor="exceptionStartTime">Inizio (HH:mm)</Label>
                <Input
                  id="exceptionStartTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="exceptionEndTime">Fine (HH:mm)</Label>
                <Input
                  id="exceptionEndTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="sm:col-span-2">
            <Label htmlFor="reason">Motivo (opzionale)</Label>
            <Input
              id="reason"
              type="text"
              placeholder="Es: Ferie, Convegno medico..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
          <Plus className="mr-2 size-4" aria-hidden="true" />
          Aggiungi eccezione
        </Button>
      </form>
    </Card>
  );
}
