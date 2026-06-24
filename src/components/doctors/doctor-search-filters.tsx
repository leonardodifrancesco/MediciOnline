"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Specialization } from "@/lib/types/database.types";

interface SearchFiltersProps {
  specializations: Specialization[];
}

export function DoctorSearchFilters({ specializations }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    const specializzazione = formData.get("specializzazione") as string;
    const modalita = formData.get("modalita") as string;
    const citta = formData.get("citta") as string;
    const prezzoMax = formData.get("prezzoMax") as string;

    if (specializzazione) params.set("specializzazione", specializzazione);
    if (modalita) params.set("modalita", modalita);
    if (citta) params.set("citta", citta);
    if (prezzoMax) params.set("prezzoMax", prezzoMax);

    router.push(`/medici?${params.toString()}`);
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSearch} className="space-y-4 rounded-xl border border-border bg-paper-dim p-5">
      <h3 className="font-medium text-ink">Filtra la ricerca</h3>

      <div>
        <Label htmlFor="specializzazione">Specializzazione</Label>
        <Select
          id="specializzazione"
          name="specializzazione"
          defaultValue={searchParams.get("specializzazione") ?? ""}
        >
          <option value="">Tutte</option>
          {specializations.map((spec) => (
            <option key={spec.id} value={spec.slug}>
              {spec.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="modalita">Modalità</Label>
        <Select id="modalita" name="modalita" defaultValue={searchParams.get("modalita") ?? ""}>
          <option value="">Tutte</option>
          <option value="video">Online</option>
          <option value="in_person">In studio</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="citta">Città</Label>
        <Input
          id="citta"
          name="citta"
          type="text"
          placeholder="Es: Milano, Roma..."
          defaultValue={searchParams.get("citta") ?? ""}
        />
      </div>

      <div>
        <Label htmlFor="prezzoMax">Tariffa massima</Label>
        <Input
          id="prezzoMax"
          name="prezzoMax"
          type="number"
          placeholder="Es: 100"
          min="0"
          step="5"
          defaultValue={searchParams.get("prezzoMax") ?? ""}
        />
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        Cerca
      </Button>
    </form>
  );
}
