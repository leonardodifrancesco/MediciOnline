import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoginForm } from "@/components/forms/login-form";

const ERROR_MESSAGES: Record<string, string> = {
  link_scaduto: "Il link non è più valido. Accedi oppure richiedi una nuova email.",
  link_non_valido: "Il link utilizzato non è valido.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Accedi al tuo account</CardTitle>
        <CardDescription>
          Pazienti e medici accedono dalla stessa pagina: ti reindirizziamo
          automaticamente alla tua area.
        </CardDescription>
      </CardHeader>

      {error && ERROR_MESSAGES[error] && (
        <p className="mb-4 rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
          {ERROR_MESSAGES[error]}
        </p>
      )}

      <LoginForm />

      <div className="mt-6 space-y-2 text-center text-sm text-ink-soft">
        <p>
          <Link href="/password-dimenticata" className="font-medium text-primary hover:underline">
            Hai dimenticato la password?
          </Link>
        </p>
        <p>
          Non hai un account?{" "}
          <Link href="/registrazione" className="font-medium text-primary hover:underline">
            Registrati
          </Link>
        </p>
      </div>
    </Card>
  );
}
