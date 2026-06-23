# MediTrova — Piattaforma di prenotazione visite mediche

MVP costruito con Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase
(Auth + PostgreSQL + Storage), Stripe, React Hook Form e Zod.

Per l'architettura completa, lo schema del database e la roadmap delle
fasi, vedi il documento di progettazione consegnato insieme a questo
repository (`progettazione-piattaforma-medici.md`).

## Stato di avanzamento

✅ **Fase 1 — Fondamenta**: setup progetto, design system Tailwind, client
Supabase (browser/server/middleware), tipi del database, middleware RBAC.

✅ **Fase 2 — Autenticazione**: registrazione paziente, registrazione medico
(con specializzazioni e creazione di `doctor_profiles`), login, logout,
reset password, callback email, dashboard segnaposto per le tre aree
(paziente / medico / admin) con guardia di ruolo e dati reali dal database.

⬜ **Fase 3 — Ricerca medici e profilo pubblico** (`/medici`, `/medici/[slug]`)
⬜ **Fase 4 — Motore di disponibilità** (regole settimanali + eccezioni)
⬜ **Fase 5 — Prenotazione e integrazione Stripe** (Checkout + Connect + webhook)
⬜ **Fase 6 — Dashboard paziente/medico complete** (storico, gestione appuntamenti)
⬜ **Fase 7 — Pannello admin completo** (verifica medici, statistiche, audit log)

Alcuni link in homepage/footer (es. `/medici`) puntano già alle pagine
previste dalle fasi successive: per ora restituiscono 404, è normale.

## Setup locale

### 1. Requisiti
- Node.js 20+
- Un progetto Supabase (gratuito): https://supabase.com/dashboard
- Un account Stripe in modalità test (necessario dalla Fase 5 in poi)

### 2. Installazione

```bash
npm install
cp .env.local.example .env.local
```

Compila `.env.local` con le chiavi del tuo progetto Supabase (Project
Settings → API) e, quando necessario, di Stripe.

### 3. Database

Nella dashboard Supabase, apri **SQL Editor** ed esegui in ordine:
1. `supabase/migrations/0001_init.sql` — crea tabelle, enum, indici, trigger e policy RLS
2. `supabase/seed.sql` — popola il catalogo delle specializzazioni

In alternativa, se usi la Supabase CLI collegata al progetto:

```bash
supabase db push
psql "$DATABASE_URL" -f supabase/seed.sql
```

### 4. Tipi del database

Il file `src/lib/types/database.types.ts` è scritto a mano sulla base dello
schema SQL. Una volta collegato il progetto reale, è consigliato rigenerarlo:

```bash
supabase gen types typescript --linked > src/lib/types/database.types.ts
```

Questo aggiunge anche i metadati di relazione (`Relationships`) che rendono
completamente type-safe le query con `select()` annidate (es. embedding di
`profiles` da `doctor_profiles`), oggi tipizzate in modo permissivo.

### 5. Primo admin

Non esiste un form pubblico per creare un account admin (scelta
intenzionale). Dopo aver registrato un utente normale, promuovilo da SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'tu@esempio.it';
```

### 6. Avvio

```bash
npm run dev
```

App disponibile su http://localhost:3000.

## Note tecniche

- **Server Actions** sono il livello applicativo primario (`src/lib/actions`);
  l'unico Route Handler "vero" è `/api/webhooks/stripe` (da implementare in
  Fase 5), perché serve accedere al body raw per verificare la firma Stripe.
- **Sicurezza a doppio livello**: il middleware (`src/middleware.ts`) blocca
  l'accesso alle aree sbagliate per ruolo; la Row Level Security in Postgres
  (vedi `supabase/migrations/0001_init.sql`) protegge i dati anche in caso di
  bypass della UI.
- **Validazione**: ogni schema Zod in `src/lib/validations` è condiviso tra
  form (client, via `react-hook-form` + `zodResolver`) e Server Action
  (server, validazione ripetuta perché il client non è una fonte fidata).
