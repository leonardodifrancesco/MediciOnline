import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface RatingStarsProps {
  rating: number;
  reviewCount: number;
  className?: string;
}

export function RatingStars({ rating, reviewCount, className }: RatingStarsProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const fillPercentage = Math.max(0, Math.min(1, rating - i));
          return (
            <div key={i} className="relative h-4 w-4">
              <Star className="h-4 w-4 text-border" fill="currentColor" aria-hidden="true" />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercentage * 100}%` }}
              >
                <Star className="h-4 w-4 text-accent-gold" fill="currentColor" aria-hidden="true" />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-ink-soft">
        {rating.toFixed(1)} · {reviewCount} {reviewCount === 1 ? "valutazione" : "valutazioni"}
      </p>
    </div>
  );
}
