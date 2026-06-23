import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PatientSignUpForm } from "@/components/forms/patient-signup-form";

export default function PatientSignUpPage() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Crea il tuo account paziente</CardTitle>
        <CardDescription>
          Ti servirà per prenotare visite e ritrovare il tuo storico appuntamenti.
        </CardDescription>
      </CardHeader>

      <PatientSignUpForm />

      <p className="mt-6 text-center text-sm text-ink-soft">
        Hai già un account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Accedi
        </Link>
      </p>
    </Card>
  );
}
