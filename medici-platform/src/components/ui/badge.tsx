import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "neutral" | "success" | "warning" | "danger" | "primary";

const variantStyles: Record<Variant, string> = {
  neutral: "bg-paper-dim text-ink-soft",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  primary: "bg-primary-soft text-primary-dark",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
