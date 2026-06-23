import Link from "next/link";
import { Stethoscope } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary-dark">
        <Stethoscope className="size-6" aria-hidden="true" />
      </span>
      <h1 className="font-display text-3xl text-ink">Pagina non trovata</h1>
      <p className="max-w-sm text-sm text-ink-soft">
        La pagina che cerchi non esiste o è stata spostata. Verifica l&apos;indirizzo
        oppure torna alla home.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary-bright"
      >
        Torna alla home
      </Link>
    </div>
  );
}
