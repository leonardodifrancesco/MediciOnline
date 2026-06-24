import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border bg-white px-3.5 pr-10 text-[0.95rem] text-ink",
            "transition-colors focus:border-primary-bright focus:outline-none focus:ring-2 focus:ring-primary-bright/30",
            hasError ? "border-danger" : "border-border",
            "disabled:cursor-not-allowed disabled:bg-paper-dim disabled:text-ink-faint",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
      </div>
    );
  },
);

Select.displayName = "Select";
