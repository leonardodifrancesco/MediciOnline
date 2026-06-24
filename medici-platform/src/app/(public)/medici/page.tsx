import { Suspense } from "react";
import { DoctorCard } from "@/components/doctors/doctor-card";
import { DoctorSearchFilters } from "@/components/doctors/doctor-search-filters";
import { searchDoctors, getAllSpecializations, DOCTORS_PER_PAGE } from "@/lib/queries/doctors";

async function DoctorsList({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const page = Math.max(1, Number(searchParams.pagina ?? 1));
  const filters = {
    specializzazione: searchParams.specializzazione ? String(searchParams.specializzazione) : undefined,
    modalita: (searchParams.modalita as "video" | "in_person" | undefined) ?? undefined,
    citta: searchParams.citta ? String(searchParams.citta) : undefined,
    prezzoMax: searchParams.prezzoMax ? Number(searchParams.prezzoMax) : undefined,
    pagina: page,
  };

  const { doctors, total } = await searchDoctors(filters);
  const totalPages = Math.ceil(total / DOCTORS_PER_PAGE);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-ink-soft">
          {total === 0 ? "Nessun medico trovato" : `${total} medic${total === 1 ? "o" : "i"} disponibil${total === 1 ? "e" : "i"}`}
        </p>
      </div>

      {doctors.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.profileId} doctor={doctor} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === page;
                const params = new URLSearchParams();
                
                // Mantieni i filtri nel link di paginazione
                if (filters.specializzazione) params.set("specializzazione", filters.specializzazione);
                if (filters.modalita) params.set("modalita", filters.modalita);
                if (filters.citta) params.set("citta", filters.citta);
                if (filters.prezzoMax) params.set("prezzoMax", String(filters.prezzoMax));
                if (pageNum > 1) params.set("pagina", String(pageNum));

                return (
                  <a
                    key={pageNum}
                    href={`/medici?${params.toString()}`}
                    className={`h-10 w-10 inline-flex items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-white font-medium"
                        : "border border-border text-ink hover:border-primary hover:text-primary"
                    }`}
                  >
                    {pageNum}
                  </a>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-border bg-paper-dim p-12 text-center">
          <p className="text-sm text-ink-soft">
            Prova a modificare i filtri o ricerca senza filtri per vedere tutti i medici.
          </p>
        </div>
      )}
    </div>
  );
}

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const specializations = await getAllSpecializations();

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink">Trova un medico</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Filtra per specializzazione, modalità, città e tariffa. Tutti i medici sono verificati.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <DoctorSearchFilters specializations={specializations} />

        <div className="lg:col-span-3">
          <Suspense fallback={<div className="text-sm text-ink-soft">Caricamento...</div>}>
            <DoctorsList searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
