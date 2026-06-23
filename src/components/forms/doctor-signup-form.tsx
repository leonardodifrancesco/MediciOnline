"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  doctorSignUpSchema,
  type DoctorSignUpInput,
} from "@/lib/validations/auth.schema";
import { signUpDoctorAction } from "@/lib/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label, FieldError, FieldHint } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Specialization } from "@/lib/types/database.types";

interface DoctorSignUpFormProps {
  specializations: Pick<Specialization, "id" | "name">[];
}

export function DoctorSignUpForm({ specializations }: DoctorSignUpFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DoctorSignUpInput>({
    resolver: zodResolver(doctorSignUpSchema),
    defaultValues: { consultationType: "both", specializationIds: [] },
  });

  async function onSubmit(values: DoctorSignUpInput) {
    setServerError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    const result = await signUpDoctorAction(values);
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {serverError && (
        <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {serverError}
        </p>
      )}

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-ink">Dati account</legend>

        <div>
          <Label htmlFor="fullName">Nome e cognome</Label>
          <Input id="fullName" autoComplete="name" hasError={!!errors.fullName} {...register("fullName")} />
          <FieldError message={errors.fullName?.message} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" hasError={!!errors.password} {...register("password")} />
            <FieldHint>Almeno 8 caratteri, una maiuscola e un numero.</FieldHint>
            <FieldError message={errors.password?.message} />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Conferma password</Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password" hasError={!!errors.confirmPassword} {...register("confirmPassword")} />
            <FieldError message={errors.confirmPassword?.message} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t border-border pt-5">
        <legend className="text-sm font-semibold text-ink">Profilo professionale</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="licenseNumber">Numero iscrizione all&apos;albo</Label>
            <Input id="licenseNumber" hasError={!!errors.licenseNumber} {...register("licenseNumber")} />
            <FieldError message={errors.licenseNumber?.message} />
          </div>
          <div>
            <Label htmlFor="yearsExperience">Anni di esperienza</Label>
            <Input id="yearsExperience" type="number" min={0} hasError={!!errors.yearsExperience} {...register("yearsExperience")} />
            <FieldError message={errors.yearsExperience?.message} />
          </div>
        </div>

        <div>
          <Label>Specializzazioni</Label>
          <div className="grid gap-2 rounded-xl border border-border bg-paper-dim p-3 sm:grid-cols-2">
            {specializations.map((spec) => (
              <label key={spec.id} className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  value={spec.id}
                  className="size-4 rounded border-border text-primary focus:ring-primary-bright/30"
                  {...register("specializationIds")}
                />
                {spec.name}
              </label>
            ))}
          </div>
          <FieldError message={errors.specializationIds?.message} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="consultationFee">Tariffa per visita (€)</Label>
            <Input id="consultationFee" type="number" min={1} step="0.01" hasError={!!errors.consultationFee} {...register("consultationFee")} />
            <FieldError message={errors.consultationFee?.message} />
          </div>
          <div>
            <Label htmlFor="consultationType">Modalità di consulto</Label>
            <Select id="consultationType" hasError={!!errors.consultationType} {...register("consultationType")}>
              <option value="both">Online e in presenza</option>
              <option value="video">Solo online</option>
              <option value="in_person">Solo in presenza</option>
            </Select>
            <FieldError message={errors.consultationType?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor="city">Città dello studio (opzionale per il solo online)</Label>
          <Input id="city" hasError={!!errors.city} {...register("city")} />
          <FieldError message={errors.city?.message} />
        </div>

        <div>
          <Label htmlFor="bio">Biografia professionale</Label>
          <Textarea id="bio" hasError={!!errors.bio} {...register("bio")} />
          <FieldHint>Sarà visibile sul tuo profilo pubblico: percorso, approccio, ambiti di interesse.</FieldHint>
          <FieldError message={errors.bio?.message} />
        </div>
      </fieldset>

      <p className="text-xs text-ink-faint">
        Dopo la registrazione ti chiederemo di caricare i documenti per la
        verifica dell&apos;albo. Il profilo sarà visibile ai pazienti solo dopo
        l&apos;approvazione del nostro team.
      </p>

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Crea profilo professionale
      </Button>
    </form>
  );
}
