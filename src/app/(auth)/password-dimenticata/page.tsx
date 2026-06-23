import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RequestPasswordResetForm } from "@/components/forms/request-password-reset-form";

export default function RequestPasswordResetPage() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Password dimenticata?</CardTitle>
        <CardDescription>
          Inserisci l&apos;email del tuo account: ti mandiamo un link per
          impostarne una nuova.
        </CardDescription>
      </CardHeader>

      <RequestPasswordResetForm />

      <p className="mt-6 text-center text-sm text-ink-soft">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Torna al login
        </Link>
      </p>
    </Card>
  );
}
