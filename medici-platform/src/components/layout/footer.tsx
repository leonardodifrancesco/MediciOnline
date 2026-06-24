import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-paper-dim">
      <div className="container-app grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <p className="font-display text-lg text-ink">MediTrova</p>
          <p className="mt-2 max-w-xs text-sm text-ink-soft">
            La piattaforma per trovare e prenotare visite con medici verificati,
            online o in presenza.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">Pazienti</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li><Link href="/medici" className="hover:text-ink">Trova un medico</Link></li>
            <li><Link href="/come-funziona" className="hover:text-ink">Come funziona</Link></li>
            <li><Link href="/registrazione/paziente" className="hover:text-ink">Crea un account</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">Medici</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li><Link href="/per-medici" className="hover:text-ink">Perché iscriversi</Link></li>
            <li><Link href="/registrazione/medico" className="hover:text-ink">Registra il tuo profilo</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">Legale</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li><Link href="/termini" className="hover:text-ink">Termini di servizio</Link></li>
            <li><Link href="/privacy" className="hover:text-ink">Privacy</Link></li>
          </ul>
        </div>
      </div>

      <div className="container-app border-t border-border py-6 text-xs text-ink-faint">
        © {new Date().getFullYear()} MediTrova. Tutti i diritti riservati.
      </div>
    </footer>
  );
}
