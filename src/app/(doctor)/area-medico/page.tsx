import Link from "next/link";
import { CalendarDays, Clock, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/queries/profile";
import type { DoctorVerificationStatus } from "@/lib/types/database.types";

const STATUS_CONFIG: Record<
  DoctorVerificationStatus,
  {
    icon: typeof ShieldCheck;
    badgeClassName: string;
    cardClassName: string;
    title: string;
    text: string;
  }
> = {
  pending: {
    icon: Clock,
    badgeClassName: "bg-warning-soft text-warning",
    cardClassName: "border-warning/30 bg-warning-soft",
    title: "Profilo in revisione",
    text: "Il nostro team verificherà i tuoi dati professionali. Riceverai una email quando il profilo sarà visibile ai pazienti.",
  },
  approved: {
    icon: ShieldCheck,
    badgeClassName: "bg-success-soft text-success",
    cardClassName: "border-success/30 bg-success-soft",
    title: "Profilo verificato",
    text: "Il tuo profilo è visibile ai pazienti nei risultati di ricerca.",
  },
  rejected: {
    icon: ShieldX,
    badgeClassName: "bg-danger-soft text-danger",
    cardClassName: "border-danger/30 bg-danger-soft",
    title: "Verifica non superata",
    text: "Controlla i dettagli nella sezione Profilo e aggiorna le informazioni richieste.",
  },
  suspended: {
    icon: ShieldAlert,
    badgeClassName: "bg-danger-soft text-danger",
    cardClassName: "border-danger/30 bg-danger-soft",
    title: "Profilo sospeso",
    text: "Il tuo profilo è stato temporaneamente sospeso. Contatta l'assistenza per maggiori informazioni.",
  },
};

async function getDoctorProfile(doctorId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("doctor_profiles")
    .select("verification_status, rejected_reason")
    .eq("profile_id", doctorId)
    .single();
  return data;
}

export default async function DoctorDashboardPage() {
  const profile = await getCurrentProfile();
  const doctorProfile = await getDoctorProfile(profile.id);
  const firstName = profile.full_name.split(" ")[0];
  const status = doctorProfile?.verification_status ?? "pending";
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Bentornato, Dr. {firstName}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Qui trovi lo stato del tuo profilo e i prossimi appuntamenti.
        </p>
      </div>

      <Card className={`border ${statusConfig.cardClassName}`}>
        <div className="flex items-start gap-3">
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-full ${statusConfig.badgeClassName}`}
          >
            <StatusIcon className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-medium text-ink">{statusConfig.title}</p>
            <p className="mt-1 text-sm text-ink-soft">{statusConfig.text}</p>
            {status === "rejected" && doctorProfile?.rejected_reason && (
              <p className="mt-2 text-sm font-medium text-ink">
                Motivazione: {doctorProfile.rejected_reason}
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary-dark">
          <CalendarDays className="size-6" aria-hidden="true" />
        </span>
        <div>
          <CardTitle>Nessun appuntamento in programma</CardTitle>
          <CardDescription>
            Gli appuntamenti prenotati dai pazienti compariranno qui non appena
            il tuo profilo sarà approvato e avrai impostato la tua disponibilità.
          </CardDescription>
        </div>
        <Link
          href="/area-medico/disponibilita"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary-bright"
        >
          Imposta la disponibilità
        </Link>
      </Card>
    </div>
  );
}
