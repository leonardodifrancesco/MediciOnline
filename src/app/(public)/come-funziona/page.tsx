import Link from "next/link";
import { Search, CalendarCheck, CreditCard, UserPlus, ClipboardCheck, Wallet } from "lucide-react";

const PATIENT_STEPS = [
  { icon: Search, title: "Cerca", text: "Filtra per specializzazione, città e modalità (online o in presenza) tra i profili dei medici verificati." },
  { icon: CalendarCheck, title: "Prenota", text: "Scegli uno degli orari realmente liberi nel calendario del medico e indica il motivo della visita." },
  { icon: CreditCard, title: "Paga online", text: "Confermi il pagamento in sicurezza al momento della prenotazione: nessuna sorpresa, nessuna fattura da gestire a parte." },
];

const DOCTOR_STEPS = [
  { icon: UserPlus, title: "Crea il profilo", text: "Inserisci specializzazioni, tariffa e biografia professionale in pochi minuti." },
  { icon: ClipboardCheck, title: "Verifica", text: "Carichi i documenti richiesti e il nostro team verifica l'iscrizione all'albo prima di pubblicare il profilo." },
  { icon: Wallet, title: "Ricevi i pagamenti", text: "Imposti la disponibilità e incassi automaticamente il compenso di ogni visita prenotata, senza solleciti." },
];

export default function HowItWorksPage() {
  return (
    <div className="container-app py-16">
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Come funziona MediTrova</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Un percorso semplice sia per chi cerca una visita sia per chi la offre.
      </p>

      <section className="mt-12">
        <h2 className="font-display text-xl text-ink">Per i pazienti</h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-3">
          {PATIENT_STEPS.map((step, index) => (
            <div key={step.title}>
              <p className="font-mono text-sm text-primary">{String(index + 1).padStart(2, "0")}</p>
              <step.icon className="mt-3 size-6 text-primary" aria-hidden="true" />
              <p className="mt-3 font-display text-lg text-ink">{step.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.text}</p>
            </div>
          ))}
        </div>
        <Link
          href="/medici"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary-bright"
        >
          Trova un medico
        </Link>
      </section>

      <section className="mt-16 border-t border-border pt-12">
        <h2 className="font-display text-xl text-ink">Per i medici</h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-3">
          {DOCTOR_STEPS.map((step, index) => (
            <div key={step.title}>
              <p className="font-mono text-sm text-primary">{String(index + 1).padStart(2, "0")}</p>
              <step.icon className="mt-3 size-6 text-primary" aria-hidden="true" />
              <p className="mt-3 font-display text-lg text-ink">{step.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.text}</p>
            </div>
          ))}
        </div>
        <Link
          href="/registrazione/medico"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary-bright"
        >
          Registra il tuo profilo
        </Link>
      </section>
    </div>
  );
}
