import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl border bg-white px-3.5 text-[0.95rem] text-ink placeholder:text-ink-faint",
          "transition-colors focus:border-primary-bright focus:outline-none focus:ring-2 focus:ring-primary-bright/30",
          hasError ? "border-danger" : "border-border",
          "disabled:cursor-not-allowed disabled:bg-paper-dim disabled:text-ink-faint",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
