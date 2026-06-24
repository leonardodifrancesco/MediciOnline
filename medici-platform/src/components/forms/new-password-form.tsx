"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newPasswordSchema, type NewPasswordInput } from "@/lib/validations/auth.schema";
import { updatePasswordAction } from "@/lib/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function NewPasswordForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordInput>({ resolver: zodResolver(newPasswordSchema) });

  async function onSubmit(values: NewPasswordInput) {
    setServerError(null);
    setIsSubmitting(true);
    const result = await updatePasswordAction(values);
    setIsSubmitting(false);

    if (result.success) {
      router.push("/login");
      return;
    }
    setServerError(result.message ?? "Si è verificato un errore.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {serverError && (
        <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {serverError}
        </p>
      )}

      <div>
        <Label htmlFor="password">Nuova password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          hasError={!!errors.password}
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Conferma nuova password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          hasError={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
        <FieldError message={errors.confirmPassword?.message} />
      </div>

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Aggiorna password
      </Button>
    </form>
  );
}
