import Link from "next/link";
import { User, Stethoscope as DoctorIcon, ArrowRight } from "lucide-react";

export default function RegistrationChoicePage() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="text-center">
        <h1 className="font-display text-2xl text-ink">Crea il tuo account</h1>
        <p className="mt-1 text-sm text-ink-soft">Scegli come vuoi usare MediTrova</p>
      </div>

      <Link
        href="/registrazione/paziente"
        className="flex items-center gap-4 rounded-2xl border border-border bg-white p-5 shadow-card transition-colors hover:border-primary-bright"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-dark">
          <User className="size-5" aria-hidden="true" />
        </span>
        <span className="flex-1">
          <span className="block font-medium text-ink">Sono un paziente</span>
          <span className="block text-sm text-ink-soft">Cerco un medico e voglio prenotare una visita</span>
        </span>
        <ArrowRight className="size-4 text-ink-faint" aria-hidden="true" />
      </Link>

      <Link
        href="/registrazione/medico"
        className="flex items-center gap-4 rounded-2xl border border-border bg-white p-5 shadow-card transition-colors hover:border-primary-bright"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-dark">
          <DoctorIcon className="size-5" aria-hidden="true" />
        </span>
        <span className="flex-1">
          <span className="block font-medium text-ink">Sono un medico</span>
          <span className="block text-sm text-ink-soft">Voglio creare il mio profilo professionale</span>
        </span>
        <ArrowRight className="size-4 text-ink-faint" aria-hidden="true" />
      </Link>

      <p className="text-center text-sm text-ink-soft">
        Hai già un account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Accedi
        </Link>
      </p>
    </div>
  );
}
