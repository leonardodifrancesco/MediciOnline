import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getDoctorBySlug } from "@/lib/queries/doctors";
import { BookingFlow } from "@/components/booking/booking-flow";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ doctorSlug: string }> }) {
  const { doctorSlug } = await params;
  const doctor = await getDoctorBySlug(doctorSlug);

  if (!doctor) {
    return { title: "Prenota una visita | MediTrova" };
  }

  return {
    title: `Prenota una visita con ${doctor.fullName} | MediTrova`,
  };
}

export default async function BookingPage({ params }: { params: Promise<{ doctorSlug: string }> }) {
  const { doctorSlug } = await params;
  const doctor = await getDoctorBySlug(doctorSlug);

  if (!doctor) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verifica che l'utente loggato sia un paziente
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "patient") {
    redirect("/area-paziente");
  }

  return (
    <div className="container-app py-8">
      <Link
        href={`/medici/${doctor.slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Torna al profilo
      </Link>

      <div className="mt-8">
        <h1 className="font-display text-2xl text-ink">Prenota una visita</h1>
        <p className="mt-1 text-sm text-ink-soft">con {doctor.fullName}</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BookingFlow doctor={doctor} patientId={user.id} />
        </div>

        <div>
          <Card className="sticky top-20 space-y-2 text-sm">
            <p className="font-medium text-ink">Dettagli medico</p>
            <p className="text-ink-soft">{doctor.fullName}</p>
            <p className="text-ink">
              Tariffa: <strong>{doctor.consultationFee.toFixed(0)}€</strong>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
