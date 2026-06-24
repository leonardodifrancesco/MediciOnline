export default function PrivacyPage() {
  return (
    <div className="container-app max-w-2xl py-16">
      <h1 className="font-display text-3xl text-ink">Informativa sulla privacy</h1>

      <p className="mt-6 rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
        Testo segnaposto. Trattando dati sanitari (categoria particolare ai
        sensi dell&apos;art. 9 GDPR), questa informativa deve essere redatta con
        un DPO/legale: deve indicare base giuridica del trattamento, tempi di
        conservazione, eventuale ruolo dei medici come titolari autonomi del
        trattamento per i dati clinici, e le misure di sicurezza adottate
        (inclusa la configurazione delle policy RLS su Supabase).
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-soft">
        <p>
          Raccogliamo i dati strettamente necessari a gestire account,
          prenotazioni e pagamenti: dati anagrafici e di contatto, dati
          relativi agli appuntamenti, dati di pagamento (gestiti da Stripe, che
          non condivide con noi i dati completi della carta).
        </p>
        <p>
          I dati dei pazienti sono accessibili solo al paziente stesso, al
          medico con cui ha un appuntamento e al personale autorizzato per la
          verifica degli account, secondo le policy di sicurezza a livello di
          database.
        </p>
      </div>
    </div>
  );
}
