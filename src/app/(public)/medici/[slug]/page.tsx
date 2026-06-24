import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Globe, Languages, Star } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/doctors/rating-stars";
import { getDoctorBySlug, getDoctorReviews } from "@/lib/queries/doctors";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function getAuthUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);

  if (!doctor) {
    return { title: "Medico non trovato | MediTrova" };
  }

  return {
    title: `${doctor.fullName} - ${doctor.specializations.map((s) => s.name).join(", ")} | MediTrova`,
    description: doctor.bio?.slice(0, 160),
  };
}

export default async function DoctorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);
  const authUser = await getAuthUser();

  if (!doctor) {
    notFound();
  }

  const reviews = await getDoctorReviews(doctor.profileId);

  const modalitaLabel =
    doctor.consultationType === "both"
      ? "Online e in studio"
      : doctor.consultationType === "video"
        ? "Online"
        : "In studio";

  const bookingUrl = authUser ? `/area-paziente/prenota/${slug}` : `/login?redirectTo=/area-paziente/prenota/${slug}`;

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <Link
          href="/medici"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          ← Torna alla ricerca
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h1 className="font-display text-2xl text-ink">{doctor.fullName}</h1>
            <p className="mt-1 text-sm text-ink-soft">
              {doctor.yearsExperience ? `${doctor.yearsExperience} anni di esperienza` : "Medico"}
            </p>

            {doctor.specializations.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {doctor.specializations.map((spec) => (
                  <Badge key={spec.slug} variant="secondary">
                    {spec.name}
                  </Badge>
                ))}
              </div>
            )}

            <RatingStars
              rating={doctor.averageRating}
              reviewCount={doctor.totalReviews}
              className="mt-4"
            />

            <div className="mt-6 space-y-3 border-t border-border pt-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Globe className="size-3" aria-hidden="true" />
                </span>
                {modalitaLabel}
              </div>

              {doctor.city && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <MapPin className="size-3" aria-hidden="true" />
                  </span>
                  {doctor.city}
                  {doctor.address && ` · ${doctor.address}`}
                </div>
              )}

              {doctor.languages.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <Languages className="size-3" aria-hidden="true" />
                  </span>
                  {doctor.languages.join(", ")}
                </div>
              )}
            </div>
          </Card>

          {doctor.bio && (
            <Card>
              <CardTitle>Presentazione</CardTitle>
              <p className="mt-3 leading-relaxed text-ink-soft">{doctor.bio}</p>
            </Card>
          )}

          {reviews.length > 0 && (
            <Card>
              <CardTitle>Valutazioni</CardTitle>
              <CardDescription>Ultimi {reviews.length} commenti dei pazienti</CardDescription>

              <div className="mt-6 space-y-4 divide-y divide-border">
                {reviews.map((review) => (
                  <div key={review.id} className="pt-4 first:pt-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-ink">{review.reviewerLabel}</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating
                                ? "fill-accent-gold text-accent-gold"
                                : "fill-border text-border"
                            }`}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20 flex flex-col gap-4">
            <div>
              <p className="text-sm text-ink-soft">Tariffa della visita</p>
              <p className="font-display text-3xl text-ink">€{doctor.consultationFee.toFixed(0)}</p>
            </div>

            <Link
              href={bookingUrl}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary-bright"
            >
              <CalendarDays className="mr-2 size-4" aria-hidden="true" />
              Prenota una visita
            </Link>

            <p className="text-xs text-ink-soft">
              Il pagamento è effettuato in sicurezza al momento della prenotazione.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
