import Link from "next/link";
import { CalendarDays, Search } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/queries/profile";

export default async function PatientDashboardPage() {
  const profile = await getCurrentProfile();
  const firstName = profile.full_name.split(" ")[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Ciao, {firstName}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Da qui puoi cercare un medico, prenotare una visita e ritrovare i tuoi
          appuntamenti.
        </p>
      </div>

      <Card className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary-dark">
          <CalendarDays className="size-6" aria-hidden="true" />
        </span>
        <div>
          <CardTitle>Nessun appuntamento in programma</CardTitle>
          <CardDescription>
            Quando prenoti una visita, la trovi qui con tutti i dettagli e lo
            stato del pagamento.
          </CardDescription>
        </div>
        <Link
          href="/medici"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary-bright"
        >
          <Search className="size-4" aria-hidden="true" />
          Trova un medico
        </Link>
      </Card>
    </div>
  );
}
