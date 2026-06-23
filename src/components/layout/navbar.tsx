import Link from "next/link";
import { Stethoscope } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-paper/90 backdrop-blur-sm">
      <div className="container-app flex h-16 items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg text-ink">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white">
            <Stethoscope className="size-5" aria-hidden="true" />
          </span>
          MediTrova
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-soft md:flex">
          <Link href="/medici" className="transition-colors hover:text-ink">
            Trova un medico
          </Link>
          <Link href="/come-funziona" className="transition-colors hover:text-ink">
            Come funziona
          </Link>
          <Link href="/per-medici" className="transition-colors hover:text-ink">
            Per i medici
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-ink-soft transition-colors hover:text-ink sm:block"
          >
            Accedi
          </Link>
          <Link
            href="/registrazione"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-bright"
          >
            Registrati
          </Link>
        </div>
      </div>
    </header>
  );
}
