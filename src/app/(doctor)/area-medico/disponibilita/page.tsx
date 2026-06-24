import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { AvailabilityRulesEditor } from "@/components/availability/availability-rules-editor";
import { AvailabilityExceptionsEditor } from "@/components/availability/availability-exceptions-editor";
import { getDoctorAvailabilityRules } from "@/lib/queries/availability";
import { getCurrentProfile } from "@/lib/queries/profile";

export default async function AvailabilityPage() {
  const profile = await getCurrentProfile();
  const rules = await getDoctorAvailabilityRules(profile.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-ink">Gestione disponibilità</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Definisci gli orari di apertura settimanali e le eccezioni (ferie, aperture extra).
          I pazienti possono prenotare solo negli slot che lasci disponibili.
        </p>
      </div>

      <AvailabilityRulesEditor initialRules={rules} doctorId={profile.id} />

      <AvailabilityExceptionsEditor doctorId={profile.id} />

      <Card>
        <CardTitle>Come funziona</CardTitle>
        <CardDescription className="mt-3">
          <ul className="space-y-2 text-sm leading-relaxed">
            <li>
              <strong>Regole settimanali</strong> definiscono gli orari ricorrenti di apertura
              (es: lunedì–venerdì 9:00–13:00 e 14:30–18:00). Gli slot sono generati
              automaticamente nei giorni selezionati.
            </li>
            <li>
              <strong>Eccezioni</strong> permettono di bloccare una giornata (ferie) oppure
              aggiungere un orario straordinario in una data specifica.
            </li>
            <li>
              Durante la prenotazione, i pazienti vedono solo gli slot non occupati e non
              bloccati. Il pagamento blocca immediatamente lo slot.
            </li>
          </ul>
        </CardDescription>
      </Card>
    </div>
  );
}
