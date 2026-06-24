import Link from "next/link";
import type { ReactNode } from "react";
import { LogOut, Stethoscope } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth.actions";
import { Badge } from "@/components/ui/badge";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardShellProps {
  navItems: DashboardNavItem[];
  userName: string;
  roleLabel: string;
  children: ReactNode;
}

export function DashboardShell({
  navItems,
  userName,
  roleLabel,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-paper-dim">
      <header className="sticky top-0 z-30 border-b border-border bg-paper/95 backdrop-blur-sm">
        <div className="container-app flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-display text-base text-ink">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
              <Stethoscope className="size-4" aria-hidden="true" />
            </span>
            MediTrova
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight text-ink">{userName}</p>
              <Badge variant="primary" className="mt-0.5">
                {roleLabel}
              </Badge>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                title="Esci"
                aria-label="Esci dall'account"
                className="flex size-10 items-center justify-center rounded-xl border border-border text-ink-soft transition-colors hover:border-danger hover:text-danger"
              >
                <LogOut className="size-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>

        <nav className="container-app flex gap-1 overflow-x-auto pb-3 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 font-medium text-ink-soft transition-colors hover:bg-primary-soft hover:text-primary-dark"
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="container-app py-8">{children}</main>
    </div>
  );
}
