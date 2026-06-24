"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  patientSignUpSchema,
  type PatientSignUpInput,
} from "@/lib/validations/auth.schema";
import { signUpPatientAction } from "@/lib/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Label, FieldError, FieldHint } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function PatientSignUpForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientSignUpInput>({ resolver: zodResolver(patientSignUpSchema) });

  async function onSubmit(values: PatientSignUpInput) {
    setServerError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    const result = await signUpPatientAction(values);
    setIsSubmitting(false);

    if (!result) return; // redirect avvenuto lato server

    if (result.success) {
      setSuccessMessage(result.message ?? "Registrazione completata.");
    } else {
      setServerError(result.message ?? "Si è verificato un errore.");
    }
  }

  if (successMessage) {
    return (
      <p className="rounded-xl bg-success-soft px-4 py-3 text-sm text-success">
        {successMessage}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {serverError && (
        <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {serverError}
        </p>
      )}

      <div>
        <Label htmlFor="fullName">Nome e cognome</Label>
        <Input id="fullName" autoComplete="name" hasError={!!errors.fullName} {...register("fullName")} />
        <FieldError message={errors.fullName?.message} />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" hasError={!!errors.email} {...register("email")} />
        <FieldError message={errors.email?.message} />
      </div>

      <div>
        <Label htmlFor="phone">Telefono (opzionale)</Label>
        <Input id="phone" type="tel" autoComplete="tel" hasError={!!errors.phone} {...register("phone")} />
        <FieldError message={errors.phone?.message} />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          hasError={!!errors.password}
          {...register("password")}
        />
        <FieldHint>Almeno 8 caratteri, con una maiuscola e un numero.</FieldHint>
        <FieldError message={errors.password?.message} />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Conferma password</Label>
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
        Crea account
      </Button>
    </form>
  );
}
