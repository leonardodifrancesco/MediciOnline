import Link from "next/link";
import { Users, Stethoscope, Clock, CalendarDays, ArrowRight } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function getStats() {
  const supabase = await createServerSupabaseClient();

  const [{ count: patients }, { count: doctors }, { count: pendingDoctors }, { count: appointments }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "patient"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "doctor"),
      supabase
        .from("doctor_profiles")
        .select("*", { count: "exact", head: true })
        .eq("verification_status", "pending"),
      supabase.from("appointments").select("*", { count: "exact", head: true }),
    ]);

  const { data: pendingList } = await supabase
    .from("doctor_profiles")
    .select("profile_id, slug, license_number, created_at, profiles(full_name, email)")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: true })
    .limit(5);

  return {
    patients: patients ?? 0,
    doctors: doctors ?? 0,
    pendingDoctors: pendingDoctors ?? 0,
    appointments: appointments ?? 0,
    pendingList: pendingList ?? [],
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Pazienti registrati", value: stats.patients, icon: Users },
    { label: "Medici registrati", value: stats.doctors, icon: Stethoscope },
    { label: "Medici da verificare", value: stats.pendingDoctors, icon: Clock },
    { label: "Appuntamenti totali", value: stats.appointments, icon: CalendarDays },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-ink">Pannello amministrativo</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Panoramica della piattaforma e medici in attesa di verifica.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="flex items-center gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-dark">
              <card.icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-2xl text-ink">{card.value}</p>
              <p className="text-sm text-ink-soft">{card.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle>Medici in attesa di verifica</CardTitle>
        <CardDescription>
          I profili restano invisibili ai pazienti finché non vengono approvati.
        </CardDescription>

        {stats.pendingList.length === 0 ? (
          <p className="mt-6 text-sm text-ink-soft">
            Nessuna richiesta in attesa. Tutto sotto controllo.
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-border">
            {stats.pendingList.map((doctor) => {
              const doctorProfile = Array.isArray(doctor.profiles)
                ? doctor.profiles[0]
                : doctor.profiles;
              return (
                <li key={doctor.profile_id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium text-ink">{doctorProfile?.full_name ?? "—"}</p>
                    <p className="text-sm text-ink-soft">
                      Albo {doctor.license_number} · {doctorProfile?.email}
                    </p>
                  </div>
                  <Link
                    href={`/admin/medici/${doctor.profile_id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    Verifica
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
