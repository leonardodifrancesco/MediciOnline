"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createAvailabilityRuleAction, deleteAvailabilityRuleAction } from "@/lib/actions/availability.actions";
import type { AvailabilityRule } from "@/lib/types/database.types";
import { WEEKDAY_NAMES } from "@/lib/queries/availability";

interface AvailabilityRulesEditorProps {
  initialRules: AvailabilityRule[];
  doctorId: string;
}

export function AvailabilityRulesEditor({ initialRules, doctorId }: AvailabilityRulesEditorProps) {
  const [rules, setRules] = useState(initialRules);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const [formData, setFormData] = useState({
    weekday: "1",
    startTime: "09:00",
    endTime: "13:00",
    slotDurationMinutes: "30",
  });

  async function handleAddRule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    const result = await createAvailabilityRuleAction({
      weekday: Number(formData.weekday),
      startTime: formData.startTime,
      endTime: formData.endTime,
      slotDurationMinutes: Number(formData.slotDurationMinutes),
    });

    if (result.success) {
      // Ricaria le regole dal server (per evitare state di sync)
      // Per semplicità, aggiungiamo una regola localmente con un placeholder id
      const newRule: AvailabilityRule = {
        id: `temp-${Date.now()}`,
        doctor_id: doctorId,
        weekday: Number(formData.weekday),
        start_time: formData.startTime,
        end_time: formData.endTime,
        slot_duration_minutes: Number(formData.slotDurationMinutes),
        is_active: true,
        created_at: new Date().toISOString(),
      };
      setRules([...rules, newRule]);
      setFormData({ weekday: "1", startTime: "09:00", endTime: "13:00", slotDurationMinutes: "30" });
    }

    setFeedback({ ok: result.success, message: result.message ?? "" });
    setIsLoading(false);
  }

  async function handleDeleteRule(ruleId: string) {
    if (!confirm("Elimina questa regola?")) return;

    setIsLoading(true);
    const result = await deleteAvailabilityRuleAction(ruleId);

    if (result.success) {
      setRules(rules.filter((r) => r.id !== ruleId));
    }

    setFeedback({ ok: result.success, message: result.message ?? "" });
    setIsLoading(false);
  }

  const rulesByWeekday = rules.reduce(
    (acc, rule) => {
      if (!acc[rule.weekday]) acc[rule.weekday] = [];
      acc[rule.weekday].push(rule);
      return acc;
    },
    {} as Record<number, AvailabilityRule[]>,
  );

  return (
    <Card>
      <CardTitle>Regole settimanali ricorrenti</CardTitle>

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

      {/* Elenco regole attuali */}
      {rules.length > 0 && (
        <div className="mt-6 space-y-3 border-t border-border pt-6">
          {Array.from({ length: 7 }).map((_, weekday) => {
            const weekdayRules = rulesByWeekday[weekday] ?? [];
            if (weekdayRules.length === 0) return null;

            return (
              <div key={weekday} className="flex flex-col gap-2">
                <p className="font-medium text-ink">{WEEKDAY_NAMES[weekday]}</p>
                {weekdayRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-paper-dim px-3 py-2 text-sm"
                  >
                    <span className="text-ink">
                      {rule.start_time}–{rule.end_time} · slot da {rule.slot_duration_minutes}
                      min
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.id)}
                      disabled={isLoading}
                      className="flex items-center gap-1 text-danger hover:underline disabled:opacity-50"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Elimina
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Form per aggiungere una regola */}
      <form onSubmit={handleAddRule} className="mt-6 space-y-4 border-t border-border pt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="weekday">Giorno della settimana</Label>
            <Select
              id="weekday"
              value={formData.weekday}
              onChange={(e) => setFormData({ ...formData, weekday: e.target.value })}
            >
              {Array.from({ length: 7 }).map((_, i) => (
                <option key={i} value={String(i)}>
                  {WEEKDAY_NAMES[i]}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="slotDuration">Durata slot (minuti)</Label>
            <Select
              id="slotDuration"
              value={formData.slotDurationMinutes}
              onChange={(e) => setFormData({ ...formData, slotDurationMinutes: e.target.value })}
            >
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
              <option value="60">60</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="startTime">Inizio (HH:mm)</Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="endTime">Fine (HH:mm)</Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
          </div>
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
          <Plus className="mr-2 size-4" aria-hidden="true" />
          Aggiungi regola
        </Button>
      </form>
    </Card>
  );
}
