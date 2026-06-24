"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  requestPasswordResetSchema,
  type RequestPasswordResetInput,
} from "@/lib/validations/auth.schema";
import { requestPasswordResetAction } from "@/lib/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function RequestPasswordResetForm() {
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(requestPasswordResetSchema),
  });

  async function onSubmit(values: RequestPasswordResetInput) {
    setIsSubmitting(true);
    const result = await requestPasswordResetAction(values);
    setIsSubmitting(false);
    setFeedback({ ok: result.success, message: result.message ?? "" });
  }

  if (feedback?.ok) {
    return (
      <p className="rounded-xl bg-success-soft px-4 py-3 text-sm text-success">
        {feedback.message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {feedback && !feedback.ok && (
        <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {feedback.message}
        </p>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" hasError={!!errors.email} {...register("email")} />
        <FieldError message={errors.email?.message} />
      </div>

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Invia istruzioni
      </Button>
    </form>
  );
}
