import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-xl border bg-white px-3.5 py-2.5 text-[0.95rem] text-ink placeholder:text-ink-faint",
          "min-h-28 transition-colors focus:border-primary-bright focus:outline-none focus:ring-2 focus:ring-primary-bright/30",
          hasError ? "border-danger" : "border-border",
          "disabled:cursor-not-allowed disabled:bg-paper-dim disabled:text-ink-faint",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
