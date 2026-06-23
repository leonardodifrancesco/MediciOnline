import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NewPasswordForm } from "@/components/forms/new-password-form";

export default function ResetPasswordPage() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Imposta una nuova password</CardTitle>
        <CardDescription>
          Scegli una nuova password per il tuo account MediTrova.
        </CardDescription>
      </CardHeader>

      <NewPasswordForm />
    </Card>
  );
}
