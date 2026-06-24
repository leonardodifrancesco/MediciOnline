export default function TermsPage() {
  return (
    <div className="container-app max-w-2xl py-16">
      <h1 className="font-display text-3xl text-ink">Termini di servizio</h1>

      <p className="mt-6 rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
        Testo segnaposto. Prima del lancio in produzione, questa pagina deve
        essere scritta con un legale: deve coprire almeno responsabilità sul
        rapporto medico-paziente (la piattaforma è un intermediario, non eroga
        prestazioni sanitarie), politiche di cancellazione e rimborso, gestione
        dei dati sanitari e requisiti specifici della normativa italiana/UE
        per servizi sanitari digitali.
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-soft">
        <p>
          MediTrova è una piattaforma che metti in contatto pazienti e medici
          per la prenotazione di visite, online o in presenza, e ne gestisce il
          pagamento. MediTrova non eroga prestazioni sanitarie ed esercita un
          ruolo di intermediazione tecnologica tra le parti.
        </p>
        <p>
          Ogni medico presente sulla piattaforma è responsabile in autonomia
          della prestazione sanitaria erogata, nel rispetto del proprio codice
          deontologico e della normativa vigente.
        </p>
      </div>
    </div>
  );
}
