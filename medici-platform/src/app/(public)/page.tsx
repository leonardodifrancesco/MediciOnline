import Link from "next/link";
import { CalendarCheck, ShieldCheck, Search, ArrowRight, Star } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Specialization } from "@/lib/types/database.types";

const FALLBACK_SPECIALIZATIONS: Pick<Specialization, "name" | "slug">[] = [
  { name: "Medicina Generale", slug: "medicina-generale" },
  { name: "Cardiologia", slug: "cardiologia" },
  { name: "Dermatologia", slug: "dermatologia" },
  { name: "Ginecologia", slug: "ginecologia" },
  { name: "Pediatria", slug: "pediatria" },
  { name: "Psichiatria", slug: "psichiatria" },
  { name: "Ortopedia", slug: "ortopedia" },
  { name: "Nutrizione", slug: "nutrizione" },
];

async function getSpecializations() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("specializations")
      .select("name, slug")
      .order("name")
      .limit(8);
    return data && data.length > 0 ? data : FALLBACK_SPECIALIZATIONS;
  } catch {
    return FALLBACK_SPECIALIZATIONS;
  }
}

export default async function LandingPage() {
  const specializations = await getSpecializations();

  return (
    <>
      {/* HERO */}
      <section className="container-app grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Visite mediche, senza attese al telefono
          </p>
          <h1 className="mt-4 text-balance font-display text-4xl leading-tight text-ink sm:text-5xl">
            Trova il medico giusto. Prenota il primo orario libero.
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-soft">
            Cerca per specializzazione, confronta i profili verificati e prenota
            online o in presenza — pagamento sicuro incluso, senza telefonate.
          </p>

          <form
            action="/medici"
            method="GET"
            className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-white p-3 shadow-soft sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 items-center gap-2 px-2">
              <Search className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
              <select
                name="specializzazione"
                defaultValue=""
                aria-label="Specializzazione"
                className="h-11 w-full border-0 bg-transparent text-[0.95rem] text-ink focus:outline-none focus:ring-0"
              >
                <option value="">Qualsiasi specializzazione</option>
                {specializations.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary-bright"
            >
              Cerca medici
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </form>

          <div className="mt-6 flex items-center gap-5 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              Albo verificato
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarCheck className="size-4 text-primary" aria-hidden="true" />
              Conferma immediata
            </span>
          </div>
        </div>

        {/* Elemento "firma": una pila di slot di prenotazione reali, non un'illustrazione generica */}
        <div className="relative mx-auto h-80 w-full max-w-sm md:h-96">
          <article className="absolute left-0 top-6 w-72 -rotate-3 rounded-2xl border border-border bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="font-display text-base text-ink">Dr.ssa Elena Conti</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
                <span className="size-1.5 rounded-full bg-success" /> Oggi
              </span>
            </div>
            <p className="text-sm text-ink-soft">Dermatologia · Online</p>
            <p className="mt-3 font-mono text-sm text-primary-dark">16:30 · 30 min</p>
          </article>

          <article className="absolute left-12 top-32 w-72 rotate-2 rounded-2xl border border-border bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="font-display text-base text-ink">Dr. Marco Ferrari</p>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-gold">
                <Star className="size-3.5 fill-current" /> 4.9
              </span>
            </div>
            <p className="text-sm text-ink-soft">Cardiologia · Studio a Roma</p>
            <p className="mt-3 font-mono text-sm text-primary-dark">Gio 25 · 09:00</p>
          </article>

          <article className="absolute left-2 top-60 w-72 -rotate-1 rounded-2xl border border-border bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="font-display text-base text-ink">Dr.ssa Giulia Rossi</p>
              <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary-dark">
                Confermato
              </span>
            </div>
            <p className="text-sm text-ink-soft">Pediatria · Online</p>
            <p className="mt-3 font-mono text-sm text-primary-dark">Lun 29 · 11:15</p>
          </article>
        </div>
      </section>

      {/* COME FUNZIONA */}
      <section className="border-t border-border bg-paper-dim py-20">
        <div className="container-app">
          <h2 className="font-display text-3xl text-ink">Come funziona</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Cerca",
                text: "Filtra per specializzazione, città e modalità (online o in presenza) e confronta i profili.",
              },
              {
                step: "02",
                title: "Prenota",
                text: "Scegli un orario tra quelli realmente liberi nel calendario del medico e conferma il motivo della visita.",
              },
              {
                step: "03",
                title: "Consulta",
                text: "Paghi online in sicurezza al momento della prenotazione e ricevi la conferma immediata.",
              },
            ].map((item) => (
              <div key={item.step}>
                <p className="font-mono text-sm text-primary">{item.step}</p>
                <p className="mt-2 font-display text-xl text-ink">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIALIZZAZIONI */}
      <section className="py-20">
        <div className="container-app">
          <h2 className="font-display text-3xl text-ink">Cerca per specializzazione</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 md:grid-cols-4">
            {specializations.map((s) => (
              <Link
                key={s.slug}
                href={`/medici?specializzazione=${s.slug}`}
                className="rounded-xl border border-border bg-white px-4 py-3.5 text-sm font-medium text-ink transition-colors hover:border-primary-bright hover:text-primary-dark"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA PER I MEDICI */}
      <section className="bg-primary-dark py-16">
        <div className="container-app flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl text-white sm:text-3xl">
              Sei un medico? Porta la tua attività online.
            </h2>
            <p className="mt-2 max-w-lg text-primary-soft">
              Calendario digitale, prenotazioni e pagamenti gestiti per te: tu pensi
              alla visita, noi al resto.
            </p>
          </div>
          <Link
            href="/registrazione/medico"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-primary-dark transition-colors hover:bg-paper"
          >
            Registra il tuo profilo
          </Link>
        </div>
      </section>
    </>
  );
}
