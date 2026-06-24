import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/doctors/rating-stars";
import type { DoctorCardData } from "@/lib/queries/doctors";

export function DoctorCard({ doctor }: { doctor: DoctorCardData }) {
  const modalitaLabel =
    doctor.consultationType === "both"
      ? "Online e in studio"
      : doctor.consultationType === "video"
        ? "Online"
        : "In studio";

  return (
    <Link href={`/medici/${doctor.slug}`}>
      <Card className="group h-full transition-all hover:shadow-card">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-ink group-hover:text-primary">{doctor.fullName}</h3>
              <p className="text-xs text-ink-soft">
                {doctor.yearsExperience ? `${doctor.yearsExperience} anni di esperienza` : "Medico"}
              </p>
            </div>
          </div>

          {doctor.specializations.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {doctor.specializations.slice(0, 2).map((spec) => (
                <Badge key={spec.slug} variant="secondary" className="text-xs">
                  {spec.name}
                </Badge>
              ))}
              {doctor.specializations.length > 2 && (
                <span className="text-xs text-ink-faint">
                  +{doctor.specializations.length - 2}
                </span>
              )}
            </div>
          )}

          <div className="space-y-1.5 border-t border-border pt-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-ink">
                €{doctor.consultationFee.toFixed(0)}/visita
              </span>
              <span className="text-xs text-ink-soft">{modalitaLabel}</span>
            </div>
            {doctor.city && <p className="text-xs text-ink-soft">{doctor.city}</p>}
          </div>

          <RatingStars
            rating={doctor.averageRating}
            reviewCount={doctor.totalReviews}
            className="pt-1.5"
          />
        </div>
      </Card>
    </Link>
  );
}
