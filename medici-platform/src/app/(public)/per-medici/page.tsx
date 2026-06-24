import Link from "next/link";
import { CalendarClock, ShieldCheck, Wallet, Users } from "lucide-react";

const BENEFITS = [
  {
    icon: CalendarClock,
    title: "Calendario sempre sotto controllo",
    text: "Imposti tu gli orari disponibili: i pazienti possono prenotare solo gli slot che hai aperto.",
  },
  {
    icon: Wallet,
    title: "Pagamenti automatici",
    text: "Il compenso della visita viene accreditato direttamente, senza solleciti né gestione di ricevute a parte.",
  },
  {
    icon: ShieldCheck,
    title: "Profilo verificato",
    text: "La verifica dell'albo dà ai pazienti la sicurezza di scegliere un professionista controllato.",
  },
  {
    icon: Users,
    title: "Nuovi pazienti",
    text: "Il tuo profilo è visibile a chi cerca la tua specializzazione nella tua zona o online.",
  },
];

export default function ForDoctorsPage() {
  return (
    <div>
      <section className="bg-primary-dark py-20 text-white">
        <div className="container-app">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-soft">
            Per i professionisti della salute
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl leading-tight">
            Porta la tua attività online, senza cambiare il modo in cui lavori.
          </h1>
          <p className="mt-4 max-w-xl text-primary-soft">
            Calendario, prenotazioni e pagamenti gestiti per te. Tu pensi alla
            visita, noi al resto.
          </p>
          <Link
            href="/registrazione/medico"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-primary-dark transition-colors hover:bg-paper"
          >
            Registra il tuo profilo
          </Link>
        </div>
      </section>

      <section className="container-app py-16">
        <div className="grid gap-8 sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-dark">
                <benefit.icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-lg text-ink">{benefit.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{benefit.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
