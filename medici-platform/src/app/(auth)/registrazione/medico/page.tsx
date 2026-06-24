import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DoctorSignUpForm } from "@/components/forms/doctor-signup-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function getSpecializations() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("specializations")
    .select("id, name")
    .order("name");
  return data ?? [];
}

export default async function DoctorSignUpPage() {
  const specializations = await getSpecializations();

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Crea il tuo profilo professionale</CardTitle>
        <CardDescription>
          Dopo la registrazione il tuo profilo sarà verificato dal nostro team
          prima di diventare visibile ai pazienti.
        </CardDescription>
      </CardHeader>

      {specializations.length === 0 ? (
        <p className="rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
          Il catalogo delle specializzazioni non è ancora disponibile. Esegui il
          seed del database (<code>supabase/seed.sql</code>) e ricarica la pagina.
        </p>
      ) : (
        <DoctorSignUpForm specializations={specializations} />
      )}

      <p className="mt-6 text-center text-sm text-ink-soft">
        Hai già un account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Accedi
        </Link>
      </p>
    </Card>
  );
}
